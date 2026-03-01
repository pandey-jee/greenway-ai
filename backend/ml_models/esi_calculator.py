import numpy as np
import pandas as pd
import os

class ESICalculator:
    """
    Environmental Stress Index Calculator
    
    ESI = (Tourist_Volume × Avg_Stay_Duration × Waste_Factor) / Infrastructure_Capacity
    
    Score Ranges:
    - 0-40: Low Stress (Green)
    - 41-70: Moderate (Yellow/Orange)
    - 71-100: High Risk (Red)
    """
    
    def __init__(self):
        self.weights = {
            'volume': 0.30,
            'duration': 0.20,
            'waste': 0.25,
            'water_usage': 0.15,
            'carbon': 0.10
        }
        
        # Default waste per tourist per day (kg)
        self.waste_per_tourist_day = 1.5
        
    def calculate_esi(self, location_data=None, location_name='Goa Beach'):
        """
        Calculate ESI score for a location
        
        Args:
            location_data: dict with tourist_volume, avg_duration, capacity
            location_name: name of the location
        
        Returns:
            dict with score, level, and factors
        """
        
        # Use provided data or load from file
        if location_data is None:
            location_data = self._get_location_data(location_name)
        
        tourist_volume = location_data.get('current_tourists', 32400)
        avg_stay = location_data.get('avg_duration_days', 3.2)
        capacity = location_data.get('infrastructure_capacity', 45000)
        waste_factor = location_data.get('waste_factor', 1.8)
        
        # Calculate raw stress score
        # Higher values = more stress
        raw_stress = (tourist_volume * avg_stay * waste_factor) / capacity
        
        # Normalize to 0-100 scale
        # Assuming raw_stress of 5.0 = 100% stress
        esi_score = min(100, (raw_stress / 5.0) * 100)
        
        # Additional factors
        water_stress = self._calculate_water_stress(tourist_volume, capacity)
        carbon_impact = self._calculate_carbon_impact(tourist_volume)
        
        # Weighted final score
        final_score = (
            esi_score * self.weights['volume'] +
            (avg_stay / 10 * 100) * self.weights['duration'] +
            (waste_factor / 3 * 100) * self.weights['waste'] +
            water_stress * self.weights['water_usage'] +
            carbon_impact * self.weights['carbon']
        )
        
        final_score = min(100, max(0, final_score))
        
        return {
            'score': round(final_score, 1),
            'level': self.get_stress_level(final_score),
            'factors': {
                'volume': tourist_volume,
                'duration': avg_stay,
                'waste': waste_factor,
                'capacity': capacity
            },
            'breakdown': {
                'tourist_pressure': round(esi_score, 1),
                'water_stress': round(water_stress, 1),
                'carbon_impact': round(carbon_impact, 1)
            }
        }
    
    def _calculate_water_stress(self, tourists, capacity):
        """Calculate water usage stress (0-100)"""
        # Average 150 liters per tourist per day
        water_usage = tourists * 150
        water_capacity = capacity * 150
        stress = (water_usage / water_capacity) * 100
        return min(100, stress)
    
    def _calculate_carbon_impact(self, tourists):
        """Calculate carbon footprint indicator (0-100)"""
        # Simplified: more tourists = more carbon
        # Scale: 0-50000 tourists -> 0-100 score
        return min(100, (tourists / 50000) * 100)
    
    def get_stress_level(self, score):
        """Get stress level label from score"""
        if score < 40:
            return 'Low Stress'
        elif score < 70:
            return 'Moderate'
        else:
            return 'High Risk'
    
    def _get_location_data(self, location_name):
        """Get data for a specific location"""
        # Try to load from timeseries data
        data_path = '../data/tourist_timeseries.csv'
        
        if os.path.exists(data_path):
            try:
                df = pd.read_csv(data_path)
                loc_data = df[df['location'] == location_name].tail(30)  # Last 30 days
                
                if len(loc_data) > 0:
                    avg_tourists = loc_data['tourist_count'].mean()
                    capacity = loc_data['capacity'].iloc[0]
                    
                    return {
                        'current_tourists': int(avg_tourists),
                        'avg_duration_days': np.random.uniform(2.5, 4.0),
                        'infrastructure_capacity': int(capacity),
                        'waste_factor': np.random.uniform(1.5, 2.2)
                    }
            except Exception as e:
                print(f"Could not load location data: {e}")
        
        # Default fallback data
        return {
            'current_tourists': 32400,
            'avg_duration_days': 3.2,
            'infrastructure_capacity': 45000,
            'waste_factor': 1.8
        }
    
    def calculate_all_locations(self):
        """Calculate ESI for all locations"""
        locations = [
            'Goa Beach', 'Taj Mahal', 'Jaipur Fort', 
            'Kerala Backwaters', 'Hampi Ruins', 'Udaipur Lakes',
            'Rishikesh', 'Munnar Hills'
        ]
        
        results = []
        for loc in locations:
            esi = self.calculate_esi(location_name=loc)
            results.append({
                'location': loc,
                'esi_score': esi['score'],
                'level': esi['level']
            })
        
        return pd.DataFrame(results)

if __name__ == '__main__':
    calculator = ESICalculator()
    
    print("🌍 Environmental Stress Index Calculator")
    print("="*60)
    
    # Calculate for Goa Beach
    esi = calculator.calculate_esi(location_name='Goa Beach')
    
    print(f"\nLocation: Goa Beach")
    print(f"ESI Score: {esi['score']}/100")
    print(f"Stress Level: {esi['level']}")
    print(f"\nContributing Factors:")
    print(f"  Tourist Volume: {esi['factors']['volume']:,}")
    print(f"  Avg Stay Duration: {esi['factors']['duration']:.1f} days")
    print(f"  Waste Factor: {esi['factors']['waste']:.1f}x")
    print(f"  Infrastructure Capacity: {esi['factors']['capacity']:,}")
    
    print(f"\nDetailed Breakdown:")
    print(f"  Tourist Pressure: {esi['breakdown']['tourist_pressure']:.1f}%")
    print(f"  Water Stress: {esi['breakdown']['water_stress']:.1f}%")
    print(f"  Carbon Impact: {esi['breakdown']['carbon_impact']:.1f}%")
    
    # Calculate for all locations
    print("\n📊 ESI Scores for All Locations:")
    print("-"*60)
    all_esi = calculator.calculate_all_locations()
    print(all_esi.to_string(index=False))
