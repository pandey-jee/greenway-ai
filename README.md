# 🌍 GreenWay AI - Smart Sustainable Tourism Platform

An AI-powered platform for sustainable tourism management that uses machine learning to predict congestion, segment tourists, and provide actionable insights through an interactive map interface.

## 🎯 What It Does

GreenWay AI helps tourism authorities and policymakers make data-driven decisions to prevent over-tourism while protecting environmental resources. The platform combines real-time monitoring, ML predictions, and interactive visualizations to manage tourist destinations sustainably.

## ✨ Key Features

### 🗺️ Interactive Congestion Map
- Real OpenStreetMap integration with Leaflet.js
- Color-coded markers showing congestion levels
- Interactive popups with detailed location info
- Zoom and pan functionality
- 8 major Indian tourist destinations

### 📊 ML-Powered Analytics
- **K-Means Clustering**: Segments tourists into 4 categories
- **Time-Series Prediction**: Forecasts congestion 7 days ahead
- **ESI Calculator**: Measures environmental sustainability
- **Smart Recommendations**: AI-generated alternative destinations

### 📱 Real-Time Dashboard
- Live KPI metrics (tourists, congestion, eco-score, alerts)
- Interactive charts and visualizations
- Auto-refresh every 30 seconds
- Responsive design for all devices

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ with pip
- Node.js 18+ with npm

### 1. Configure Environment Variables
Copy the example file and edit your real keys (in **.env**, not .env.example):
```powershell
copy .env.example .env
# then open .env in your editor and replace placeholders
```
You can supply **any** of the optional real-time API keys (Google Places, TomTom Traffic, OpenWeather, Twitter). If you don't have a Google Places key, just leave it blank and use TomTom or OpenWeather instead; the backend will fall back gracefully to synthetic data.

### 2. Start Backend (Terminal 1)
```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Run Flask API
.\.venv\Scripts\python.exe backend\api\app.py
```
Backend runs on: http://localhost:5000

### 2. Start Frontend (Terminal 2)
```powershell
# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```
Frontend runs on: http://localhost:8080

### 3. Open Dashboard
Navigate to: **http://localhost:8080**

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Leaflet.js for mapping
- Recharts for charts
- TanStack Query for API state

### Backend
- Python + Flask
- scikit-learn (K-Means clustering)
- XGBoost (Time-series prediction)
- Pandas + NumPy (Data processing)
- Flask-CORS (API security)

## 📍 Map Locations

The platform monitors 8 major tourist destinations:
1. Goa Beach (Critical - 92%)
2. Taj Mahal (Critical - 87%)
3. Rishikesh (High - 73%)
4. Jaipur Fort (Moderate - 65%)
5. Udaipur Lakes (Moderate - 55%)
6. Kerala Backwaters (Low - 42%)
7. Munnar Hills (Low - 35%)
8. Hampi Ruins (Low - 28%)

## 📚 API Endpoints

- `GET /api/health` - Server health check
- `GET /api/kpis` - Dashboard metrics
- `GET /api/congestion/weekly` - 7-day predictions
- `GET /api/congestion/seasonal` - Seasonal trends
- `GET /api/clustering/segments` - Tourist segments
- `GET /api/esi/current` - ESI score
- `GET /api/recommendations` - Smart suggestions
- `GET /api/alerts` - Active alerts
- `GET /api/gis/zones` - Map data with congestion

## 📖 Documentation

- **[DEMO_GUIDE.md](DEMO_GUIDE.md)** - Complete presentation guide for faculty demos
- **[COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)** - What was implemented and how
- **[QUICK_START_BACKEND.md](QUICK_START_BACKEND.md)** - Backend setup details
- **[PROJECT_EXPANSION_ROADMAP.md](PROJECT_EXPANSION_ROADMAP.md)** - Future enhancements

## 🎯 Use Cases

1. **Tourism Authorities**: Monitor congestion and deploy resources
2. **Policymakers**: Make data-driven tourism policies
3. **Environmental Agencies**: Track sustainability metrics
4. **Destination Managers**: Optimize visitor distribution

## 🔥 Highlights

- ✅ Full-stack application (Frontend + Backend + ML)
- ✅ Real interactive map with markers
- ✅ Multiple ML models working together
- ✅ Real-time data updates
- ✅ Professional UI/UX design
- ✅ Production-ready code

## 📦 Project Structure

```
green-way-ai/
├── backend/
│   ├── api/
│   │   └── app.py              # Flask API server
│   ├── ml_models/
│   │   ├── clustering.py       # K-Means segmentation
│   │   ├── prediction.py       # Congestion prediction
│   │   └── esi_calculator.py   # ESI calculator
│   ├── models/                 # Trained ML models
│   └── requirements.txt        # Python dependencies
├── src/
│   ├── components/
│   │   ├── InteractiveMap.tsx  # Map with markers ⭐
│   │   ├── Charts.tsx          # Data visualizations
│   │   ├── TouristClustering.tsx
│   │   └── ...
│   ├── pages/
│   │   └── Dashboard.tsx       # Main dashboard
│   └── services/
│       └── api.ts              # Backend integration
├── data/
│   ├── tourist_profiles.csv    # Sample data
│   └── tourist_timeseries.csv
└── package.json                # Node dependencies
```

## 🎓 Learning Outcomes

- Full-stack web development
- Machine learning implementation
- API design and integration
- Data visualization
- Interactive mapping with geolocation
- Real-world problem solving

## 🚧 Future Enhancements

- Mobile app for tourists
- IoT sensor integration
- Advanced NLP for feedback analysis
- Blockchain for transparent tracking
- Multi-language support
- Real-time camera feeds

## 📄 License

This project was created for educational purposes.

## 🙏 Acknowledgments

Built with modern web technologies and open-source ML libraries.

---

**Status**: ✅ Complete and Ready to Demo!
