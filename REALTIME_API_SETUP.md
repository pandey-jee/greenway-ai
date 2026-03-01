# 🌐 Real-Time Data Integration Guide

## Overview

GreenWay AI now supports **real-time data** from multiple tourism and location APIs instead of using only synthetic/generated data.

### Current Data Sources

| API | Purpose | Status | Cost |
|-----|---------|--------|------|
| **Google Places API** | Visitor ratings, opening hours, place details | ✅ Integrated | $0 (100K req/month free) |
| **TomTom Traffic API** | Real-time traffic, congestion levels | ✅ Integrated | $0 (2,500 req/day free) |
| **OpenWeather API** | Weather data (affects tourism patterns) | ✅ Integrated | $0 (1M calls/month free) |
| **Twitter API v2** | Geo-tagged posts, tourist sentiment | ✅ Integrated | Free (Academic tier) |

---

## Quick Start (5 minutes)

### If you don't have API keys yet:
**The app works with SYNTHETIC DATA by default** - no setup required! API keys are optional.

To enable real-time:

1. Get **at least one API key** (Google Places is easiest)
2. Add to `.env` file
3. Restart backend
4. Real-time data auto-fetches! 📡

---

## Setup Instructions

### Step 1: Copy Environment Template

```powershell
cd C:\Development\green-way-ai
Copy-Item .env.example .env
```

### Step 2: Get API Keys (Choose At Least One)

#### **Option A: Google Places API** (Easiest - 5 min)

1. Go to: https://console.cloud.google.com/
2. Create a new project
3. Enable: **Places API** and **Maps API**
4. Go to Credentials → Create API Key
5. Copy key to `.env`:
```
GOOGLE_PLACES_API_KEY=YOUR_KEY_HERE
```

**Cost**: Free tier allows 100,000 requests/month

---

#### **Option B: TomTom API** (For traffic data)

1. Go to: https://developer.tomtom.com/user/register
2. Sign up (free account)
3. Get API key from Dashboard
4. Copy to `.env`:
```
TOMTOM_API_KEY=YOUR_KEY_HERE
```

**Cost**: Free tier allows 2,500 requests/day

---

#### **Option C: OpenWeather API** (For weather impact)

1. Go to: https://openweathermap.org/api
2. Sign up
3. Go to API keys section
4. Copy key to `.env`:
```
OPENWEATHER_API_KEY=YOUR_KEY_HERE
```

**Cost**: Free tier allows 1,000,000 calls/month

---

#### **Option D: Twitter API v2** (For social sentiment)

1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Apply for **Academic Research** tier (free) or **Standard** (paid)
3. Create an app
4. Get **Bearer Token** from Keys section
5. Copy to `.env`:
```
TWITTER_BEARER_TOKEN=YOUR_BEARER_TOKEN_HERE
```

**Cost**: Free tier limited, Standard tier from $100/month

---

### Step 3: Restart Backend

```powershell
cd C:\Development\green-way-ai
.\.venv\Scripts\Activate.ps1
python backend\api\app.py
```

You should see:
```
✅ Real-time APIs configured: GOOGLE_PLACES_API_KEY, OPENWEATHER_API_KEY
```

---

## API Endpoints (New)

### Get All Locations (Real-Time)
```
GET /api/realtime/locations
```

**Response**:
```json
{
  "status": "success",
  "data_source": "real-time APIs",
  "timestamp": "2026-03-02T10:30:00",
  "locations": [
    {
      "location": "Taj Mahal",
      "latitude": 27.1751,
      "longitude": 78.0421,
      "weather_temperature": 28.5,
      "weather_condition": "Clear",
      "places_rating": 4.7,
      "places_user_ratings_total": 125000,
      "traffic_congestion_level": 45,
      "twitter_tweet_count": 342
    }
  ]
}
```

### Get Single Location (Real-Time)
```
GET /api/realtime/location/Goa%20Beach
```

### Check API Status
```
GET /api/realtime/status
```

**Response**:
```json
{
  "status": "success",
  "apis_configured": {
    "google_places": true,
    "tomtom": false,
    "openweather": true,
    "twitter": false
  },
  "apis_enabled": 2,
  "total_apis": 4
}
```

