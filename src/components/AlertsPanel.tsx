import { AlertTriangle, CloudRain, Sun, PartyPopper, LucideIcon } from "lucide-react";

const alertsFallback = [
  {
    icon: "AlertTriangle",
    title: "Peak congestion expected",
    detail: "Goa Beach — Sunday, Mar 2",
    severity: "critical" as const,
    time: "2 min ago",
  },
  {
    icon: "PartyPopper",
    title: "Festival surge detected",
    detail: "Holi weekend — +45% predicted",
    severity: "warning" as const,
    time: "15 min ago",
  },
  {
    icon: "CloudRain",
    title: "Rain forecast — load drop",
    detail: "Kerala region — Mon-Wed",
    severity: "info" as const,
    time: "1 hr ago",
  },
  {
    icon: "Sun",
    title: "Clear skies — moderate rise",
    detail: "Rajasthan corridor — +18%",
    severity: "info" as const,
    time: "2 hrs ago",
  },
];

const severityStyles = {
  critical: "border-destructive/30 bg-destructive/5",
  warning: "border-warning/30 bg-warning/5",
  info: "border-primary/20 bg-primary/5",
};

const iconStyles = {
  critical: "text-destructive",
  warning: "text-warning",
  info: "text-primary",
};

const iconMap: Record<string, LucideIcon> = {
  AlertTriangle,
  CloudRain,
  Sun,
  PartyPopper,
};

interface AlertData {
  type: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  timestamp: string;
  icon: string;
}

interface AlertsPanelProps {
  data?: AlertData[];
}

const AlertsPanel = ({ data }: AlertsPanelProps) => {
  const alerts = data && data.length > 0
    ? data.map(d => ({
        icon: d.icon,
        title: d.title,
        detail: d.description,
        severity: d.severity,
        time: d.timestamp,
      }))
    : alertsFallback;

  return (
  <div className="glass-card rounded-xl p-6">
    <h3 className="text-foreground font-semibold text-lg mb-1">Smart Alerts</h3>
    <p className="text-muted-foreground text-sm mb-5">IoT + Weather + Festival signals</p>
    <div className="space-y-2.5">
      {alerts.map((a, i) => {
        const IconComponent = typeof a.icon === "string" ? iconMap[a.icon] || AlertTriangle : a.icon;
        return (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${severityStyles[a.severity]}`}>
            <IconComponent className={`w-4 h-4 mt-0.5 shrink-0 ${iconStyles[a.severity]}`} />
            <div className="flex-1 min-w-0">
              <span className="text-foreground text-sm font-medium block">{a.title}</span>
              <span className="text-muted-foreground text-xs">{a.detail}</span>
            </div>
            <span className="text-muted-foreground text-xs font-mono whitespace-nowrap">{a.time}</span>
          </div>
        );
      })}
    </div>
  </div>
  );
};

export default AlertsPanel;
