interface ESIData {
  score: number;
  level: string;
  factors: {
    volume: number;
    duration: number;
    waste: number;
    capacity: number;
  };
  breakdown?: {
    tourist_pressure: number;
    water_stress: number;
    carbon_impact: number;
  };
}

interface ESIGaugeProps {
  data?: ESIData;
}

const ESIGauge = ({ data }: ESIGaugeProps) => {
  const esiValue = data?.score ?? 72;
  const esiLabel = data?.level ?? (esiValue > 75 ? "High Risk" : esiValue > 50 ? "Moderate" : "Low Stress");
  const esiColor = esiValue > 75 ? "text-destructive" : esiValue > 50 ? "text-warning" : "text-success";
  const esiBg = esiValue > 75 ? "from-destructive/20 to-destructive/5" : esiValue > 50 ? "from-warning/20 to-warning/5" : "from-success/20 to-success/5";
  const esiStroke = esiValue > 75 ? "hsl(0 75% 55%)" : esiValue > 50 ? "hsl(30 95% 55%)" : "hsl(145 65% 45%)";

  const factors = [
    { label: "Tourist Volume", value: data?.factors?.volume?.toLocaleString() ?? "32,400", change: "+12%" },
    { label: "Avg Stay Duration", value: data?.factors?.duration ? `${data.factors.duration.toFixed(1)} days` : "3.2 days", change: "+0.4d" },
    { label: "Waste Factor", value: data?.factors?.waste ? `${data.factors.waste.toFixed(1)}x` : "1.8x", change: "+0.3x" },
    { label: "Infrastructure Cap.", value: data?.factors?.capacity?.toLocaleString() ?? "45,000", change: "—" },
  ];
  const circumference = 2 * Math.PI * 60;
  const dashOffset = circumference - (esiValue / 100) * circumference * 0.75;

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-foreground font-semibold text-lg mb-1">Environmental Stress Index</h3>
      <p className="text-muted-foreground text-sm mb-6">
        ESI = (Volume × Duration × Waste) / Capacity
      </p>

      <div className="flex flex-col items-center mb-6">
        <svg width="160" height="120" viewBox="0 0 160 120">
          {/* Background arc */}
          <circle
            cx="80" cy="90" r="60"
            fill="none"
            stroke="hsl(220 15% 18%)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            transform="rotate(135 80 90)"
          />
          {/* Value arc */}
          <circle
            cx="80" cy="90" r="60"
            fill="none"
            stroke={esiStroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75 - dashOffset} ${circumference - (circumference * 0.75 - dashOffset)}`}
            transform="rotate(135 80 90)"
            style={{ filter: `drop-shadow(0 0 8px ${esiStroke})` }}
          />
        </svg>
        <div className="text-center -mt-10">
          <span className={`text-4xl font-bold font-mono ${esiColor}`}>{esiValue}</span>
          <span className={`block text-sm font-semibold mt-1 ${esiColor}`}>{esiLabel}</span>
        </div>
      </div>

      <div className={`rounded-lg p-4 bg-gradient-to-b ${esiBg}`}>
        <div className="grid grid-cols-2 gap-3">
          {factors.map((f) => (
            <div key={f.label} className="text-center">
              <span className="text-foreground font-mono font-semibold text-sm">{f.value}</span>
              <span className="text-muted-foreground text-xs block">{f.label}</span>
              <span className="text-warning text-xs font-mono">{f.change}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ESIGauge;
