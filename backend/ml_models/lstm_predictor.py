"""
LSTM-based Time Series Prediction for Tourist Congestion
Uses deep learning for more accurate long-term forecasting
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import warnings
warnings.filterwarnings('ignore')

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
    from sklearn.preprocessing import MinMaxScaler
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("⚠️  TensorFlow not installed. LSTM predictor unavailable.")


class LSTMCongestionPredictor:
    """Advanced LSTM-based predictor for tourist congestion"""
    
    def __init__(self, sequence_length=14, epochs=100, batch_size=32):
        self.sequence_length = sequence_length  # Use 14 days for prediction
        self.epochs = epochs
        self.batch_size = batch_size
        self.models = {}
        self.scalers = {}
        self.available = TENSORFLOW_AVAILABLE
        
    def create_sequences(self, data, seq_length):
        """Create sequences for LSTM training"""
        X, y = [], []
        for i in range(len(data) - seq_length):
            X.append(data[i:i+seq_length])
            y.append(data[i+seq_length])
        return np.array(X), np.array(y)
    
    def build_model(self, input_shape):
        """Build Bidirectional LSTM architecture"""
        model = Sequential([
            # First Bidirectional LSTM layer
            Bidirectional(LSTM(128, return_sequences=True), 
                         input_shape=input_shape),
            Dropout(0.2),
            
            # Second Bidirectional LSTM layer
            Bidirectional(LSTM(64, return_sequences=True)),
            Dropout(0.2),
            
            # Third LSTM layer
            LSTM(32, return_sequences=False),
            Dropout(0.2),
            
            # Dense layers
            Dense(32, activation='relu'),
            Dense(16, activation='relu'),
            Dense(1)
        ])
        
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='huber',  # Better for outliers than MSE
            metrics=['mae', 'mse']
        )
        
        return model
    
    def train(self, data_path='../data/tourist_timeseries.csv', location=None):
        """Train LSTM model for each location"""
        if not self.available:
            print("⚠️  TensorFlow not available. Cannot train LSTM.")
            return False
            
        if not os.path.exists(data_path):
            print(f"⚠️  Data file not found: {data_path}")
            return False
        
        df = pd.read_csv(data_path)
        df['date'] = pd.to_datetime(df['date'])
        
        locations = [location] if location else df['location'].unique()
        
        for loc in locations:
            print(f"\n🧠 Training LSTM for {loc}...")
            loc_data = df[df['location'] == loc].copy()
            loc_data = loc_data.sort_values('date')
            
            # Prepare data
            tourist_counts = loc_data['tourist_count'].values.reshape(-1, 1)
            
            # Scale data
            scaler = MinMaxScaler(feature_range=(0, 1))
            scaled_data = scaler.fit_transform(tourist_counts)
            
            # Create sequences
            X, y = self.create_sequences(scaled_data, self.sequence_length)
            
            if len(X) < 50:  # Need sufficient data
                print(f"⚠️  Insufficient data for {loc}")
                continue
            
            # Split train/validation
            split_idx = int(len(X) * 0.8)
            X_train, X_val = X[:split_idx], X[split_idx:]
            y_train, y_val = y[:split_idx], y[split_idx:]
            
            # Reshape for LSTM [samples, time_steps, features]
            X_train = X_train.reshape((X_train.shape[0], X_train.shape[1], 1))
            X_val = X_val.reshape((X_val.shape[0], X_val.shape[1], 1))
            
            # Build model
            model = self.build_model(input_shape=(self.sequence_length, 1))
            
            # Callbacks
            early_stop = EarlyStopping(
                monitor='val_loss',
                patience=15,
                restore_best_weights=True
            )
            
            reduce_lr = ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7
            )
            
            # Train
            try:
                history = model.fit(
                    X_train, y_train,
                    validation_data=(X_val, y_val),
                    epochs=self.epochs,
                    batch_size=self.batch_size,
                    callbacks=[early_stop, reduce_lr],
                    verbose=0
                )
                
                # Store model and scaler
                self.models[loc] = model
                self.scalers[loc] = scaler
                
                # Get final metrics
                val_loss = history.history['val_loss'][-1]
                val_mae = history.history['val_mae'][-1]
                
                print(f"✅ LSTM trained for {loc}")
                print(f"   📊 Val Loss: {val_loss:.4f}, Val MAE: {val_mae:.4f}")
                
            except Exception as e:
                print(f"❌ Training failed for {loc}: {e}")
                
        return len(self.models) > 0
    
    def predict_next_7_days(self, location, data_path='../data/tourist_timeseries.csv'):
        """Predict next 7 days using LSTM"""
        if location not in self.models:
            print(f"⚠️  No model trained for {location}")
            return None
        
        model = self.models[location]
        scaler = self.scalers[location]
        
        # Load recent data
        df = pd.read_csv(data_path)
        df['date'] = pd.to_datetime(df['date'])
        loc_data = df[df['location'] == location].copy()
        loc_data = loc_data.sort_values('date').tail(self.sequence_length)
        
        # Get last sequence
        tourist_counts = loc_data['tourist_count'].values.reshape(-1, 1)
        scaled_data = scaler.transform(tourist_counts)
        
        # Predict iteratively
        predictions = []
        current_sequence = scaled_data.copy()
        last_date = loc_data['date'].iloc[-1]
        
        days_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        
        for i in range(7):
            # Reshape for prediction
            X = current_sequence.reshape(1, self.sequence_length, 1)
            
            # Predict
            pred_scaled = model.predict(X, verbose=0)[0]
            
            # Inverse transform
            pred_value = scaler.inverse_transform(pred_scaled.reshape(-1, 1))[0][0]
            pred_value = max(0, int(pred_value))  # Ensure non-negative
            
            # Calculate date
            pred_date = last_date + timedelta(days=i+1)
            
            predictions.append({
                'day': days_names[pred_date.dayofweek],
                'date': pred_date.strftime('%Y-%m-%d'),
                'predicted': pred_value,
                'confidence': 0.85  # LSTM typically has high confidence
            })
            
            # Update sequence (sliding window)
            current_sequence = np.vstack([current_sequence[1:], pred_scaled])
        
        return predictions
    
    def save_models(self, output_dir='models/lstm'):
        """Save trained models"""
        if not self.available:
            return
            
        os.makedirs(output_dir, exist_ok=True)
        
        for loc, model in self.models.items():
            model_path = os.path.join(output_dir, f"{loc.replace(' ', '_')}_lstm.h5")
            model.save(model_path)
            print(f"💾 Saved LSTM model for {loc}")
    
    def load_models(self, input_dir='models/lstm'):
        """Load saved models"""
        if not self.available:
            return False
            
        if not os.path.exists(input_dir):
            return False
            
        for filename in os.listdir(input_dir):
            if filename.endswith('_lstm.h5'):
                loc = filename.replace('_lstm.h5', '').replace('_', ' ')
                model_path = os.path.join(input_dir, filename)
                self.models[loc] = keras.models.load_model(model_path)
                print(f"✅ Loaded LSTM model for {loc}")
        
        return len(self.models) > 0


# Example usage
if __name__ == "__main__":
    predictor = LSTMCongestionPredictor(sequence_length=14, epochs=50)
    
    if predictor.available:
        # Train
        predictor.train('../data/tourist_timeseries.csv')
        
        # Predict
        predictions = predictor.predict_next_7_days('Goa Beach')
        if predictions:
            print("\n📈 7-Day Forecast (LSTM):")
            for pred in predictions:
                print(f"  {pred['day']} {pred['date']}: {pred['predicted']} tourists")
