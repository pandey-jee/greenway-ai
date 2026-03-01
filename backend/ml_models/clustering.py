from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np
import joblib
import os

class TouristSegmentation:
    def __init__(self, n_clusters=4):
        self.n_clusters = n_clusters
        self.scaler = StandardScaler()
        self.model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        self.cluster_labels = {
            0: 'Budget Travelers',
            1: 'Eco-Travelers',
            2: 'Luxury Travelers',
            3: 'Weekend Visitors'
        }
        self.cluster_colors = {
            0: 'hsl(175 80% 50%)',
            1: 'hsl(145 65% 45%)',
            2: 'hsl(30 95% 55%)',
            3: 'hsl(270 60% 60%)'
        }
    
    def prepare_features(self, df):
        """Convert categorical to numerical"""
        df = df.copy()
        
        # Encode transport (higher carbon = higher score)
        transport_map = {'train': 1, 'bus': 2, 'bicycle': 1, 'car': 3, 'flight': 4}
        df['transport_score'] = df['transport_mode'].map(transport_map).fillna(2)
        
        # Encode accommodation
        accommodation_map = {'budget': 1, 'mid': 2, 'eco': 3, 'luxury': 4}
        df['accommodation_score'] = df['accommodation_type'].map(accommodation_map).fillna(2)
        
        # Select features
        features = df[['spending_inr', 'duration_days', 'transport_score', 
                      'accommodation_score']].values
        
        return features
    
    def train(self, data_path='../data/tourist_profiles.csv'):
        """Train clustering model"""
        if not os.path.exists(data_path):
            print(f"⚠️  Data file not found: {data_path}")
            print("Please run data_generator.py first")
            return False
            
        df = pd.read_csv(data_path)
        print(f"Training on {len(df)} tourist profiles...")
        
        X = self.prepare_features(df)
        X_scaled = self.scaler.fit_transform(X)
        
        self.model.fit(X_scaled)
        
        # Analyze clusters
        df['cluster'] = self.model.labels_
        self.analyze_clusters(df)
        
        # Save model
        os.makedirs('models', exist_ok=True)
        joblib.dump(self.model, 'models/clustering_model.pkl')
        joblib.dump(self.scaler, 'models/clustering_scaler.pkl')
        print("✅ Model saved to models/")
        return True
    
    def analyze_clusters(self, df):
        """Print cluster characteristics"""
        print("\n📊 Cluster Analysis:")
        print("="*60)
        for cluster in range(self.n_clusters):
            cluster_data = df[df['cluster'] == cluster]
            print(f"\n{self.cluster_labels.get(cluster, f'Cluster {cluster}')}:")
            print(f"  Size: {len(cluster_data)} ({len(cluster_data)/len(df)*100:.1f}%)")
            print(f"  Avg Spending: ₹{cluster_data['spending_inr'].mean():.0f}")
            print(f"  Avg Duration: {cluster_data['duration_days'].mean():.1f} days")
            if 'transport_mode' in cluster_data.columns:
                print(f"  Top Transport: {cluster_data['transport_mode'].mode()[0] if len(cluster_data['transport_mode'].mode()) > 0 else 'N/A'}")
            if 'accommodation_type' in cluster_data.columns:
                print(f"  Top Accommodation: {cluster_data['accommodation_type'].mode()[0] if len(cluster_data['accommodation_type'].mode()) > 0 else 'N/A'}")
    
    def load_models(self):
        """Load pre-trained models"""
        try:
            self.model = joblib.load('models/clustering_model.pkl')
            self.scaler = joblib.load('models/clustering_scaler.pkl')
            return True
        except Exception as e:
            print(f"Could not load models: {e}")
            return False
    
    def predict(self, tourist_data):
        """Predict cluster for new tourist"""
        X = self.prepare_features(tourist_data)
        X_scaled = self.scaler.transform(X)
        cluster = self.model.predict(X_scaled)[0]
        return self.cluster_labels.get(cluster, f'Cluster {cluster}')
    
    def get_distribution(self, data_path='../data/tourist_profiles.csv'):
        """Get current cluster distribution"""
        if not os.path.exists(data_path):
            # Return mock data if file doesn't exist
            return [
                {'name': 'Budget Travelers', 'value': 35, 'color': 'hsl(175 80% 50%)'},
                {'name': 'Eco-Travelers', 'value': 25, 'color': 'hsl(145 65% 45%)'},
                {'name': 'Luxury Travelers', 'value': 20, 'color': 'hsl(30 95% 55%)'},
                {'name': 'Weekend Visitors', 'value': 20, 'color': 'hsl(270 60% 60%)'}
            ]
            
        df = pd.read_csv(data_path)
        X = self.prepare_features(df)
        X_scaled = self.scaler.transform(X)
        labels = self.model.predict(X_scaled)
        
        distribution = []
        for cluster in range(self.n_clusters):
            count = np.sum(labels == cluster)
            percentage = (count / len(labels)) * 100
            distribution.append({
                'name': self.cluster_labels.get(cluster, f'Cluster {cluster}'),
                'value': round(percentage, 1),
                'color': self.cluster_colors.get(cluster, 'hsl(0 0% 50%)')
            })
        
        return distribution

if __name__ == '__main__':
    model = TouristSegmentation()
    if model.train():
        print("\n🎉 Training completed successfully!")
        print("\n📍 Model files saved:")
        print("   - models/clustering_model.pkl")
        print("   - models/clustering_scaler.pkl")
