"""
Anomaly Detection for Tourist Patterns
Uses Isolation Forest and Local Outlier Factor to detect unusual tourist behavior
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import StandardScaler
from sklearn.covariance import EllipticEnvelope
import os
import warnings
warnings.filterwarnings('ignore')


class TouristAnomalyDetector:
    """Detect anomalous tourist patterns and unusual congestion"""
    
    def __init__(self, contamination=0.1):
        """
        Args:
            contamination: Expected proportion of outliers (0.1 = 10%)
        """
        self.contamination = contamination
        self.models = {}
        self.scaler = StandardScaler()
        self.feature_names = None
        
    def train_congestion_detector(self, data_path='../data/tourist_timeseries.csv', method='isolation_forest'):
        """
        Train anomaly detector for congestion patterns
        
        Args:
            method: 'isolation_forest', 'lof' (Local Outlier Factor), or 'elliptic'
        """
        if not os.path.exists(data_path):
            print(f"⚠️  Data file not found: {data_path}")
            return False
        
        print(f"\n🔍 Training {method.upper()} for congestion anomalies...")
        
        df = pd.read_csv(data_path)
        df['date'] = pd.to_datetime(df['date'])
        
        # Create features for anomaly detection
        features_df = self._create_congestion_features(df)
        
        self.feature_names = [col for col in features_df.columns 
                             if col not in ['date', 'location', 'is_anomaly']]
        
        X = features_df[self.feature_names].values
        X_scaled = self.scaler.fit_transform(X)
        
        # Train based on method
        if method == 'isolation_forest':
            model = IsolationForest(
                contamination=self.contamination,
                n_estimators=200,
                max_samples='auto',
                random_state=42,
                n_jobs=-1
            )
            predictions = model.fit_predict(X_scaled)
            
        elif method == 'lof':
            model = LocalOutlierFactor(
                contamination=self.contamination,
                n_neighbors=20,
                novelty=True,  # Allow prediction on new data
                n_jobs=-1
            )
            model.fit(X_scaled)
            predictions = model.predict(X_scaled)
            
        elif method == 'elliptic':
            model = EllipticEnvelope(
                contamination=self.contamination,
                random_state=42
            )
            predictions = model.fit_predict(X_scaled)
            
        else:
            print(f"❌ Unknown method: {method}")
            return False
        
        # Store model
        self.models[f'congestion_{method}'] = {
            'model': model,
            'method': method,
            'feature_names': self.feature_names
        }
        
        # Analyze anomalies
        anomalies = predictions == -1
        n_anomalies = np.sum(anomalies)
        
        print(f"   ✅ Detected {n_anomalies} anomalous congestion patterns ({n_anomalies/len(predictions)*100:.1f}%)")
        
        # Show example anomalies
        anomaly_dates = features_df[anomalies][['date', 'location']].head(10)
        if not anomaly_dates.empty:
            print("\n   🚨 Example Anomalies:")
            for _, row in anomaly_dates.iterrows():
                print(f"      • {row['location']} on {row['date'].strftime('%Y-%m-%d')}")
        
        return True
    
    def train_tourist_behavior_detector(self, data_path='../data/tourist_profiles.csv'):
        """Train anomaly detector for unusual tourist behavior"""
        if not os.path.exists(data_path):
            print(f"⚠️  Data file not found: {data_path}")
            return False
        
        print("\n🔍 Training Isolation Forest for tourist behavior anomalies...")
        
        df = pd.read_csv(data_path)
        
        # One-hot encode categorical features
        categorical_features = ['transport_mode', 'accommodation_type', 'group_type']
        df_encoded = pd.get_dummies(df, columns=categorical_features, drop_first=True)
        
        # Select features
        feature_names = ['spending', 'duration_days'] + \
                       [col for col in df_encoded.columns if any(cat in col for cat in categorical_features)]
        
        X = df_encoded[feature_names].values
        X_scaled = self.scaler.fit_transform(X)
        
        # Train Isolation Forest
        model = IsolationForest(
            contamination=self.contamination,
            n_estimators=200,
            max_samples='auto',
            random_state=42,
            n_jobs=-1
        )
        
        predictions = model.fit_predict(X_scaled)
        
        # Store model
        self.models['tourist_behavior'] = {
            'model': model,
            'method': 'isolation_forest',
            'feature_names': feature_names
        }
        
        # Analyze anomalies
        anomalies = predictions == -1
        n_anomalies = np.sum(anomalies)
        
        print(f"   ✅ Detected {n_anomalies} anomalous tourist behaviors ({n_anomalies/len(predictions)*100:.1f}%)")
        
        # Analyze anomalous tourists
        anomaly_tourists = df[anomalies][['spending', 'duration_days']].head(10)
        if not anomaly_tourists.empty:
            print("\n   🚨 Example Anomalous Behaviors:")
            for _, row in anomaly_tourists.iterrows():
                print(f"      • Spending: ₹{row['spending']:.0f}, Duration: {row['duration_days']:.1f} days")
        
        return True
    
    def _create_congestion_features(self, df):
        """Create features for congestion anomaly detection"""
        features = []
        
        for location in df['location'].unique():
            loc_df = df[df['location'] == location].copy()
            loc_df = loc_df.sort_values('date')
            
            # Add temporal features
            loc_df['dayofweek'] = loc_df['date'].dt.dayofweek
            loc_df['month'] = loc_df['date'].dt.month
            loc_df['is_weekend'] = (loc_df['dayofweek'] >= 5).astype(int)
            
            # Add lag features
            loc_df['lag_1'] = loc_df['tourist_count'].shift(1)
            loc_df['lag_7'] = loc_df['tourist_count'].shift(7)
            
            # Rolling statistics
            loc_df['rolling_mean_7'] = loc_df['tourist_count'].rolling(window=7).mean()
            loc_df['rolling_std_7'] = loc_df['tourist_count'].rolling(window=7).std()
            
            # Deviation from mean
            loc_df['deviation_from_mean'] = loc_df['tourist_count'] - loc_df['rolling_mean_7']
            
            # Rate of change
            loc_df['pct_change'] = loc_df['tourist_count'].pct_change()
            
            features.append(loc_df)
        
        result = pd.concat(features, ignore_index=True)
        result = result.dropna()  # Remove NaN from lag/rolling features
        
        return result
    
    def detect_anomalies(self, new_data, detector_type='congestion_isolation_forest'):
        """
        Detect anomalies in new data
        
        Args:
            new_data: DataFrame with features
            detector_type: Which detector to use
            
        Returns:
            Array of predictions (-1 for anomaly, 1 for normal)
        """
        if detector_type not in self.models:
            print(f"❌ No model trained for {detector_type}")
            return None
        
        model_data = self.models[detector_type]
        model = model_data['model']
        feature_names = model_data['feature_names']
        
        X = new_data[feature_names].values
        X_scaled = self.scaler.transform(X)
        
        predictions = model.predict(X_scaled)
        
        return predictions
    
    def get_anomaly_scores(self, new_data, detector_type='congestion_isolation_forest'):
        """
        Get anomaly scores (lower scores = more anomalous)
        
        Returns:
            Array of anomaly scores
        """
        if detector_type not in self.models:
            print(f"❌ No model trained for {detector_type}")
            return None
        
        model_data = self.models[detector_type]
        model = model_data['model']
        feature_names = model_data['feature_names']
        method = model_data['method']
        
        X = new_data[feature_names].values
        X_scaled = self.scaler.transform(X)
        
        if method == 'isolation_forest':
            # Negative scores = anomalies, positive = normal
            scores = model.score_samples(X_scaled)
        elif method == 'lof':
            scores = model.score_samples(X_scaled)
        elif method == 'elliptic':
            scores = model.score_samples(X_scaled)
        else:
            return None
        
        return scores
    
    def generate_anomaly_alerts(self, data_path='../data/tourist_timeseries.csv', threshold=-0.2):
        """
        Generate alerts for recent anomalies
        
        Args:
            threshold: Anomaly score threshold (lower = more anomalous)
            
        Returns:
            List of alert dictionaries
        """
        if 'congestion_isolation_forest' not in self.models:
            print("❌ Congestion detector not trained")
            return []
        
        df = pd.read_csv(data_path)
        df['date'] = pd.to_datetime(df['date'])
        
        # Get last 30 days
        recent_df = df[df['date'] >= df['date'].max() - pd.Timedelta(days=30)].copy()
        
        # Create features
        features_df = self._create_congestion_features(df)
        recent_features = features_df[features_df['date'] >=  features_df['date'].max() - pd.Timedelta(days=30)]
        
        # Get anomaly scores
        scores = self.get_anomaly_scores(recent_features, 'congestion_isolation_forest')
        
        if scores is None:
            return []
        
        # Find anomalies
        anomalies = scores < threshold
        
        alerts = []
        for idx in np.where(anomalies)[0]:
            row = recent_features.iloc[idx]
            alerts.append({
                'date': row['date'].strftime('%Y-%m-%d'),
                'location': row['location'],
                'severity': 'critical' if scores[idx] < threshold * 1.5 else 'warning',
                'type': 'congestion_anomaly',
                'message': f"Unusual congestion pattern detected at {row['location']}",
                'anomaly_score': float(scores[idx])
            })
        
        return sorted(alerts, key=lambda x: x['anomaly_score'])
    
    def save_models(self, output_dir='models/anomaly'):
        """Save trained models"""
        import joblib
        os.makedirs(output_dir, exist_ok=True)
        
        for name, model_data in self.models.items():
            model_path = os.path.join(output_dir, f"{name}.pkl")
            joblib.dump(model_data, model_path)
            print(f"💾 Saved {name} model")
        
        # Save scaler
        scaler_path = os.path.join(output_dir, "scaler.pkl")
        joblib.dump(self.scaler, scaler_path)
    
    def load_models(self, input_dir='models/anomaly'):
        """Load saved models"""
        import joblib
        
        if not os.path.exists(input_dir):
            return False
        
        for filename in os.listdir(input_dir):
            if filename.endswith('.pkl') and filename != 'scaler.pkl':
                name = filename.replace('.pkl', '')
                model_path = os.path.join(input_dir, filename)
                self.models[name] = joblib.load(model_path)
                print(f"✅ Loaded {name} model")
        
        # Load scaler
        scaler_path = os.path.join(input_dir, "scaler.pkl")
        if os.path.exists(scaler_path):
            self.scaler = joblib.load(scaler_path)
        
        return len(self.models) > 0


# Example usage
if __name__ == "__main__":
    detector = TouristAnomalyDetector(contamination=0.1)
    
    # Train congestion anomaly detector
    detector.train_congestion_detector('../data/tourist_timeseries.csv', method='isolation_forest')
    
    # Train tourist behavior anomaly detector
    detector.train_tourist_behavior_detector('../data/tourist_profiles.csv')
    
    # Generate alerts
    alerts = detector.generate_anomaly_alerts()
    if alerts:
        print("\n🚨 Recent Anomaly Alerts:")
        for alert in alerts[:5]:
            print(f"   • [{alert['severity'].upper()}] {alert['message']}")
            print(f"     Date: {alert['date']}, Score: {alert['anomaly_score']:.3f}")
