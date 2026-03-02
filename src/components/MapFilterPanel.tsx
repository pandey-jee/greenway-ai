import React, { useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export interface MapFilters {
  statuses: ('critical' | 'high' | 'moderate' | 'low')[];
  countries: string[];
  minEcoScore: number;
}

interface MapFilterPanelProps {
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  availableCountries?: string[];
}

const MapFilterPanel: React.FC<MapFilterPanelProps> = ({
  filters,
  onFiltersChange,
  availableCountries = ['IN', 'US', 'FR', 'ES', 'IT', 'AU', 'JP', 'BR'],
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const statuses: ('critical' | 'high' | 'moderate' | 'low')[] = [
    'critical',
    'high',
    'moderate',
    'low',
  ];

  const statusColors = {
    critical: 'bg-red-100 text-red-800 hover:bg-red-200',
    high: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    moderate: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    low: 'bg-green-100 text-green-800 hover:bg-green-200',
  };

  const toggleStatus = (status: 'critical' | 'high' | 'moderate' | 'low') => {
    onFiltersChange({
      ...filters,
      statuses: filters.statuses.includes(status)
        ? filters.statuses.filter((s) => s !== status)
        : [...filters.statuses, status],
    });
  };

  const toggleCountry = (country: string) => {
    onFiltersChange({
      ...filters,
      countries: filters.countries.includes(country)
        ? filters.countries.filter((c) => c !== country)
        : [...filters.countries, country],
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      statuses: ['critical', 'high', 'moderate', 'low'],
      countries: [],
      minEcoScore: 0,
    });
  };

  const activeFilterCount =
    (filters.statuses.length < 4 ? 1 : 0) +
    (filters.countries.length > 0 ? 1 : 0) +
    (filters.minEcoScore > 0 ? 1 : 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          size="lg"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>Map Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4 space-y-6 p-4 border rounded-lg bg-muted/30">
        {/* Status Filter */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            Congestion Status
            {filters.statuses.length < 4 && (
              <Badge variant="secondary">{filters.statuses.length}/4</Badge>
            )}
          </h3>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.statuses.includes(status)
                    ? statusColors[status]
                    : 'bg-gray-200 text-gray-600 opacity-50 hover:opacity-75'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Country Filter */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            Countries
            {filters.countries.length > 0 && (
              <Badge variant="secondary">{filters.countries.length}</Badge>
            )}
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {availableCountries.map((country) => (
              <button
                key={country}
                onClick={() => toggleCountry(country)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  filters.countries.includes(country)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border border-border hover:border-primary'
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        {/* Eco Score Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Minimum Eco Score</h3>
            <Badge variant="secondary">{filters.minEcoScore}</Badge>
          </div>
          <Slider
            value={[filters.minEcoScore]}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, minEcoScore: value[0] })
            }
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Low (0)</span>
            <span>High (100)</span>
          </div>
        </div>

        {/* Reset Button */}
        <div>
          <Button
            onClick={resetFilters}
            variant="secondary"
            className="w-full"
            size="sm"
          >
            Reset All Filters
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default MapFilterPanel;
