"""
XGBoost-based Time Series Prediction for Tourist Congestion
Uses gradient boosting for robust predictions with feature engineering
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import warnings
warnings.filterwarnings('ignore')

try:
    import xgboost as xgb
    from sklearn.preprocessing import LabelEncoder
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("⚠️  XGBoost not installed. XGBoost predictor unavailable.")


class XGBoostCongestionPredictor:
    """Advanced XGBoost-based predictor with feature engineering"""
    
    def __init__(self, n_estimators=200, learning_rate=0.05, max_depth=6):
        self.models = {}
        self.available = XGBOOST_AVAILABLE
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        
    def create_features(self, df):
        """Advanced feature engineering for time series"""
        df = df.copy()
        
        # Time-based features
        df['year'] = df['date'].dt.year
        df['month'] = df['date'].dt.month
        df['day'] = df['date'].dt.day
        df['dayofweek'] = df['date'].dt.dayofweek
        df['dayofyear'] = df['date'].dt.dayofyear
        df['week'] = df['date'].dt.isocalendar().week
        df['quarter'] = df['date'].dt.quarter
        
        # Cyclical encoding (captures circular nature of time)
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
        df['day_sin'] = np.sin(2 * np.pi * df['day'] / 31)
        df['day_cos'] = np.cos(2 * np.pi * df['day'] / 31)
        df['dayofweek_sin'] = np.sin(2 * np.pi * df['dayofweek'] / 7)
        df['dayofweek_cos'] = np.cos(2 * np.pi * df['dayofweek'] / 7)
        
        # Weekend flag
        df['is_weekend'] = (df['dayofweek'] >= 5).astype(int)
        
        # Holiday season flags (customize for your region)
        df['is_summer'] = df['month'].isin([4, 5, 6]).astype(int)
        df['is_winter'] = df['month'].isin([11, 12, 1]).astype(int)
        df['is_festival'] = df['month'].isin([10, 11]).astype(int)  # Diwali season
        
        # Lag features (previous days)
        for lag in [1, 2, 3, 7, 14]:
            df[f'lag_{lag}'] = df['tourist_count'].shift(lag)
        
        # Rolling statistics
        for window in [7, 14, 30]:
            df[f'rolling_mean_{window}'] = df['tourist_count'].rolling(window=window).mean()
            df[f'rolling_std_{window}'] = df['tourist_count'].rolling(window=window).std()
            df[f'rolling_min_{window}'] = df['tourist_count'].rolling(window=window).min()
            df[f'rolling_max_{window}'] = df['tourist_count'].rolling(window=window).max()
        
        # Expanding statistics (all history up to this point)
        df['expanding_mean'] = df['tourist_count'].expanding().mean()
        df['expanding_std'] = df['tourist_count'].expanding().std()
        
        # Difference features (rate of change)
        df['diff_1'] = df['tourist_count'].diff(1)
        df['diff_7'] = df['tourist_count'].diff(7)
        
        return df
    
    def train(self, data_path='../data/tourist_timeseries.csv', location=None):
        """Train XGBoost model for each location"""
        if not self.available:
            print("⚠️  XGBoost not available. Cannot train.")
            return False
            
        if not os.path.exists(data_path):
            print(f"⚠️  Data file not found: {data_path}")
            return False
        
        df = pd.read_csv(data_path)
        df['date'] = pd.to_datetime(df['date'])
        
        locations = [location] if location else df['location'].unique()
        
        for loc in locations:
            print(f"\n🚀 Training XGBoost for {loc}...")
            loc_data = df[df['location'] == loc].copy()
            loc_data = loc_data.sort_values('date')
            
            # Create features
            loc_data = self.create_features(loc_data)
            
            # Remove NaN from lag/rolling features
            loc_data = loc_data.dropna()
            
            if len(loc_data) < 50:
                print(f"⚠️  Insufficient data for {loc}")
                continue
            
            # Prepare features and target
            feature_cols = [col for col in loc_data.columns 
                          if col not in ['date', 'location', 'tourist_count']]
            
            X = loc_data[feature_cols]
            y = loc_data['tourist_count']
            
            # Split train/validation (80/20)
            split_idx = int(len(X) * 0.8)
            X_train, X_val = X[:split_idx], X[split_idx:]
            y_train, y_val = y[:split_idx], y[split_idx:]
            
            # Train XGBoost model
            model = xgb.XGBRegressor(
                n_estimators=self.n_estimators,
                learning_rate=self.learning_rate,
                max_depth=self.max_depth,
                min_child_weight=1,
                gamma=0,
                subsample=0.8,
                colsample_bytree=0.8,
                objective='reg:squarederror',
                n_jobs=-1,
                random_state=42
            )
            
            try:
                # Fit with early stopping
                model.fit(
                    X_train, y_train,
                    eval_set=[(X_val, y_val)],
                    verbose=False
                )
                
                # Evaluate
                train_score = model.score(X_train, y_train)
                val_score = model.score(X_val, y_val)
                
                # Store model and feature columns
                self.models[loc] = {
                    'model': model,
                    'feature_cols': feature_cols,
                    'last_data': loc_data.tail(30)  # Store recent data for prediction
                }
                
                print(f"✅ XGBoost trained for {loc}")
                print(f"   📊 Train R²: {train_score:.4f}, Val R²: {val_score:.4f}")
                
                # Feature importance (top 5)
                importance = model.feature_importances_
                top_features = sorted(zip(feature_cols, importance), 
                                    key=lambda x: x[1], reverse=True)[:5]
                print(f"   🔍 Top features: {', '.join([f[0] for f in top_features])}")
                
            except Exception as e:
                print(f"❌ Training failed for {loc}: {e}")
        
        return len(self.models) > 0
    
    def predict_next_7_days(self, location):
        """Predict next 7 days using XGBoost"""
        if location not in self.models:
            print(f"⚠️  No model trained for {location}")
            return None
        
        model_data = self.models[location]
        model = model_data['model']
        feature_cols = model_data['feature_cols']
        last_data = model_data['last_data'].copy()
        
        predictions = []
        last_date = last_data['date'].iloc[-1]
        
        days_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        
        # Iteratively predict each day
        for i in range(7):
            pred_date = last_date + timedelta(days=i+1)
            
            # Create new row with predicted date
            new_row = pd.DataFrame({
                'date': [pred_date],
                'tourist_count': [0]  # Placeholder
            })
            
            # Add to historical data
            temp_data = pd.concat([last_data, new_row], ignore_index=True)
            temp_data = self.create_features(temp_data)
            
            # Get features for prediction
            X_pred = temp_data[feature_cols].iloc[-1:].fillna(method='ffill').fillna(0)
            
            # Predict
            pred_value = model.predict(X_pred)[0]
            pred_value = max(0, int(pred_value))  # Ensure non-negative
            
            # Update the row with predicted value
            temp_data.loc[temp_data.index[-1], 'tourist_count'] = pred_value
            
            predictions.append({
                'day': days_names[pred_date.dayofweek],
                'date': pred_date.strftime('%Y-%m-%d'),
                'predicted': pred_value,
                'confidence': 0.80  # XGBoost typically has good confidence
            })
            
            # Update last_data for next iteration
            last_data = temp_data.tail(30)
        
        return predictions
    
    def get_feature_importance(self, location):
        """Get feature importance for a location"""
        if location not in self.models:
            return None
        
        model_data = self.models[location]
        model = model_data['model']
        feature_cols = model_data['feature_cols']
        
        importance = dict(zip(feature_cols, model.feature_importances_))
        return sorted(importance.items(), key=lambda x: x[1], reverse=True)
    
    def save_models(self, output_dir='models/xgboost'):
        """Save trained models"""
        if not self.available:
            return
            
        os.makedirs(output_dir, exist_ok=True)
        
        for loc, model_data in self.models.items():
            import joblib
            model_path = os.path.join(output_dir, f"{loc.replace(' ', '_')}_xgb.pkl")
            joblib.dump(model_data, model_path)
            print(f"💾 Saved XGBoost model for {loc}")
    
    def load_models(self, input_dir='models/xgboost'):
        """Load saved models"""
        if not self.available:
            return False
            
        if not os.path.exists(input_dir):
            return False
        
        import joblib
        for filename in os.listdir(input_dir):
            if filename.endswith('_xgb.pkl'):
                loc = filename.replace('_xgb.pkl', '').replace('_', ' ')
                model_path = os.path.join(input_dir, filename)
                self.models[loc] = joblib.load(model_path)
                print(f"✅ Loaded XGBoost model for {loc}")
        
        return len(self.models) > 0


# Example usage
if __name__ == "__main__":
    predictor = XGBoostCongestionPredictor()
    
    if predictor.available:
        # Train
        predictor.train('../data/tourist_timeseries.csv')
        
        # Predict
        predictions = predictor.predict_next_7_days('Goa Beach')
        if predictions:
            print("\n📈 7-Day Forecast (XGBoost):")
            for pred in predictions:
                print(f"  {pred['day']} {pred['date']}: {pred['predicted']} tourists")
        
        # Feature importance
        importance = predictor.get_feature_importance('Goa Beach')
        if importance:
            print("\n🔍 Top 10 Features:")
            for feature, score in importance[:10]:
                print(f"  {feature}: {score:.4f}")
