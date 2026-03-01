import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

const congestionDataFallback = [
  { day: "Mon", actual: 4200, predicted: 4100 },
  { day: "Tue", actual: 3800, predicted: 3900 },
  { day: "Wed", actual: 5100, predicted: 4800 },
  { day: "Thu", actual: 4600, predicted: 4700 },
  { day: "Fri", actual: 6200, predicted: 6000 },
  { day: "Sat", actual: 8900, predicted: 8500 },
  { day: "Sun", actual: 9200, predicted: 9400 },
];

const seasonalDataFallback = [
  { month: "Jan", tourists: 12000, stress: 35 },
  { month: "Feb", tourists: 14500, stress: 40 },
  { month: "Mar", tourists: 18000, stress: 52 },
  { month: "Apr", tourists: 22000, stress: 65 },
  { month: "May", tourists: 28000, stress: 78 },
  { month: "Jun", tourists: 32000, stress: 85 },
  { month: "Jul", tourists: 35000, stress: 92 },
  { month: "Aug", tourists: 33000, stress: 88 },
  { month: "Sep", tourists: 25000, stress: 70 },
  { month: "Oct", tourists: 20000, stress: 58 },
  { month: "Nov", tourists: 16000, stress: 45 },
  { month: "Dec", tourists: 24000, stress: 68 },
];

const customTooltipStyle = {
  backgroundColor: "hsl(220 18% 10%)",
  border: "1px solid hsl(220 15% 20%)",
  borderRadius: "8px",
  color: "hsl(210 20% 92%)",
  fontSize: "12px",
  fontFamily: "JetBrains Mono",
};

interface CongestionChartProps {
  data?: Array<{
    day: string;
    actual: number;
    predicted: number;
  }>;
}

const CongestionChart = ({ data }: CongestionChartProps) => {
  const chartData = data && data.length > 0 ? data : congestionDataFallback;

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-foreground font-semibold text-lg mb-1">Congestion Prediction</h3>
      <p className="text-muted-foreground text-sm mb-6">Actual vs predicted tourist volume (weekly)</p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(175 80% 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(175 80% 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(30 95% 55%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(30 95% 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
          <XAxis dataKey="day" stroke="hsl(215 15% 55%)" fontSize={12} fontFamily="JetBrains Mono" />
          <YAxis stroke="hsl(215 15% 55%)" fontSize={12} fontFamily="JetBrains Mono" />
          <Tooltip contentStyle={customTooltipStyle} />
          <Area type="monotone" dataKey="actual" stroke="hsl(175 80% 50%)" fill="url(#actualGrad)" strokeWidth={2} name="Actual" />
          <Area type="monotone" dataKey="predicted" stroke="hsl(30 95% 55%)" fill="url(#predictedGrad)" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
          <Legend iconType="line" wrapperStyle={{ fontSize: "12px", fontFamily: "JetBrains Mono" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface SeasonalChartProps {
  data?: Array<{
    month: string;
    tourists: number;
    stress: number;
  }>;
}

const SeasonalChart = ({ data }: SeasonalChartProps) => {
  const chartData = data && data.length > 0 ? data : seasonalDataFallback;

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-foreground font-semibold text-lg mb-1">Seasonal Analysis</h3>
      <p className="text-muted-foreground text-sm mb-6">Monthly tourist volume & environmental stress</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
          <XAxis dataKey="month" stroke="hsl(215 15% 55%)" fontSize={11} fontFamily="JetBrains Mono" />
          <YAxis yAxisId="left" stroke="hsl(215 15% 55%)" fontSize={11} fontFamily="JetBrains Mono" />
          <YAxis yAxisId="right" orientation="right" stroke="hsl(215 15% 55%)" fontSize={11} fontFamily="JetBrains Mono" />
          <Tooltip contentStyle={customTooltipStyle} />
          <Bar yAxisId="left" dataKey="tourists" fill="hsl(175 80% 50%)" radius={[4, 4, 0, 0]} opacity={0.8} name="Tourists" />
          <Bar yAxisId="right" dataKey="stress" fill="hsl(30 95% 55%)" radius={[4, 4, 0, 0]} opacity={0.7} name="Stress %" />
          <Legend wrapperStyle={{ fontSize: "12px", fontFamily: "JetBrains Mono" }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export { CongestionChart, SeasonalChart };
