from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import sys
import pandas as pd
import logging

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_models.clustering import TouristSegmentation
from ml_models.prediction import CongestionPredictor
from ml_models.esi_calculator import ESICalculator
from utils.realtime_fetcher import RealTimeDataFetcher, get_realtime_data_with_fallback

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:8080,http://localhost:5173').split(',')
CORS(app, resources={
    r"/api/*": {
        "origins": cors_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": False
    }
})

# Initialize ML models
print("\n" + "="*70)
print("🚀 Smart Tourism Backend API - Initializing...")
print("="*70)

clustering_model = TouristSegmentation()
prediction_model = CongestionPredictor()
esi_calculator = ESICalculator()

# Initialize Real-Time Data Fetcher
print("\n📡 Initializing Real-Time Data Fetcher...")
realtime_fetcher = RealTimeDataFetcher()

# Check if API keys are configured
api_keys = {
    'GOOGLE_PLACES_API_KEY': os.getenv('GOOGLE_PLACES_API_KEY'),
    'TOMTOM_API_KEY': os.getenv('TOMTOM_API_KEY'),
    'OPENWEATHER_API_KEY': os.getenv('OPENWEATHER_API_KEY'),
    'TWITTER_BEARER_TOKEN': os.getenv('TWITTER_BEARER_TOKEN')
}

configured_apis = [k for k, v in api_keys.items() if v]
if configured_apis:
    print(f"  ✅ Real-time APIs configured: {', '.join(configured_apis)}")
else:
    print("  ⚠️  No real-time APIs configured - will use synthetic data fallback")
    print("  💡 Set these env vars to enable real-time data:")
    print("     - GOOGLE_PLACES_API_KEY")
    print("     - TOMTOM_API_KEY")
    print("     - OPENWEATHER_API_KEY")
    print("     - TWITTER_BEARER_TOKEN")

# Try to load pre-trained models
models_loaded = False
try:
    print("\n📦 Loading ML models...")
    if clustering_model.load_models():
        print("  ✅ Clustering model loaded")
        models_loaded = True
    else:
        print("  ⚠️  Clustering model not found - will use fallback")
    
    if prediction_model.train():
        print("  ✅ Prediction model loaded")
    else:
        print("  ⚠️  Prediction model not found - will use fallback")
        
except Exception as e:
    print(f"  ⚠️  Could not load models: {e}")
    print("  ℹ️  API will use mock data")

print("\n" + "="*70)

# ==================== Helper Functions ====================

def get_current_kpis():
    """Calculate current KPI values from data"""
    try:
        data_path = '../data/tourist_timeseries.csv'
        if os.path.exists(data_path):
            df = pd.read_csv(data_path)
            df['date'] = pd.to_datetime(df['date'])
            
            # Get today's data (last date in dataset)
            latest_date = df['date'].max()
            today_data = df[df['date'] == latest_date]
            yesterday_data = df[df['date'] == (latest_date - pd.Timedelta(days=1))]
            
            total_tourists = int(today_data['tourist_count'].sum())
            yesterday_tourists = int(yesterday_data['tourist_count'].sum())
            
            # Calculate density as congestion index
            avg_density = today_data['density'].mean()
            yesterday_density = yesterday_data['density'].mean()
            
            # Calculate changes
            tourist_change = ((total_tourists - yesterday_tourists) / yesterday_tourists * 100) if yesterday_tourists > 0 else 0
            congestion_change = avg_density - yesterday_density
            
            return {
                'totalTourists': total_tourists,
                'totalTouristsChange': round(tourist_change, 1),
                'congestionIndex': round(avg_density, 0),
                'congestionIndexChange': round(congestion_change, 1),
                'avgEcoScore': 64,
                'avgEcoScoreChange': 5,
                'activeAlerts': 3,
                'activeAlertsChange': -1
            }
    except Exception as e:
        print(f"Error calculating KPIs: {e}")
    
    # Fallback values
    return {
        'totalTourists': 32419,
        'totalTouristsChange': 12,
        'congestionIndex': 78,
        'congestionIndexChange': 8,
        'avgEcoScore': 64,
        'avgEcoScoreChange': 5,
        'activeAlerts': 3,
        'activeAlertsChange': -2
    }

