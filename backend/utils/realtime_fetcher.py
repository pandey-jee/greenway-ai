"""
Real-Time Data Fetcher for GreenWay AI
Pulls live data from multiple tourism & location APIs
"""

import os
import requests
import pandas as pd
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RealTimeDataFetcher:
    """Fetch real-time tourism and congestion data from various APIs"""
    
    def __init__(self):
        """Initialize API keys from environment variables"""
        self.google_places_key = os.getenv('GOOGLE_PLACES_API_KEY')
        self.tomtom_key = os.getenv('TOMTOM_API_KEY')
        self.weather_key = os.getenv('OPENWEATHER_API_KEY')
        self.twitter_bearer = os.getenv('TWITTER_BEARER_TOKEN')
        
        # Default locations (Indian tourist destinations)
        self.locations = {
            'Goa Beach': {'lat': 15.2993, 'lon': 73.9512, 'place_id': 'goa', 'type': 'coastal'},
            'Taj Mahal': {'lat': 27.1751, 'lon': 78.0421, 'place_id': 'taj_mahal', 'type': 'heritage'},
            'Jaipur Fort': {'lat': 26.9855, 'lon': 75.8513, 'place_id': 'jaipur_fort', 'type': 'heritage'},
            'Kerala Backwaters': {'lat': 9.4981, 'lon': 76.3388, 'place_id': 'kerala', 'type': 'eco'},
            'Hampi Ruins': {'lat': 15.3350, 'lon': 76.4600, 'place_id': 'hampi', 'type': 'heritage'},
            'Udaipur Lakes': {'lat': 24.5854, 'lon': 73.7125, 'place_id': 'udaipur', 'type': 'heritage'},
            'Rishikesh': {'lat': 30.0869, 'lon': 78.2676, 'place_id': 'rishikesh', 'type': 'spiritual'},
            'Munnar Hills': {'lat': 10.0889, 'lon': 77.0595, 'place_id': 'munnar', 'type': 'eco'},
        }
    
    def get_weather_data(self, lat: float, lon: float) -> Optional[Dict]:
        """Fetch weather data from OpenWeatherMap API"""
        if not self.weather_key:
            logger.warning("OpenWeather API key not configured")
            return None
        
        try:
            url = "https://api.openweathermap.org/data/2.5/weather"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.weather_key,
                'units': 'metric'
            }
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            return {
                'temperature': data['main']['temp'],
                'humidity': data['main']['humidity'],
                'condition': data['weather'][0]['main'],
                'wind_speed': data['wind']['speed'],
                'rainfall': data.get('rain', {}).get('1h', 0)
            }
        except Exception as e:
            logger.error(f"Error fetching weather: {e}")
            return None
    
    def get_google_places_data(self, location_name: str, lat: float, lon: float) -> Optional[Dict]:
        """
        Fetch visitor info from Google Places API
        Requires: GOOGLE_PLACES_API_KEY environment variable
        """
        if not self.google_places_key:
            logger.warning("Google Places API key not configured")
            return None
        
        try:
            # Search for place nearby
            url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
            params = {
                'location': f"{lat},{lon}",
                'radius': 5000,
                'type': 'tourist_attraction',
                'key': self.google_places_key
            }
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            if data['results']:
                place = data['results'][0]
                return {
                    'name': place.get('name', location_name),
                    'rating': place.get('rating', 0),
                    'user_ratings_total': place.get('user_ratings_total', 0),
                    'is_open': place.get('opening_hours', {}).get('open_now', None),
                    'vicinity': place.get('vicinity', '')
                }
            return None
        except Exception as e:
            logger.error(f"Error fetching Google Places data: {e}")
            return None
    
    def get_tomtom_traffic_data(self, lat: float, lon: float) -> Optional[Dict]:
        """
        Fetch traffic/congestion data from TomTom API
        Requires: TOMTOM_API_KEY environment variable
        """
        if not self.tomtom_key:
            logger.warning("TomTom API key not configured")
            return None
        
        try:
            url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
            params = {
                'point': f"{lat},{lon}",
                'key': self.tomtom_key
            }
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            if 'flowSegmentData' in data:
                flow = data['flowSegmentData']
                return {
                    'speed': flow.get('currentSpeed', 0),
                    'free_flow_speed': flow.get('freeFlowSpeed', 0),
                    'current_travel_time': flow.get('currentTravelTime', 0),
                    'congestion_level': self._calculate_congestion_level(
                        flow.get('currentSpeed', 0),
                        flow.get('freeFlowSpeed', 100)
                    )
                }
            return None
        except Exception as e:
            logger.error(f"Error fetching TomTom data: {e}")
            return None
    
    def get_twitter_mentions(self, location_name: str) -> Optional[Dict]:
        """
        Fetch geo-tagged tweets mentioning the location
        Requires: TWITTER_BEARER_TOKEN environment variable
        """
        if not self.twitter_bearer:
            logger.warning("Twitter Bearer token not configured")
            return None
        
        try:
            url = "https://api.twitter.com/2/tweets/search/recent"
            headers = {
                "Authorization": f"Bearer {self.twitter_bearer}",
                "User-Agent": "v2RecentSearchPython"
            }
            params = {
                'query': f"{location_name} -is:retweet",
                'max_results': 100,
                'tweet.fields': 'created_at,public_metrics'
            }
            response = requests.get(url, headers=headers, params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            tweets = data.get('data', [])
            
            if tweets:
                avg_engagement = sum(t['public_metrics']['like_count'] 
                                    for t in tweets) / len(tweets)
                return {
                    'tweet_count': len(tweets),
                    'avg_engagement': avg_engagement,
                    'sentiment': 'positive' if avg_engagement > 5 else 'neutral'
                }
            return None
        except Exception as e:
            logger.error(f"Error fetching Twitter data: {e}")
            return None
    
    def fetch_all_locations_data(self) -> pd.DataFrame:
        """Fetch real-time data for all tourist locations"""
        all_data = []
        
        for location_name, loc_info in self.locations.items():
            lat, lon = loc_info['lat'], loc_info['lon']
            
            logger.info(f"Fetching real-time data for {location_name}...")
            
            location_data = {
                'date': datetime.now(),
                'location': location_name,
                'latitude': lat,
                'longitude': lon,
                'type': loc_info['type'],
                'timestamp': datetime.now().isoformat()
            }
            
            # Fetch weather
            weather = self.get_weather_data(lat, lon)
            if weather:
                location_data.update({
                    f'weather_{k}': v for k, v in weather.items()
                })
            
            # Fetch Google Places data
            places = self.get_google_places_data(location_name, lat, lon)
            if places:
                location_data.update({
                    f'places_{k}': v for k, v in places.items()
                })
            
            # Fetch TomTom traffic
            traffic = self.get_tomtom_traffic_data(lat, lon)
            if traffic:
                location_data.update({
                    f'traffic_{k}': v for k, v in traffic.items()
                })
            
            # Fetch Twitter mentions
            twitter = self.get_twitter_mentions(location_name)
            if twitter:
                location_data.update({
                    f'twitter_{k}': v for k, v in twitter.items()
                })
            
            all_data.append(location_data)
        
        return pd.DataFrame(all_data)
    
    @staticmethod
    def _calculate_congestion_level(current_speed: float, free_flow_speed: float) -> float:
        """Calculate congestion level as percentage"""
        if free_flow_speed == 0:
            return 0
        
        congestion = (1 - (current_speed / free_flow_speed)) * 100
        return max(0, min(100, congestion))
    
    def store_real_time_data(self, filepath: str = '../data/realtime_data.csv'):
        """Fetch and store real-time data to CSV"""
        try:
            df = self.fetch_all_locations_data()
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(filepath) or '.', exist_ok=True)
            
            # Append to existing data or create new
            if os.path.exists(filepath):
                existing_df = pd.read_csv(filepath)
                df = pd.concat([existing_df, df], ignore_index=True)
            
            df.to_csv(filepath, index=False)
            logger.info(f"✅ Real-time data stored to {filepath}")
            
            return df
        except Exception as e:
            logger.error(f"Error storing real-time data: {e}")
            return None


