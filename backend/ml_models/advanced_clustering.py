"""
Advanced Clustering Models for Tourist Segmentation
Includes DBSCAN, Hierarchical Clustering, and Gaussian Mixture Models
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN, AgglomerativeClustering
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
import os
import warnings
warnings.filterwarnings('ignore')


class AdvancedTouristClustering:
    """Advanced clustering with multiple algorithms"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.models = {}
        self.cluster_labels = None
        self.feature_names = None
        self.method = None  # Track which method was used
        
    def train(self, data_path='../data/tourist_profiles.csv', method='kmeans', n_clusters=4):
        """
        Train clustering model with specified method
        
        Args:
            data_path: Path to tourist profiles data
            method: 'kmeans', 'dbscan', 'hierarchical', 'gmm'
            n_clusters: Number of clusters (for kmeans, hierarchical, gmm)
        """
        if not os.path.exists(data_path):
            print(f"⚠️  Data file not found: {data_path}")
            return False
        
        # Load data
        df = pd.read_csv(data_path)
        
        # Select features for clustering
        numeric_features = ['spending', 'duration_days']
        categorical_features = ['transport_mode', 'accommodation_type', 'group_type']
        
        # One-hot encode categorical features
        df_encoded = pd.get_dummies(df, columns=categorical_features, drop_first=True)
        
        # Get all feature columns (numeric + encoded categorical)
        self.feature_names = [col for col in df_encoded.columns 
                             if col not in ['tourist_id', 'segment', 'visit_date', 
                                          'location_name', 'latitude', 'longitude', 
                                          'source_country']]
        
        X = df_encoded[self.feature_names].values
        
        # Standardize features
        X_scaled = self.scaler.fit_transform(X)
        
        self.method = method
        
        # Train based on method
        if method == 'kmeans':
            return self._train_kmeans(X_scaled, n_clusters, df)
            
        elif method == 'dbscan':
            return self._train_dbscan(X_scaled, df)
            
        elif method == 'hierarchical':
            return self._train_hierarchical(X_scaled, n_clusters, df)
            
        elif method == 'gmm':
            return self._train_gmm(X_scaled, n_clusters, df)
            
        else:
            print(f"❌ Unknown method: {method}")
            return False
    
    def _train_kmeans(self, X_scaled, n_clusters, df):
        """K-Means clustering (baseline)"""
        from sklearn.cluster import KMeans
        
        print(f"\n📊 Training K-Means with {n_clusters} clusters...")
        
        model = KMeans(
            n_clusters=n_clusters,
            init='k-means++',
            n_init=20,
            max_iter=500,
            random_state=42
        )
        
        labels = model.fit_predict(X_scaled)
        self.models['kmeans'] = model
        self.cluster_labels = labels
        
        self._evaluate_clustering(X_scaled, labels, "K-Means")
        self._analyze_segments(df, labels)
        
        return True
    
    def _train_dbscan(self, X_scaled, df):
        """DBSCAN - Density-based clustering (finds arbitrary-shaped clusters)"""
        print("\n🔍 Training DBSCAN (Density-Based)...")
        
        # Find optimal eps using k-distance graph
        from sklearn.neighbors import NearestNeighbors
        
        neighbors = NearestNeighbors(n_neighbors=10)
        neighbors_fit = neighbors.fit(X_scaled)
        distances, indices = neighbors_fit.kneighbors(X_scaled)
        
        # Use 90th percentile of distances as eps
        eps = np.percentile(distances[:, -1], 90)
        
        model = DBSCAN(
            eps=eps,
            min_samples=int(len(X_scaled) * 0.01),  # 1% of data points
            metric='euclidean',
            n_jobs=-1
        )
        
        labels = model.fit_predict(X_scaled)
        
        n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
        n_noise = list(labels).count(-1)
        
        print(f"   🎯 Found {n_clusters} clusters")
        print(f"   🔹 Noise points: {n_noise} ({n_noise/len(labels)*100:.1f}%)")
        
        self.models['dbscan'] = model
        self.cluster_labels = labels
        
        if n_clusters > 1:
            # Only evaluate if we have multiple clusters
            mask = labels != -1  # Exclude noise points
            self._evaluate_clustering(X_scaled[mask], labels[mask], "DBSCAN")
            self._analyze_segments(df, labels)
        else:
            print("   ⚠️  DBSCAN found only one cluster or all noise")
        
        return True
    
    def _train_hierarchical(self, X_scaled, n_clusters, df):
        """Hierarchical clustering (bottom-up approach)"""
        print(f"\n🌳 Training Hierarchical Clustering with {n_clusters} clusters...")
        
        model = AgglomerativeClustering(
            n_clusters=n_clusters,
            linkage='ward',  # Minimizes variance within clusters
            metric='euclidean'
        )
        
        labels = model.fit_predict(X_scaled)
        
        self.models['hierarchical'] = model
        self.cluster_labels = labels
        
        self._evaluate_clustering(X_scaled, labels, "Hierarchical")
        self._analyze_segments(df, labels)
        
        return True
    
    def _train_gmm(self, X_scaled, n_clusters, df):
        """Gaussian Mixture Model (probabilistic clustering)"""
        print(f"\n🎲 Training Gaussian Mixture Model with {n_clusters} components...")
        
        model = GaussianMixture(
            n_components=n_clusters,
            covariance_type='full',
            init_params='kmeans',
            n_init=10,
            random_state=42
        )
        
        model.fit(X_scaled)
        labels = model.predict(X_scaled)
        probs = model.predict_proba(X_scaled)
        
        # Calculate average probability (confidence) for each cluster assignment
        avg_confidence = np.mean([probs[i, labels[i]] for i in range(len(labels))])
        
        print(f"   📊 BIC: {model.bic(X_scaled):.2f}")
        print(f"   📊 AIC: {model.aic(X_scaled):.2f}")
        print(f"   📊 Avg Confidence: {avg_confidence:.3f}")
        
        self.models['gmm'] = model
        self.cluster_labels = labels
        
        self._evaluate_clustering(X_scaled, labels, "GMM")
        self._analyze_segments(df, labels)
        
        return True
    
    def _evaluate_clustering(self, X_scaled, labels, method_name):
        """Evaluate clustering quality with multiple metrics"""
        print(f"\n   📈 Evaluation Metrics for {method_name}:")
        
        # Silhouette Score (higher is better, range -1 to 1)
        silhouette = silhouette_score(X_scaled, labels)
        print(f"      • Silhouette Score: {silhouette:.4f}")
        
        # Davies-Bouldin Index (lower is better)
        db_score = davies_bouldin_score(X_scaled, labels)
        print(f"      • Davies-Bouldin Index: {db_score:.4f}")
        
        # Calinski-Harabasz Index (higher is better)
        ch_score = calinski_harabasz_score(X_scaled, labels)
        print(f"      • Calinski-Harabasz Index: {ch_score:.2f}")
    
    def _analyze_segments(self, df, labels):
        """Analyze characteristics of each segment"""
        df_with_clusters = df.copy()
        df_with_clusters['cluster'] = labels
        
        print("\n   🎯 Segment Analysis:")
        
        segment_names = {
            0: "Budget Travelers",
            1: "Eco-conscious",
            2: "Luxury Seekers",
            3: "Weekend Warriors",
            4: "Adventure Seekers",
            5: "Cultural Explorers",
            -1: "Outliers"
        }
        
        for cluster_id in sorted(df_with_clusters['cluster'].unique()):
            if cluster_id == -1:
                continue  # Skip noise points in DBSCAN
                
            cluster_data = df_with_clusters[df_with_clusters['cluster'] == cluster_id]
            count = len(cluster_data)
            pct = count / len(df) * 100
            
            avg_spending = cluster_data['spending'].mean()
            avg_duration = cluster_data['duration_days'].mean()
            
            # Get most common transport and accommodation
            transport_mode = cluster_data['transport_mode'].mode()[0] if not cluster_data['transport_mode'].empty else 'N/A'
            accommodation = cluster_data['accommodation_type'].mode()[0] if not cluster_data['accommodation_type'].empty else 'N/A'
            
            segment_name = segment_names.get(cluster_id, f"Segment {cluster_id}")
            
            print(f"\n      🔹 {segment_name} ({count} tourists, {pct:.1f}%)")
            print(f"         Avg Spending: ₹{avg_spending:.0f}")
            print(f"         Avg Duration: {avg_duration:.1f} days")
            print(f"         Transport: {transport_mode}")
            print(f"         Accommodation: {accommodation}")
    
    def predict(self, new_data):
        """Predict cluster for new tourist data"""
        if self.method not in self.models:
            print("❌ No model trained")
            return None
        
        model = self.models[self.method]
        
        # Prepare features
        X = new_data[self.feature_names].values
        X_scaled = self.scaler.transform(X)
        
        # Predict
        if self.method == 'gmm':
            labels = model.predict(X_scaled)
            probs = model.predict_proba(X_scaled)
            return labels, probs
        else:
            labels = model.predict(X_scaled)
            return labels
    
    def get_segments_with_percentages(self):
        """Get segment distribution for API response"""
        if self.cluster_labels is None:
            return []
        
        segment_names = {
            0: "Budget Travelers",
            1: "Eco-conscious",
            2: "Luxury Seekers",
            3: "Weekend Warriors",
            4: "Adventure Seekers",
            5: "Cultural Explorers"
        }
        
        unique, counts = np.unique(self.cluster_labels[self.cluster_labels != -1], return_counts=True)
        total = counts.sum()
        
        segments = []
        for cluster_id, count in zip(unique, counts):
            segments.append({
                'segment': segment_names.get(cluster_id, f"Segment {cluster_id}"),
                'count': int(count),
                'percentage': round(count / total * 100, 1)
            })
        
        return segments
    
    def save_model(self, output_path='models/advanced_clustering.pkl'):
        """Save trained model"""
        import joblib
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        model_data = {
            'models': self.models,
            'scaler': self.scaler,
            'cluster_labels': self.cluster_labels,
            'feature_names': self.feature_names,
            'method': self.method
        }
        
        joblib.dump(model_data, output_path)
        print(f"💾 Saved advanced clustering model to {output_path}")
    
    def load_model(self, input_path='models/advanced_clustering.pkl'):
        """Load saved model"""
        import joblib
        
        if not os.path.exists(input_path):
            return False
        
        model_data = joblib.load(input_path)
        self.models = model_data['models']
        self.scaler = model_data['scaler']
        self.cluster_labels = model_data['cluster_labels']
        self.feature_names = model_data['feature_names']
        self.method = model_data['method']
        
        print(f"✅ Loaded advanced clustering model from {input_path}")
        return True


# Example usage
if __name__ == "__main__":
    # Test all methods
    methods = ['kmeans', 'dbscan', 'hierarchical', 'gmm']
    
    for method in methods:
        print(f"\n{'='*70}")
        print(f"Testing {method.upper()}")
        print(f"{'='*70}")
        
        clustering = AdvancedTouristClustering()
        clustering.train('../data/tourist_profiles.csv', method=method, n_clusters=4)
        
        segments = clustering.get_segments_with_percentages()
        print(f"\n📊 API Response Format:")
        for seg in segments:
            print(f"   {seg}")