def get_seasonal_data():
    """Get monthly seasonal analysis"""
    return [
        {'month': 'Jan', 'tourists': 12000, 'stress': 35},
        {'month': 'Feb', 'tourists': 14500, 'stress': 40},
        {'month': 'Mar', 'tourists': 18000, 'stress': 52},
        {'month': 'Apr', 'tourists': 22000, 'stress': 65},
        {'month': 'May', 'tourists': 28000, 'stress': 78},
        {'month': 'Jun', 'tourists': 32000, 'stress': 85},
        {'month': 'Jul', 'tourists': 35000, 'stress': 92},
        {'month': 'Aug', 'tourists': 33000, 'stress': 88},
        {'month': 'Sep', 'tourists': 25000, 'stress': 70},
        {'month': 'Oct', 'tourists': 20000, 'stress': 58},
        {'month': 'Nov', 'tourists': 16000, 'stress': 45},
        {'month': 'Dec', 'tourists': 24000, 'stress': 68}
    ]

# ==================== API Routes ====================

@app.route('/')
def home():
    """Root endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Smart Tourism Backend API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'realtime': {
                'all_locations': '/api/realtime/locations',
                'single_location': '/api/realtime/location/<location_name>',
                'api_status': '/api/realtime/status'
            },
            'analytics': {
                'kpis': '/api/kpis',
                'weekly_congestion': '/api/congestion/weekly',
                'seasonal': '/api/seasonal',
                'clustering': '/api/clustering/segments',
                'esi': '/api/esi/current',
                'recommendations': '/api/recommendations',
                'alerts': '/api/alerts',
                'zones': '/api/gis/zones'
            }
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Backend is running!',
        'models_loaded': models_loaded
    })

@app.route('/api/realtime/locations', methods=['GET'])
def get_realtime_locations():
    """Fetch real-time data for all tourist locations"""
    try:
        logger.info("📡 Fetching real-time location data...")
        
        # Check if we should use real-time APIs or fallback
        use_real_api = request.args.get('real_api', 'true').lower() == 'true'
        
        if use_real_api and any([os.getenv('GOOGLE_PLACES_API_KEY'), 
                                 os.getenv('TOMTOM_API_KEY'),
                                 os.getenv('OPENWEATHER_API_KEY')]):
            # Fetch from real APIs
            df = realtime_fetcher.fetch_all_locations_data()
        else:
            # Use fallback synthetic data
            df = get_realtime_data_with_fallback()
        
        locations = df.to_dict(orient='records')
        
        return jsonify({
            'status': 'success',
            'data_source': 'real-time APIs' if use_real_api else 'synthetic',
            'timestamp': pd.Timestamp.now().isoformat(),
            'locations': locations,
            'count': len(locations)
        })
    except Exception as e:
        logger.error(f"Error fetching real-time locations: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@app.route('/api/realtime/location/<location_name>', methods=['GET'])
def get_realtime_location(location_name):
    """Fetch real-time data for a specific location"""
    try:
        logger.info(f"📡 Fetching real-time data for {location_name}...")
        
        if location_name in realtime_fetcher.locations:
            loc_info = realtime_fetcher.locations[location_name]
            lat, lon = loc_info['lat'], loc_info['lon']
            
            data = {
                'location': location_name,
                'latitude': lat,
                'longitude': lon,
                'type': loc_info['type'],
                'timestamp': pd.Timestamp.now().isoformat()
            }
            
            # Fetch various data sources
            weather = realtime_fetcher.get_weather_data(lat, lon)
            if weather:
                data['weather'] = weather
            
            places = realtime_fetcher.get_google_places_data(location_name, lat, lon)
            if places:
                data['places_info'] = places
            
            traffic = realtime_fetcher.get_tomtom_traffic_data(lat, lon)
            if traffic:
                data['traffic'] = traffic
            
            twitter = realtime_fetcher.get_twitter_mentions(location_name)
            if twitter:
                data['social_media'] = twitter
            
            return jsonify({
                'status': 'success',
                'data': data
            })
        else:
            return jsonify({
                'status': 'error',
                'error': f'Location {location_name} not found'
            }), 404
    except Exception as e:
        logger.error(f"Error fetching location data: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@app.route('/api/realtime/status', methods=['GET'])
def get_realtime_status():
    """Check which real-time APIs are configured and working"""
    try:
        status = {
            'google_places': bool(os.getenv('GOOGLE_PLACES_API_KEY')),
            'tomtom': bool(os.getenv('TOMTOM_API_KEY')),
            'openweather': bool(os.getenv('OPENWEATHER_API_KEY')),
            'twitter': bool(os.getenv('TWITTER_BEARER_TOKEN'))
        }
        
        return jsonify({
            'status': 'success',
            'apis_configured': status,
            'apis_enabled': sum(status.values()),
            'total_apis': len(status),
            'message': 'All real-time APIs configured!' if all(status.values()) else 'Some APIs not configured'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@app.route('/api/kpis', methods=['GET'])
def get_kpis():
    """Return real-time KPIs for dashboard cards"""
    return jsonify(get_current_kpis())

@app.route('/api/congestion/weekly', methods=['GET'])
def get_congestion_weekly():
    """Get weekly congestion data for chart"""
    try:
        data = prediction_model.predict_weekly()
        return jsonify(data)
    except Exception as e:
        print(f"Error in congestion prediction: {e}")
        # Fallback data
        return jsonify([
            {'day': 'Mon', 'actual': 4200, 'predicted': 4100},
            {'day': 'Tue', 'actual': 3800, 'predicted': 3900},
            {'day': 'Wed', 'actual': 5100, 'predicted': 4800},
            {'day': 'Thu', 'actual': 4600, 'predicted': 4700},
            {'day': 'Fri', 'actual': 6200, 'predicted': 6000},
            {'day': 'Sat', 'actual': 8900, 'predicted': 8500},
            {'day': 'Sun', 'actual': 9200, 'predicted': 9400}
        ])

@app.route('/api/congestion/forecast', methods=['GET'])
def get_forecast():
    """Get 7-day forecast for specific location"""
    location = request.args.get('location', 'Goa Beach')
    try:
        forecast = prediction_model.predict_next_7_days(location)
        return jsonify(forecast)
    except Exception as e:
        print(f"Error in forecast: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/seasonal', methods=['GET'])
def get_seasonal():
    """Get monthly seasonal analysis"""
    return jsonify(get_seasonal_data())

@app.route('/api/clustering/segments', methods=['GET'])
def get_tourist_segments():
    """Get K-Means clustering results"""
    try:
        distribution = clustering_model.get_distribution()
        return jsonify(distribution)
    except Exception as e:
        print(f"Error in clustering: {e}")
        # Fallback
        return jsonify([
            {'name': 'Budget Travelers', 'value': 35, 'color': 'hsl(175 80% 50%)'},
            {'name': 'Eco-Travelers', 'value': 25, 'color': 'hsl(145 65% 45%)'},
            {'name': 'Luxury Travelers', 'value': 20, 'color': 'hsl(30 95% 55%)'},
            {'name': 'Weekend Visitors', 'value': 20, 'color': 'hsl(270 60% 60%)'}
        ])

@app.route('/api/esi/current', methods=['GET'])
def get_esi():
    """Calculate Environmental Stress Index"""
    location = request.args.get('location', 'Goa Beach')
    
    try:
        esi_data = esi_calculator.calculate_esi(location_name=location)
        return jsonify(esi_data)
    except Exception as e:
        print(f"Error calculating ESI: {e}")
        return jsonify({
            'score': 72.0,
            'level': 'Moderate',
            'factors': {
                'volume': 32400,
                'duration': 3.2,
                'waste': 1.8,
                'capacity': 45000
            }
        })

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    """Get sustainable recommendations"""
    recommendations = [
        {
            'type': 'Attraction',
            'title': 'Hampi Ruins',
            'subtitle': 'Alternative to Taj Mahal',
            'reason': '87% lower congestion, UNESCO heritage site',
            'ecoScore': 92,
            'icon': 'Leaf'
        },
        {
            'type': 'Hotel',
            'title': 'EcoStay Kerala',
            'subtitle': 'Eco-certified accommodation',
            'reason': 'Solar powered, zero-waste certified',
            'ecoScore': 96,
            'icon': 'Hotel'
        },
        {
            'type': 'Transport',
            'title': 'Konkan Railway',
            'subtitle': 'Scenic rail route',
            'reason': '78% less carbon vs flying, coastal views',
            'ecoScore': 88,
            'icon': 'Train'
        },
        {
            'type': 'Activity',
            'title': 'Munnar Bicycle Tour',
            'subtitle': 'Zero-emission exploration',
            'reason': 'Supports local guides, low environmental impact',
            'ecoScore': 95,
            'icon': 'Bike'
        }
    ]
    return jsonify(recommendations)

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get smart alerts from multiple sources"""
    alerts = [
        {
            'severity': 'critical',
            'title': 'Peak congestion expected',
            'detail': 'Goa Beach — Sunday, Mar 2',
            'time': '2 min ago',
            'icon': 'AlertTriangle'
        },
        {
            'severity': 'warning',
            'title': 'Festival surge detected',
            'detail': 'Holi weekend — +45% predicted',
            'time': '15 min ago',
            'icon': 'PartyPopper'
        },
        {
            'severity': 'info',
            'title': 'Rain forecast — load drop',
            'detail': 'Kerala region — Mon-Wed',
            'time': '1 hr ago',
            'icon': 'CloudRain'
        },
        {
            'severity': 'info',
            'title': 'Clear skies — moderate rise',
            'detail': 'Rajasthan corridor — +18%',
            'time': '2 hrs ago',
            'icon': 'Sun'
        }
    ]
    return jsonify(alerts)

