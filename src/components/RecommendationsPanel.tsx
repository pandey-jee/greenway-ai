import { Leaf, Train, Hotel, Bike, LucideIcon } from "lucide-react";

// No hardcoded recommendations; data must come from API.

const iconMap: Record<string, LucideIcon> = {
  Leaf,
  Train,
  Hotel,
  Bike,
};

interface RecommendationData {
  category: string;
  title: string;
  description: string;
  reasoning: string;
  eco_score: number;
  icon: string;
}

interface RecommendationsPanelProps {
  data?: RecommendationData[];
}

const RecommendationsPanel = ({ data }: RecommendationsPanelProps) => {
  const recommendations = data && data.length > 0
    ? data.map(d => ({
        type: d.category,
        icon: d.icon,
        title: d.title,
        subtitle: d.description,
        reason: d.reasoning,
        ecoScore: d.eco_score,
      }))
    : [];
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-foreground font-semibold text-lg mb-1">Sustainable Recommendations</h3>
      <p className="text-muted-foreground text-sm mb-5">AI-powered eco-friendly alternatives</p>

      <div className="space-y-3">
        {recommendations.length === 0 && (
          <div className="text-center text-muted-foreground py-6">No recommendations available</div>
        )}
        {recommendations.map((r) => {
          const IconComponent = typeof r.icon === "string" ? iconMap[r.icon] || Leaf : r.icon;
          return (
            <div key={r.title} className="p-4 rounded-lg bg-muted/20 border border-border/30 hover:border-success/20 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                    <IconComponent className="w-4.5 h-4.5 text-success" />
                  </div>
                  <div>
                    <span className="text-foreground font-medium text-sm">{r.title}</span>
                    <span className="text-muted-foreground text-xs block">{r.subtitle}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-success/10 border border-success/20">
                  <Leaf className="w-3 h-3 text-success" />
                  <span className="text-success text-xs font-mono font-semibold">{r.ecoScore}</span>
                </div>
              </div>
              <p className="text-muted-foreground text-xs pl-12">{r.reason}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationsPanel;
