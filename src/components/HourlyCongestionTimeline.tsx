import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Clock, Users } from 'lucide-react';
import { apiService } from '@/services/api';

const destinations = [
  'Goa Beach',
  'Taj Mahal',
  'Rishikesh',
  'Jaipur Fort',
  'Udaipur Lakes',
  'Kerala Backwaters',
  'Munnar Hills',
  'Hampi Ruins',
];

const HourlyCongestionTimeline = () => {
  const [selectedDestination, setSelectedDestination] = useState<string>('Taj Mahal');

  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['hourly-congestion', selectedDestination],
    queryFn: () => apiService.getHourlyCongestion(selectedDestination),
    enabled: !!selectedDestination,
  });

  const getBarHeight = (percentage: number) => {
    return `${Math.max(percentage, 5)}%`;
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-orange-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBestTimeSlot = () => {
    if (!timelineData || timelineData.length === 0) return null;
    
    const sorted = [...timelineData].sort((a, b) => a.congestion - b.congestion);
    return sorted[0];
  };

  const bestTime = getBestTimeSlot();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Hourly Congestion Timeline</h3>
        </div>
        <Select value={selectedDestination} onValueChange={setSelectedDestination}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {destinations.map((dest) => (
              <SelectItem key={dest} value={dest}>
                {dest}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {bestTime && (
        <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-success" />
            <span className="font-medium text-success">
              Best Time to Visit: {bestTime.hour} ({bestTime.congestion}% congestion)
            </span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-muted-foreground">Loading timeline...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bar Chart */}
          <div className="relative h-56 pt-6">
            <div className="flex items-end justify-between gap-1.5 h-48 border-b border-border pb-2">
              {timelineData && timelineData.map((slot: any) => (
                <div key={slot.hour} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Percentage label above bar */}
                  <div className="text-xs font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {slot.congestion}%
                  </div>
                  {/* Bar */}
                  <div
                    className={`w-full ${getBarColor(slot.congestion)} rounded-t shadow-sm transition-all duration-200 hover:shadow-md group-hover:brightness-110`}
                    style={{ height: getBarHeight(slot.congestion), minHeight: '8px' }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <div className="font-semibold">{slot.hour}</div>
                      <div>{slot.congestion}% congestion</div>
                      <div>{slot.visitors.toLocaleString()} visitors</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Hour labels below chart */}
            <div className="flex items-start justify-between gap-1.5 mt-2">
              {timelineData && timelineData.map((slot: any) => (
                <div key={`label-${slot.hour}`} className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground font-medium">{slot.hour}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded shadow-sm"></div>
              <span className="text-foreground font-medium">Low (0-40%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded shadow-sm"></div>
              <span className="text-foreground font-medium">Moderate (40-60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded shadow-sm"></div>
              <span className="text-foreground font-medium">High (60-80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded shadow-sm"></div>
              <span className="text-foreground font-medium">Critical (80%+)</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default HourlyCongestionTimeline;