@app.route('/api/gis/zones', methods=['GET'])
def get_gis_zones():
    """Get GIS zones with density data, optionally filtered by country"""
    country_code = request.args.get('country', 'IN')  # Default to India
    
    # Multi-country tourism destination data
    all_destinations = {
        'IN': [  # India
            {'name': 'Goa Beach', 'lat': 15.2993, 'lng': 73.9512, 'density': 92, 'status': 'critical', 'country': 'India'},
            {'name': 'Taj Mahal', 'lat': 27.1751, 'lng': 78.0421, 'density': 87, 'status': 'critical', 'country': 'India'},
            {'name': 'Jaipur Fort', 'lat': 26.9855, 'lng': 75.8513, 'density': 65, 'status': 'moderate', 'country': 'India'},
            {'name': 'Kerala Backwaters', 'lat': 9.4981, 'lng': 76.3388, 'density': 42, 'status': 'low', 'country': 'India'},
            {'name': 'Hampi Ruins', 'lat': 15.3350, 'lng': 76.4600, 'density': 28, 'status': 'low', 'country': 'India'},
            {'name': 'Udaipur Lakes', 'lat': 24.5854, 'lng': 73.7125, 'density': 55, 'status': 'moderate', 'country': 'India'},
            {'name': 'Rishikesh', 'lat': 30.0869, 'lng': 78.2676, 'density': 73, 'status': 'high', 'country': 'India'},
            {'name': 'Munnar Hills', 'lat': 10.0889, 'lng': 77.0595, 'density': 35, 'status': 'low', 'country': 'India'}
        ],
        'US': [  # United States
            {'name': 'Grand Canyon', 'lat': 36.1069, 'lng': -112.1129, 'density': 78, 'status': 'high', 'country': 'United States'},
            {'name': 'Times Square NYC', 'lat': 40.7580, 'lng': -73.9855, 'density': 95, 'status': 'critical', 'country': 'United States'},
            {'name': 'Golden Gate Bridge', 'lat': 37.8199, 'lng': -122.4783, 'density': 68, 'status': 'high', 'country': 'United States'},
            {'name': 'Yellowstone Park', 'lat': 44.4280, 'lng': -110.5885, 'density': 52, 'status': 'moderate', 'country': 'United States'},
            {'name': 'Miami Beach', 'lat': 25.7907, 'lng': -80.1300, 'density': 82, 'status': 'critical', 'country': 'United States'},
            {'name': 'Las Vegas Strip', 'lat': 36.1147, 'lng': -115.1728, 'density': 88, 'status': 'critical', 'country': 'United States'},
            {'name': 'Niagara Falls', 'lat': 43.0828, 'lng': -79.0763, 'density': 62, 'status': 'moderate', 'country': 'United States'},
            {'name': 'Hollywood Sign', 'lat': 34.1341, 'lng': -118.3215, 'density': 45, 'status': 'moderate', 'country': 'United States'}
        ],
        'FR': [  # France
            {'name': 'Eiffel Tower', 'lat': 48.8584, 'lng': 2.2945, 'density': 93, 'status': 'critical', 'country': 'France'},
            {'name': 'Louvre Museum', 'lat': 48.8606, 'lng': 2.3376, 'density': 89, 'status': 'critical', 'country': 'France'},
            {'name': 'Mont Saint-Michel', 'lat': 48.6361, 'lng': -1.5115, 'density': 71, 'status': 'high', 'country': 'France'},
            {'name': 'Palace of Versailles', 'lat': 48.8049, 'lng': 2.1204, 'density': 76, 'status': 'high', 'country': 'France'},
            {'name': 'French Riviera', 'lat': 43.7102, 'lng': 7.2620, 'density': 58, 'status': 'moderate', 'country': 'France'},
            {'name': 'Loire Valley', 'lat': 47.4084, 'lng': 0.7019, 'density': 38, 'status': 'low', 'country': 'France'},
            {'name': 'Provence Lavender', 'lat': 43.9493, 'lng': 5.7248, 'density': 42, 'status': 'moderate', 'country': 'France'},
            {'name': 'Normandy Beaches', 'lat': 49.3407, 'lng': -0.8889, 'density': 33, 'status': 'low', 'country': 'France'}
        ],
        'IT': [  # Italy
            {'name': 'Colosseum Rome', 'lat': 41.8902, 'lng': 12.4922, 'density': 91, 'status': 'critical', 'country': 'Italy'},
            {'name': 'Venice Canals', 'lat': 45.4408, 'lng': 12.3155, 'density': 94, 'status': 'critical', 'country': 'Italy'},
            {'name': 'Florence Duomo', 'lat': 43.7731, 'lng': 11.2560, 'density': 85, 'status': 'critical', 'country': 'Italy'},
            {'name': 'Leaning Tower Pisa', 'lat': 43.7230, 'lng': 10.3966, 'density': 72, 'status': 'high', 'country': 'Italy'},
            {'name': 'Amalfi Coast', 'lat': 40.6340, 'lng': 14.6027, 'density': 67, 'status': 'high', 'country': 'Italy'},
            {'name': 'Cinque Terre', 'lat': 44.1267, 'lng': 9.7163, 'density': 63, 'status': 'moderate', 'country': 'Italy'},
            {'name': 'Lake Como', 'lat': 46.0155, 'lng': 9.2592, 'density': 48, 'status': 'moderate', 'country': 'Italy'},
            {'name': 'Tuscan Countryside', 'lat': 43.3188, 'lng': 11.3307, 'density': 36, 'status': 'low', 'country': 'Italy'}
        ],
        'ES': [  # Spain
            {'name': 'Sagrada Familia', 'lat': 41.4036, 'lng': 2.1744, 'density': 90, 'status': 'critical', 'country': 'Spain'},
            {'name': 'Park Güell', 'lat': 41.4145, 'lng': 2.1527, 'density': 84, 'status': 'critical', 'country': 'Spain'},
            {'name': 'Alhambra Granada', 'lat': 37.1761, 'lng': -3.5881, 'density': 79, 'status': 'high', 'country': 'Spain'},
            {'name': 'Plaza Mayor Madrid', 'lat': 40.4155, 'lng': -3.7074, 'density': 69, 'status': 'high', 'country': 'Spain'},
            {'name': 'Ibiza Beaches', 'lat': 38.9067, 'lng': 1.4206, 'density': 86, 'status': 'critical', 'country': 'Spain'},
            {'name': 'Seville Cathedral', 'lat': 37.3863, 'lng': -5.9925, 'density': 56, 'status': 'moderate', 'country': 'Spain'},
            {'name': 'Camino de Santiago', 'lat': 42.8805, 'lng': -8.5447, 'density': 41, 'status': 'moderate', 'country': 'Spain'},
            {'name': 'Basque Country', 'lat': 43.3183, 'lng': -1.9812, 'density': 34, 'status': 'low', 'country': 'Spain'}
        ],
        'TH': [  # Thailand
            {'name': 'Grand Palace Bangkok', 'lat': 13.7500, 'lng': 100.4915, 'density': 88, 'status': 'critical', 'country': 'Thailand'},
            {'name': 'Phi Phi Islands', 'lat': 7.7407, 'lng': 98.7784, 'density': 92, 'status': 'critical', 'country': 'Thailand'},
            {'name': 'Phuket Beach', 'lat': 7.8804, 'lng': 98.3923, 'density': 83, 'status': 'critical', 'country': 'Thailand'},
            {'name': 'Chiang Mai Old City', 'lat': 18.7883, 'lng': 98.9853, 'density': 59, 'status': 'moderate', 'country': 'Thailand'},
            {'name': 'Ayutthaya Temples', 'lat': 14.3532, 'lng': 100.5773, 'density': 51, 'status': 'moderate', 'country': 'Thailand'},
            {'name': 'Krabi Beaches', 'lat': 8.0863, 'lng': 98.9063, 'density': 64, 'status': 'moderate', 'country': 'Thailand'},
            {'name': 'Pai Valley', 'lat': 19.3581, 'lng': 98.4406, 'density': 29, 'status': 'low', 'country': 'Thailand'},
            {'name': 'Koh Samui', 'lat': 9.5357, 'lng': 100.0630, 'density': 71, 'status': 'high', 'country': 'Thailand'}
        ],
        'JP': [  # Japan
            {'name': 'Tokyo Tower', 'lat': 35.6586, 'lng': 139.7454, 'density': 87, 'status': 'critical', 'country': 'Japan'},
            {'name': 'Mt Fuji', 'lat': 35.3606, 'lng': 138.7274, 'density': 74, 'status': 'high', 'country': 'Japan'},
            {'name': 'Fushimi Inari Kyoto', 'lat': 34.9671, 'lng': 135.7727, 'density': 91, 'status': 'critical', 'country': 'Japan'},
            {'name': 'Osaka Castle', 'lat': 34.6873, 'lng': 135.5262, 'density': 68, 'status': 'high', 'country': 'Japan'},
            {'name': 'Hiroshima Peace Park', 'lat': 34.3955, 'lng': 132.4536, 'density': 47, 'status': 'moderate', 'country': 'Japan'},
            {'name': 'Nara Deer Park', 'lat': 34.6851, 'lng': 135.8048, 'density': 62, 'status': 'moderate', 'country': 'Japan'},
            {'name': 'Hokkaido Lavender', 'lat': 43.3916, 'lng': 142.7680, 'density': 38, 'status': 'low', 'country': 'Japan'},
            {'name': 'Okinawa Beaches', 'lat': 26.2124, 'lng': 127.6809, 'density': 55, 'status': 'moderate', 'country': 'Japan'}
        ],
        'AE': [  # UAE
            {'name': 'Burj Khalifa', 'lat': 25.1972, 'lng': 55.2744, 'density': 85, 'status': 'critical', 'country': 'UAE'},
            {'name': 'Dubai Mall', 'lat': 25.1978, 'lng': 55.2795, 'density': 93, 'status': 'critical', 'country': 'UAE'},
            {'name': 'Palm Jumeirah', 'lat': 25.1124, 'lng': 55.1390, 'density': 77, 'status': 'high', 'country': 'UAE'},
            {'name': 'Sheikh Zayed Mosque', 'lat': 24.4129, 'lng': 54.4754, 'density': 70, 'status': 'high', 'country': 'UAE'},
            {'name': 'Dubai Marina', 'lat': 25.0801, 'lng': 55.1397, 'density': 68, 'status': 'high', 'country': 'UAE'},
            {'name': 'Abu Dhabi Louvre', 'lat': 24.5338, 'lng': 54.3985, 'density': 52, 'status': 'moderate', 'country': 'UAE'},
            {'name': 'Desert Safari Dubai', 'lat': 25.0074, 'lng': 55.5514, 'density': 44, 'status': 'moderate', 'country': 'UAE'},
            {'name': 'Ras Al Khaimah', 'lat': 25.7896, 'lng': 55.9433, 'density': 31, 'status': 'low', 'country': 'UAE'}
        ]
    }
    
    # Return destinations for the requested country
    destinations = all_destinations.get(country_code, all_destinations['IN']).copy()
    
    # For India, fetch REAL traffic data from TomTom
    if country_code == 'IN':
        try:
            # Fetch real-time data for all Indian locations
            realtime_df = realtime_fetcher.fetch_all_locations_data()
            
            if realtime_df is not None and len(realtime_df) > 0:
                # Create a mapping of location names to their real-time data
                realtime_map = {}
                for idx, row in realtime_df.iterrows():
                    location_name = row.get('location', '')
                    if location_name:
                        realtime_map[location_name] = row
                
                # Update destinations with real traffic congestion data from TomTom
                for dest in destinations:
                    location_name = dest['name']
                    if location_name in realtime_map:
                        traffic_data = realtime_map[location_name]
                        # Use TomTom congestion level as density percentage
                        congestion = traffic_data.get('traffic_congestion_level', 0)
                        dest['density'] = int(congestion)
                        
                        # Determine status based on congestion level
                        if congestion >= 85:
                            dest['status'] = 'critical'
                        elif congestion >= 70:
                            dest['status'] = 'high'
                        elif congestion >= 50:
                            dest['status'] = 'moderate'
                        else:
                            dest['status'] = 'low'
                        
                        # Add real-time weather info
                        dest['weather'] = {
                            'temperature': traffic_data.get('weather_temperature', 0),
                            'condition': traffic_data.get('weather_condition', 'Unknown'),
                            'humidity': traffic_data.get('weather_humidity', 0)
                        }
                        dest['traffic_speed'] = traffic_data.get('traffic_speed', 0)
        except Exception as e:
            logging.error(f"Error fetching real-time data for GIS zones: {e}")
            # Fall back to hardcoded data if real-time fetch fails
            pass
    
    return jsonify(destinations)

