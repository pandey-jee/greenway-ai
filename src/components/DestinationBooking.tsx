import { useState } from 'react';
import { Calendar, Users, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useToast } from '@/hooks/use-toast';

interface Destination {
  name: string;
  lat: number;
  lng: number;
  density: number;
  status: 'critical' | 'high' | 'moderate' | 'low';
  bestTime?: string;
  alternativeTime?: string;
  estimatedVisitors?: number;
}

interface DestinationBookingProps {
  destinations?: Destination[];
  loading?: boolean;
}

const DestinationBooking = ({ destinations, loading }: DestinationBookingProps) => {
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [numberOfVisitors, setNumberOfVisitors] = useState<string>('');
  const [bookingResult, setBookingResult] = useState<Destination | null>(null);
  const { toast } = useToast();

  const allDestinations = destinations && destinations.length > 0 ? destinations : [];

  const handleCheckAvailability = () => {
    if (!selectedDestination) return;
    
    const destination = allDestinations.find(d => d.name === selectedDestination);
    if (destination) {
      setBookingResult(destination);
      
      // Show toast notification based on congestion level
      if (destination.status === 'critical') {
        toast({
          variant: 'destructive',
          title: '⚠️ Critical Congestion!',
          description: `${destination.name} is heavily congested (${destination.density}%). Consider alternative times or destinations.`,
        });
      } else if (destination.status === 'low') {
        toast({
          title: '✅ Perfect Time!',
          description: `${destination.name} has low congestion (${destination.density}%). Great choice!`,
        });
      } else if (destination.status === 'high') {
        toast({
          title: '⏰ High Traffic',
          description: `${destination.name} is busy (${destination.density}%). Early morning booking recommended.`,
        });
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'moderate':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return <CheckCircle className="w-5 h-5 text-primary" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'critical':
        return 'Heavily Congested - Consider Alternative';
      case 'high':
        return 'High Traffic - Book Early Time Slot';
      case 'moderate':
        return 'Moderate Traffic - Good to Visit';
      case 'low':
        return 'Low Traffic - Ideal for Visit';
      default:
        return 'Available';
    }
  };

  const getRecommendation = (destination: Destination) => {
    if (destination.status === 'critical') {
      return {
        message: '⚠️ We recommend visiting during off-peak hours or choosing an alternative destination.',
        suggestion: 'Alternative: Consider Hampi Ruins or Kerala Backwaters for a better experience.',
        color: 'bg-destructive/10 border-destructive/30 text-destructive',
      };
    } else if (destination.status === 'high') {
      return {
        message: '⏰ This destination is experiencing high traffic. Book early morning slots.',
        suggestion: `Best Time: ${destination.bestTime} | Alternative: ${destination.alternativeTime}`,
        color: 'bg-warning/10 border-warning/30 text-warning',
      };
    } else if (destination.status === 'moderate') {
      return {
        message: '✓ Good time to visit! Moderate crowd expected.',
        suggestion: `Recommended Time: ${destination.bestTime}`,
        color: 'bg-primary/10 border-primary/30 text-primary',
      };
    } else {
      return {
        message: '✓ Perfect time to visit! Low congestion expected.',
        suggestion: `This is an ideal destination with minimal crowds. ${destination.alternativeTime}`,
        color: 'bg-success/10 border-success/30 text-success',
      };
    }
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-foreground font-semibold text-lg mb-1">
        Check Destination Availability
      </h3>
      <p className="text-muted-foreground text-sm mb-5">
        Select a destination to check real-time congestion and get booking recommendations
      </p>

      {/* Booking Form */}
      <div className="space-y-4 mb-6">
        {loading && (
          <div className="text-center text-muted-foreground">Loading destinations…</div>
        )}
        {!loading && allDestinations.length === 0 && (
          <div className="text-center text-muted-foreground">No destinations available</div>
        )}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Select Destination
          </label>
          <Select value={selectedDestination} onValueChange={setSelectedDestination}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a destination..." />
            </SelectTrigger>
            <SelectContent>
              {allDestinations.map((dest) => (
                <SelectItem key={dest.name} value={dest.name}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {dest.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Date of Visit
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Number of Visitors
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="number"
                value={numberOfVisitors}
                onChange={(e) => setNumberOfVisitors(e.target.value)}
                placeholder="e.g., 2"
                min="1"
                max="50"
                className="w-full pl-10 pr-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleCheckAvailability}
          disabled={!selectedDestination}
          className="w-full"
        >
          Check Availability & Congestion
        </Button>
      </div>

      {/* Results */}
      {bookingResult && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Status Card */}
          <Card className="p-4 border-2">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(bookingResult.status)}
                <div>
                  <h4 className="font-semibold text-foreground">{bookingResult.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {bookingResult.lat.toFixed(4)}°N, {bookingResult.lng.toFixed(4)}°E
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  {bookingResult.density}%
                </div>
                <div className="text-xs text-muted-foreground uppercase">
                  {bookingResult.status}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Status:</span>
              <span className="font-medium text-foreground">
                {getStatusMessage(bookingResult.status)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Expected Visitors Today:</span>
              <span className="font-medium text-foreground">
                ~{bookingResult.estimatedVisitors?.toLocaleString()}
              </span>
            </div>
          </Card>

          {/* Recommendation Card */}
          <Card className={`p-4 border-2 ${getRecommendation(bookingResult).color}`}>
            <div className="space-y-2">
              <p className="font-medium text-sm">
                {getRecommendation(bookingResult).message}
              </p>
              <p className="text-sm opacity-90">
                {getRecommendation(bookingResult).suggestion}
              </p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {bookingResult.status === 'low' || bookingResult.status === 'moderate' ? (
              <Button className="flex-1 bg-success hover:bg-success/90">
                Proceed with Booking
              </Button>
            ) : (
              <Button variant="outline" className="flex-1">
                View Alternative Times
              </Button>
            )}
            <Button variant="outline" onClick={() => setBookingResult(null)}>
              Check Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationBooking;
