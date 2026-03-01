const zonesFallback = [
  { name: "Goa Beach", density: 92, lat: "15.2993°N", lng: "73.9512°E", status: "critical" as const },
  { name: "Taj Mahal", density: 87, lat: "27.1751°N", lng: "78.0421°E", status: "critical" as const },
  { name: "Jaipur Fort", density: 65, lat: "26.9855°N", lng: "75.8513°E", status: "moderate" as const },
  { name: "Kerala Backwaters", density: 42, lat: "9.4981°N", lng: "76.3388°E", status: "low" as const },
  { name: "Hampi Ruins", density: 28, lat: "15.3350°N", lng: "76.4600°E", status: "low" as const },
  { name: "Udaipur Lakes", density: 55, lat: "24.5854°N", lng: "73.7125°E", status: "moderate" as const },
  { name: "Rishikesh", density: 73, lat: "30.0869°N", lng: "78.2676°E", status: "high" as const },
  { name: "Munnar Hills", density: 35, lat: "10.0889°N", lng: "77.0595°E", status: "low" as const },
];

const statusColors = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-warning/20 text-warning border-warning/30",
  moderate: "bg-primary/20 text-primary border-primary/30",
  low: "bg-success/20 text-success border-success/30",
};

const statusDots = {
  critical: "bg-destructive animate-pulse",
  high: "bg-warning animate-pulse-slow",
  moderate: "bg-primary",
  low: "bg-success",
};

interface ZoneData {
  name: string;
  lat: number;
  lng: number;
  density: number;
  status: "critical" | "high" | "moderate" | "low";
}

interface HeatmapPanelProps {
  data?: ZoneData[];
}

const HeatmapPanel = ({ data }: HeatmapPanelProps) => {
  const zones = data && data.length > 0
    ? data.map(d => ({
        name: d.name,
        density: Math.round(d.density || 0),
        lat: d.lat != null ? `${d.lat.toFixed(4)}°${d.lat >= 0 ? 'N' : 'S'}` : 'N/A',
        lng: d.lng != null ? `${d.lng.toFixed(4)}°${d.lng >= 0 ? 'E' : 'W'}` : 'N/A',
        status: d.status,
      }))
    : zonesFallback;
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-foreground font-semibold text-lg mb-1">GIS Density Heatmap</h3>
      <p className="text-muted-foreground text-sm mb-5">Real-time tourist density by zone</p>

      {/* Simulated map */}
      <div className="relative bg-muted/30 rounded-lg border border-border/50 p-4 mb-5 h-48 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        {zones.map((z, i) => {
          const x = 10 + (i % 4) * 23;
          const y = 15 + Math.floor(i / 4) * 50;
          const size = 8 + (z.density / 100) * 24;
          return (
            <div
              key={`zone-map-${i}-${z.name}`}
              className="absolute rounded-full opacity-60 blur-sm"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor:
                  z.status === "critical" ? "hsl(0 75% 55%)" :
                  z.status === "high" ? "hsl(30 95% 55%)" :
                  z.status === "moderate" ? "hsl(175 80% 50%)" :
                  "hsl(145 65% 45%)",
              }}
            />
          );
        })}
        <span className="absolute bottom-2 right-3 text-muted-foreground/50 text-xs font-mono">Simulated GIS View</span>
      </div>

      <div className="space-y-2.5 max-h-64 overflow-y-auto">
        {zones.map((z, index) => (
          <div key={`zone-list-${index}-${z.name}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${statusDots[z.status]}`} />
              <div>
                <span className="text-foreground text-sm font-medium">{z.name}</span>
                <span className="text-muted-foreground text-xs block font-mono">{z.lat}, {z.lng}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${z.density}%`,
                    backgroundColor:
                      z.status === "critical" ? "hsl(0 75% 55%)" :
                      z.status === "high" ? "hsl(30 95% 55%)" :
                      z.status === "moderate" ? "hsl(175 80% 50%)" :
                      "hsl(145 65% 45%)",
                  }}
                />
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${statusColors[z.status]}`}>
                {z.density}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeatmapPanel;