@app.route('/api/booking/check', methods=['POST'])
def check_booking_availability():
    """Check destination availability and get recommendations"""
    try:
        data = request.get_json()
        destination_name = data.get('destination')
        date = data.get('date')
        visitors = data.get('visitors', 1)
        
        # Get current zones data
        zones_data = get_gis_zones().get_json()
        
        # Find the requested destination
        destination = next((z for z in zones_data if z['name'] == destination_name), None)
        
        if not destination:
            return jsonify({'error': 'Destination not found'}), 404
        
        # Calculate recommendations based on density
        density = destination['density']
        status = destination['status']
        
        if density >= 80:
            recommendation = {
                'canBook': False,
                'message': 'Heavily congested - We recommend choosing an alternative time or destination',
                'bestTime': 'Early Morning (5-7 AM)',
                'alternatives': ['Hampi Ruins', 'Kerala Backwaters', 'Munnar Hills'],
                'estimatedWaitTime': '2-3 hours',
                'color': 'critical'
            }
        elif density >= 60:
            recommendation = {
                'canBook': True,
                'message': 'High traffic expected - Book early morning slot recommended',
                'bestTime': 'Morning (7-10 AM) or Late Evening (5-7 PM)',
                'alternatives': [],
                'estimatedWaitTime': '45-60 minutes',
                'color': 'high'
            }
        elif density >= 40:
            recommendation = {
                'canBook': True,
                'message': 'Good time to visit - Moderate crowd expected',
                'bestTime': 'Anytime during the day',
                'alternatives': [],
                'estimatedWaitTime': '15-30 minutes',
                'color': 'moderate'
            }
        else:
            recommendation = {
                'canBook': True,
                'message': 'Perfect time to visit - Low congestion',
                'bestTime': 'Anytime - Ideal conditions',
                'alternatives': [],
                'estimatedWaitTime': '0-10 minutes',
                'color': 'low'
            }
        
        return jsonify({
            'destination': destination,
            'recommendation': recommendation,
            'bookingDate': date,
            'numberOfVisitors': visitors
        })
        
    except Exception as e:
        print(f"Error checking booking: {e}")
        return jsonify({'error': 'Error processing booking check'}), 500