# Fallback: Use synthetic data if APIs not configured
def get_realtime_data_with_fallback() -> pd.DataFrame:
    """
    Try to fetch real-time data, fall back to synthetic if APIs not available
    """
    fetcher = RealTimeDataFetcher()
    
    # Check if all required API keys are present
    api_keys_configured = (
        fetcher.google_places_key or 
        fetcher.tomtom_key or 
        fetcher.weather_key
    )
    
    if api_keys_configured:
        logger.info("📡 Fetching real-time data from APIs...")
        real_data = fetcher.fetch_all_locations_data()
        
        if real_data is not None and len(real_data) > 0:
            logger.info("✅ Real-time data fetched successfully")
            return real_data
    
    logger.warning("⚠️ Real-time APIs not available, using synthetic data fallback")
    # Return synthetic data if APIs fail
    return _get_synthetic_fallback_data()


def _get_synthetic_fallback_data() -> pd.DataFrame:
    """Synthetic data fallback when APIs are not configured"""
    try:
        from utils.data_generator import generate_tourist_data
        logger.info("Using synthetic data generator as fallback...")
        return generate_tourist_data(days=365)
    except ImportError:
        try:
            from backend.utils.data_generator import generate_tourist_data
            logger.info("Using synthetic data generator as fallback...")
            return generate_tourist_data(days=365)
        except ImportError:
            logger.warning("Data generator not available, returning empty DataFrame")
            return pd.DataFrame()
