import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

def generate_tourist_data(days=365, locations=None):
    """Generate realistic tourist time-series data for testing"""
    
    if locations is None:
        locations = [
            {'name': 'Goa Beach', 'lat': 15.2993, 'lon': 73.9512, 'type': 'coastal', 'capacity': 50000},
            {'name': 'Taj Mahal', 'lat': 27.1751, 'lon': 78.0421, 'type': 'heritage', 'capacity': 40000},
            {'name': 'Jaipur Fort', 'lat': 26.9855, 'lon': 75.8513, 'type': 'heritage', 'capacity': 35000},
            {'name': 'Kerala Backwaters', 'lat': 9.4981, 'lon': 76.3388, 'type': 'eco', 'capacity': 25000},
            {'name': 'Hampi Ruins', 'lat': 15.3350, 'lon': 76.4600, 'type': 'heritage', 'capacity': 20000},
            {'name': 'Udaipur Lakes', 'lat': 24.5854, 'lon': 73.7125, 'type': 'heritage', 'capacity': 30000},
            {'name': 'Rishikesh', 'lat': 30.0869, 'lon': 78.2676, 'type': 'spiritual', 'capacity': 28000},
            {'name': 'Munnar Hills', 'lat': 10.0889, 'lon': 77.0595, 'type': 'eco', 'capacity': 22000},
        ]
    
    data = []
    start_date = datetime.now() - timedelta(days=days)
    
    for day in range(days):
        current_date = start_date + timedelta(days=day)
        month = current_date.month
        day_of_week = current_date.weekday()
        
        # Seasonal multiplier (more tourists in winter and spring)
        if month in [12, 1, 2]:  # Winter
            seasonal_factor = 1.5
        elif month in [3, 4, 5]:  # Spring
            seasonal_factor = 1.3
        elif month in [6, 7, 8]:  # Monsoon
            seasonal_factor = 0.6
        else:  # Autumn
            seasonal_factor = 1.0
        
        # Weekend multiplier
        weekend_factor = 1.4 if day_of_week in [5, 6] else 1.0
        
        # Festival effects (simplified)
        festival_factor = 1.0
        if month == 3 and 10 <= current_date.day <= 15:  # Holi
            festival_factor = 1.45
        elif month == 10 and 20 <= current_date.day <= 25:  # Diwali
            festival_factor = 1.6
        
        for location in locations:
            # Base tourist count varies by location type
            base_tourists = {
                'coastal': 5000,
                'heritage': 3500,
                'eco': 2000,
                'mountain': 2500,
                'spiritual': 3000
            }.get(location['type'], 3000)
            
            # Add randomness and factors
            tourists = int(base_tourists * seasonal_factor * weekend_factor * 
                          festival_factor * random.uniform(0.85, 1.15))
            
            # Calculate density percentage
            density = min(100, (tourists / location['capacity']) * 100)
            
            data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'location': location['name'],
                'tourist_count': tourists,
                'latitude': location['lat'],
                'longitude': location['lon'],
                'type': location['type'],
                'capacity': location['capacity'],
                'density': round(density, 1)
            })
    
    return pd.DataFrame(data)

def generate_tourist_profiles(n=5000):
    """Generate individual tourist profiles for clustering"""
    
    profiles = []
    for i in range(n):
        # Determine tourist segment first
        segment = random.choice(['budget', 'eco', 'luxury', 'weekend'])
        
        if segment == 'budget':
            spending = random.randint(2000, 8000)
            duration = random.choice([1, 2, 3])
            transport = random.choices(['train', 'bus'], weights=[60, 40])[0]
            accommodation = 'budget'
        elif segment == 'eco':
            spending = random.randint(8000, 20000)
            duration = random.choice([4, 5, 7])
            transport = random.choices(['train', 'bus', 'bicycle'], weights=[50, 30, 20])[0]
            accommodation = 'eco'
        elif segment == 'luxury':
            spending = random.randint(30000, 80000)
            duration = random.choice([5, 7, 10, 14])
            transport = random.choices(['flight', 'car'], weights=[70, 30])[0]
            accommodation = 'luxury'
        else:  # weekend
            spending = random.randint(5000, 15000)
            duration = random.choice([2, 3])
            transport = random.choices(['car', 'train'], weights=[60, 40])[0]
            accommodation = random.choice(['budget', 'mid'])
        
        group_type = random.choices(
            ['solo', 'couple', 'family', 'group'],
            weights=[15, 30, 40, 15]
        )[0]
        
        profiles.append({
            'tourist_id': f'T{i:05d}',
            'spending_inr': spending,
            'duration_days': duration,
            'transport_mode': transport,
            'accommodation_type': accommodation,
            'group_type': group_type,
            'segment': segment
        })
    
    return pd.DataFrame(profiles)

if __name__ == '__main__':
    # Create data directory if it doesn't exist
    os.makedirs('../data', exist_ok=True)
    
    # Generate and save data
    print("Generating tourist time-series data...")
    time_data = generate_tourist_data(days=365)
    time_data.to_csv('../data/tourist_timeseries.csv', index=False)
    print(f"✅ Saved {len(time_data)} records to data/tourist_timeseries.csv")
    
    print("\nGenerating tourist profiles...")
    profiles = generate_tourist_profiles(n=5000)
    profiles.to_csv('../data/tourist_profiles.csv', index=False)
    print(f"✅ Saved {len(profiles)} profiles to data/tourist_profiles.csv")
    
    print("\n📊 Sample time-series data:")
    print(time_data.head(10))
    print("\n📊 Sample profiles:")
    print(profiles.head(10))
    print("\n📈 Tourist distribution by segment:")
    print(profiles['segment'].value_counts())