---

## Data Flow

```
┌─────────────────────────────────────────┐
│     Real-Time Data Fetcher Module       │
│ (backend/utils/realtime_fetcher.py)     │
│                                         │
├─────────────┬────────────┬──────────┬──────────┤
│  Google     │  TomTom    │ OpenWX   │ Twitter  │
│  Places API │  Traffic   │ API      │ API      │
│  (visitors) │  (traffic) │ (weather)│ (social) │
└─────────────┴────────────┴──────────┴──────────┘
                           ▼
                ┌──────────────────────┐
                │ Real-Time Data       │
                │ CSV Storage (optional)│
                └──────────────────────┘
                           ▼
                ┌──────────────────────┐
                │   Backend API        │
                │ /api/realtime/*      │
                └──────────────────────┘
                           ▼
            ┌─────────────────────────────┐
            │     Frontend Dashboard      │
            │  React + Interactive Maps  │
            └─────────────────────────────┘
```

---

## How It Works

### Without API Keys
- Backend fetches **synthetic data** from CSV
- No API calls made
- ⚡ Fast, no rate limits
- ✅ Dev/testing ready

### With API Keys
- Backend fetches **real data** from APIs
- Combines multiple sources
- 📊 Current, accurate information
- 🌍 Production-ready

### Automatic Fallback
If any API fails or key is invalid:
- Backend automatically falls back to synthetic data
- No errors shown to user
- System continues working

---

## Production Deployment

### On Render (Backend)

1. Go to Render Dashboard
2. Select your `greenway-ai-api` service
3. Go to **Environment** → **Environment Variables**
4. Add your API keys:
```
GOOGLE_PLACES_API_KEY=your_production_key
TOMTOM_API_KEY=your_production_key
OPENWEATHER_API_KEY=your_production_key
TWITTER_BEARER_TOKEN=your_production_token
```
5. Restart service (auto-redeploys)

### On Vercel (Frontend)

Frontend automatically connects to real-time backend via `VITE_API_URL`

---

## Testing Real-Time Data

### Test All APIs
```powershell
# From project root
curl http://localhost:5000/api/realtime/status
```

### Test Specific Location
```powershell
curl "http://localhost:5000/api/realtime/location/Taj%20Mahal"
```

### Test with Python
```python
import requests

response = requests.get('http://localhost:5000/api/realtime/locations')
data = response.json()

for location in data['locations']:
    print(f"{location['location']}: {location.get('weather_temperature', 'N/A')}°C")
```

---

## Troubleshooting

### "APIs not working"
1. Check `.env` file has correct keys
2. Verify API keys are active (not revoked)
3. Check API quotas (you might have hit limits)
4. Look at backend logs for errors

### "Getting synthetic data instead of real"
Check which API keys are configured:
```
GET /api/realtime/status
```

If all `false`, add keys and restart backend.

### "Rate limit exceeded"
- Google Places: 100K req/month free
- TomTom: 2,500 req/day free
- OpenWeather: 1M req/month free

Upgrade plan or wait for reset.

---

## Cost Comparison

| Scenario | Cost |
|----------|------|
| Using all free tiers | **$0** |
| 1M requests/month on Google (paid) | $25 |
| Full production (all APIs) | $50-200/month |
| Synthetic data only | **$0** (but not real-time) |

---

## Data Freshness

- **Real-time APIs**: Fresh every 15-30 minutes
- **Synthetic data**: Static historical patterns
- **Hybrid** (recommended): Use real-time APIs when available, fallback to synthetic

---

## Next Steps

1. ✅ Choose at least one API from above
2. ✅ Get API key
3. ✅ Add to `.env`
4. ✅ Restart backend
5. ✅ Test with `/api/realtime/status`
6. 🚀 Deploy to production

---

## References

- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service/overview)
- [TomTom API Docs](https://developer.tomtom.com/traffic-api/documentation/traffic-flow)
- [OpenWeather API Docs](https://openweathermap.org/api)
- [Twitter API v2 Docs](https://developer.twitter.com/en/docs/twitter-api)

---

**Happy location tracking! 🗺️📍**