@app.route('/api/insights', methods=['GET'])
def get_ai_insights():
    """Get AI-powered insights about tourism patterns"""
    try:
        from datetime import datetime
        zones_data = get_gis_zones().get_json()
        
        # Calculate insights
        avg_density = sum(z['density'] for z in zones_data) / len(zones_data)
        critical_zones = [z for z in zones_data if z['density'] >= 80]
        low_zones = [z for z in zones_data if z['density'] < 40]
        
        insights = []
        
        # Insight 1: Overall congestion trend
        insights.append({
            'type': 'trend-up' if avg_density > 60 else 'trend-down',
            'title': 'Overall Tourism Activity',
            'description': f'Average congestion across all destinations is {avg_density:.1f}%',
            'metric': f'{avg_density:.0f}%',
            'change': 12 if avg_density > 60 else -8,
            'recommendation': 'Consider promoting off-peak destinations' if avg_density > 60 else 'Good distribution of tourists'
        })
        
        # Insight 2: Critical zones alert
        if critical_zones:
            insights.append({
                'type': 'warning',
                'title': f'{len(critical_zones)} Critical Congestion Zones',
                'description': f"{', '.join([z['name'] for z in critical_zones[:2]])} need immediate attention",
                'metric': f'{len(critical_zones)} zones',
                'recommendation': 'Redirect tourists to alternative destinations'
            })
        
        # Insight 3: Best destinations right now
        if low_zones:
            insights.append({
                'type': 'time',
                'title': 'Perfect Time to Visit',
                'description': f"{low_zones[0]['name']} has only {low_zones[0]['density']}% congestion",
                'metric': f"{low_zones[0]['density']:.0f}%",
                'recommendation': f'Ideal for peaceful visit to {low_zones[0]["name"]}'
            })
        
        # Insight 4: Peak hour prediction
        insights.append({
            'type': 'trend-up',
            'title': 'Peak Hours Approaching',
            'description': 'Tourist influx expected to increase 20% in next 2 hours',
            'metric': '+20%',
            'change': 20,
            'recommendation': 'Early morning visits recommended for popular sites'
        })
        
        return jsonify(insights)
    except Exception as e:
        print(f"Error generating insights: {e}")
        return jsonify([])

