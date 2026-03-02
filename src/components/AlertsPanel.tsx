import { AlertTriangle, CloudRain, Sun, PartyPopper, LucideIcon } from "lucide-react";

// No hardcoded alert data; rely entirely on API results.

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
    : [];

  return (
  <div className="glass-card rounded-xl p-6">
    <h3 className="text-foreground font-semibold text-lg mb-1">Smart Alerts</h3>
    <p className="text-muted-foreground text-sm mb-5">IoT + Weather + Festival signals</p>
    <div className="space-y-2.5">
      {alerts.length === 0 && (
        <div className="text-center text-muted-foreground py-6">No alerts at this time</div>
      )}
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
