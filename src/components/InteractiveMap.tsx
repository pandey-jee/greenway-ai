import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface ZoneData {
  name: string;
  lat: number;
  lng: number;
  density: number;
  status: "critical" | "high" | "moderate" | "low";
}

interface InteractiveMapProps {
  data?: ZoneData[];
}

const defaultZones: ZoneData[] = [
  { name: "Goa Beach", density: 92, lat: 15.2993, lng: 73.9512, status: "critical" },
  { name: "Taj Mahal", density: 87, lat: 27.1751, lng: 78.0421, status: "critical" },
  { name: "Jaipur Fort", density: 65, lat: 26.9855, lng: 75.8513, status: "moderate" },
  { name: "Kerala Backwaters", density: 42, lat: 9.4981, lng: 76.3388, status: "low" },
  { name: "Hampi Ruins", density: 28, lat: 15.3350, lng: 76.4600, status: "low" },
  { name: "Udaipur Lakes", density: 55, lat: 24.5854, lng: 73.7125, status: "moderate" },
  { name: "Rishikesh", density: 73, lat: 30.0869, lng: 78.2676, status: "high" },
  { name: "Munnar Hills", density: 35, lat: 10.0889, lng: 77.0595, status: "low" },
];

const InteractiveMap = ({ data }: InteractiveMapProps) => {
  // Normalize data to ensure lng property exists (handle both lng and lon)
  const normalizeZones = (zones: ZoneData[]) => {
    return zones.map(zone => ({
      ...zone,
      lng: zone.lng ?? (zone as any).lon ?? 0,
      lat: zone.lat ?? 0
    }));
  };

  const zones = data && data.length > 0 ? normalizeZones(data) : defaultZones;

  // Center of India
  const centerLat = 20.5937;
  const centerLng = 78.9629;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return '#ef4444'; // red
      case 'high':
        return '#f97316'; // orange
      case 'moderate':
        return '#14b8a6'; // teal
      case 'low':
        return '#22c55e'; // green
      default:
        return '#14b8a6';
    }
  };

  const getCircleRadius = (density: number) => {
    // Scale radius based on density (in meters)
    return density * 1000; // 1000 meters per density point
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-foreground font-semibold text-lg mb-1">
        Interactive Congestion Map
      </h3>
      <p className="text-muted-foreground text-sm mb-4">
        Real-time tourist density with interactive markers
      </p>

      <div className="rounded-lg overflow-hidden border border-border/50" style={{ height: '500px' }}>
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {zones.map((zone, index) => (
            <div key={`${zone.name}-${index}`}>
              {/* Circle overlay showing congestion radius */}
              <Circle
                center={[zone.lat, zone.lng]}
                radius={getCircleRadius(zone.density)}
                pathOptions={{
                  color: getStatusColor(zone.status),
                  fillColor: getStatusColor(zone.status),
                  fillOpacity: 0.3,
                  weight: 2,
                }}
              />

              {/* Marker for the location */}
              <Marker position={[zone.lat, zone.lng]}>
                <Popup>
                  <div className="p-2">
                    <h4 className="font-semibold text-base mb-2">{zone.name}</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Status:</span>{' '}
                        <span
                          className="font-semibold uppercase"
                          style={{ color: getStatusColor(zone.status) }}
                        >
                          {zone.status}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Density:</span> {zone.density}%
                      </p>
                      <p>
                        <span className="font-medium">Coordinates:</span>{' '}
                        {(zone.lat ?? 0).toFixed(4)}°N, {(zone.lng ?? 0).toFixed(4)}°E
                      </p>
                    </div>
                    {zone.status === 'critical' && (
                      <div className="mt-2 p-2 bg-destructive/10 border border-destructive/30 rounded text-destructive text-xs">
                        ⚠️ Critical congestion - immediate action required
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            </div>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {[
          { status: 'critical', label: 'Critical (>85%)', color: '#ef4444' },
          { status: 'high', label: 'High (70-85%)', color: '#f97316' },
          { status: 'moderate', label: 'Moderate (50-70%)', color: '#14b8a6' },
          { status: 'low', label: 'Low (<50%)', color: '#22c55e' },
        ].map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Zone List */}
      <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
        {zones.map((zone, index) => (
          <div
            key={`zone-list-${index}-${zone.name}`}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: getStatusColor(zone.status) }}
              />
              <div>
                <span className="text-foreground text-sm font-medium">{zone.name}</span>
                <span className="text-muted-foreground text-xs block font-mono">
                  {(zone.lat ?? 0).toFixed(4)}°N, {(zone.lng ?? 0).toFixed(4)}°E
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${zone.density}%`,
                    backgroundColor: getStatusColor(zone.status),
                  }}
                />
              </div>
              <span className="text-foreground text-sm font-semibold w-10 text-right">
                {zone.density}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteractiveMap;