@app.route('/api/congestion/hourly', methods=['GET'])
def get_hourly_congestion():
    """Get hourly congestion predictions for a destination"""
    try:
        destination = request.args.get('destination', 'Taj Mahal')
        
        # Generate hourly predictions (8 AM to 8 PM)
        hours = [
            '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
            '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'
        ]
        
        # Get base density for the destination
        zones_data = get_gis_zones().get_json()
        zone = next((z for z in zones_data if z['name'] == destination), None)
        base_density = zone['density'] if zone else 50
        
        # Generate hourly pattern (peak at 11 AM - 2 PM)
        timeline = []
        for i, hour in enumerate(hours):
            # Morning ramp up, peak at midday, decline in evening
            hour_index = i
            if hour_index < 3:  # 8-10 AM
                factor = 0.6 + (hour_index * 0.1)
            elif hour_index < 6:  # 11 AM - 1 PM
                factor = 0.9 + (0.1 * (hour_index - 3) / 3)
            elif hour_index < 9:  # 2-4 PM
                factor = 1.0 - ((hour_index - 6) * 0.1)
            else:  # 5-8 PM
                factor = 0.7 - ((hour_index - 9) * 0.05)
            
            congestion = min(95, int(base_density * factor))
            visitors = int(congestion * 120)  # Estimate visitors
            
            timeline.append({
                'hour': hour,
                'congestion': congestion,
                'visitors': visitors
            })
        
        return jsonify(timeline)
    except Exception as e:
        print(f"Error generating hourly congestion: {e}")
        return jsonify([])

