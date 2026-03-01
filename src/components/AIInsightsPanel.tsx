import { useQuery } from '@tanstack/react-query';
import { Card } from './ui/card';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Clock } from 'lucide-react';
import { apiService } from '@/services/api';

const AIInsightsPanel = () => {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: apiService.getAIInsights,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
        </div>
        <div className="space-y-3">
          <div className="h-16 bg-muted animate-pulse rounded"></div>
          <div className="h-16 bg-muted animate-pulse rounded"></div>
          <div className="h-16 bg-muted animate-pulse rounded"></div>
        </div>
      </Card>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend-up':
        return <TrendingUp className="w-5 h-5 text-success" />;
      case 'trend-down':
        return <TrendingDown className="w-5 h-5 text-primary" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'time':
        return <Clock className="w-5 h-5 text-indigo-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend-up':
        return 'bg-success/10 border-success/30';
      case 'trend-down':
        return 'bg-primary/10 border-primary/30';
      case 'warning':
        return 'bg-warning/10 border-warning/30';
      case 'time':
        return 'bg-accent/10 border-accent/30';
      default:
        return 'bg-purple-500/10 border-purple-500/30';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
        <span className="ml-auto text-xs text-muted-foreground">Live Updates</span>
      </div>
      
      <div className="space-y-3">
        {insights && insights.length > 0 ? (
          insights.map((insight: any, index: number) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)} transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                  {insight.metric && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">
                        {insight.metric}
                      </span>
                      {insight.change && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            insight.change > 0
                              ? 'bg-success/20 text-success'
                              : 'bg-destructive/20 text-destructive'
                          }`}
                        >
                          {insight.change > 0 ? '+' : ''}
                          {insight.change}%
                        </span>
                      )}
                    </div>
                  )}
                  {insight.recommendation && (
                    <p className="text-xs mt-2 text-purple-600 font-medium">
                      💡 {insight.recommendation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Analyzing data patterns...</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIInsightsPanel;
