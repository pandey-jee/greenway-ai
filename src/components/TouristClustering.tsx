import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const clustersFallback = [
  { name: "Budget Travelers", value: 35, color: "hsl(175 80% 50%)" },
  { name: "Eco-Travelers", value: 25, color: "hsl(145 65% 45%)" },
  { name: "Luxury Travelers", value: 20, color: "hsl(30 95% 55%)" },
  { name: "Weekend Visitors", value: 20, color: "hsl(270 60% 60%)" },
];

const tooltipStyle = {
  backgroundColor: "hsl(220 18% 10%)",
  border: "1px solid hsl(220 15% 20%)",
  borderRadius: "8px",
  color: "hsl(210 20% 92%)",
  fontSize: "12px",
  fontFamily: "JetBrains Mono",
};

interface ClusterData {
  name: string;
  value: number;
  color?: string;
}

interface TouristClusteringProps {
  data?: ClusterData[];
}

const TouristClustering = ({ data }: TouristClusteringProps) => {
  const clusterColors = [
    "hsl(175 80% 50%)",
    "hsl(145 65% 45%)",
    "hsl(30 95% 55%)",
    "hsl(270 60% 60%)",
  ];

  const clusters = data && data.length > 0
    ? data.map((d, i) => ({
        name: d.name,
        value: d.value,
        color: d.color || clusterColors[i % clusterColors.length],
      }))
    : clustersFallback;
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-foreground font-semibold text-lg mb-1">Tourist Segmentation</h3>
      <p className="text-muted-foreground text-sm mb-5">K-Means clustering analysis</p>

      <div className="flex items-center gap-6">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={clusters}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {clusters.map((c, index) => (
                <Cell key={`${c.name}-${index}`} fill={c.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex-1 space-y-3">
          {clusters.map((c, index) => (
            <div key={`cluster-${index}-${c.name}`} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-foreground text-sm">{c.name}</span>
              </div>
              <span className="text-muted-foreground font-mono text-sm">{c.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TouristClustering;