@app.route('/api/export/dashboard', methods=['GET'])
def export_dashboard_data():
    """Export all dashboard data as JSON"""
    try:
        from datetime import datetime
        export_data = {
            'timestamp': datetime.now().isoformat(),
            'kpis': get_kpis().get_json(),
            'zones': get_gis_zones().get_json(),
            'congestion_weekly': get_congestion_weekly().get_json(),
            'seasonal': get_seasonal_data().get_json(),
            'segments': get_tourist_segments().get_json(),
            'recommendations': get_recommendations().get_json(),
            'alerts': get_alerts().get_json()
        }
        return jsonify(export_data)
    except Exception as e:
        print(f"Error exporting data: {e}")
        return jsonify({'error': 'Error exporting dashboard data'}), 500

# ==================== Error Handlers ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ==================== Main ====================

if __name__ == '__main__':
    host = os.getenv('API_HOST', '0.0.0.0')
    port = int(os.getenv('API_PORT', 5000))
    
    print("\n" + "="*70)
    print("🌍 Smart Tourism Backend API Starting...")
    print("="*70)
    print(f"\n📍 API Server: http://{host}:{port}")
    print("\n📚 Available Endpoints:")
    print("   • GET  /api/health              - Health check")
    print("   • GET  /api/kpis                - Dashboard KPIs")
    print("   • GET  /api/congestion/weekly   - Weekly congestion data")
    print("   • GET  /api/congestion/hourly   - Hourly congestion timeline")
    print("   • GET  /api/congestion/forecast - 7-day forecast")
    print("   • GET  /api/seasonal            - Monthly seasonal data")
    print("   • GET  /api/clustering/segments - Tourist segmentation")
    print("   • GET  /api/esi/current         - Environmental Stress Index")
    print("   • GET  /api/recommendations     - Sustainable recommendations")
    print("   • GET  /api/alerts              - Smart alerts")
    print("   • GET  /api/gis/zones           - GIS heatmap zones")
    print("   • GET  /api/insights            - AI-powered insights")
    print("   • GET  /api/export/dashboard    - Export all data")
    print("   • POST /api/booking/check       - Check destination availability")
    print("\n" + "="*70)
    print("✨ Ready to serve requests!\n")
    
    app.run(
        host=host,
        port=port,
        debug=os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    )
