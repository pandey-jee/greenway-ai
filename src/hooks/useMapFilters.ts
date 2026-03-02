import { useMemo } from 'react';
import { MapFilters } from '@/components/MapFilterPanel';

export interface Zone {
  id: string;
  name: string;
  country?: string;
  status: 'critical' | 'high' | 'moderate' | 'low';
  ecoScore?: number;
  lat?: number;
  lng?: number;
  touristCount?: number;
  capacityUtilization?: number;
  [key: string]: unknown;
}

/**
 * Hook to apply map filters to a list of zones
 * Filters by status, country, and minimum eco score
 */
export const useMapFilters = (zones: Zone[], filters: MapFilters): Zone[] => {
  return useMemo(() => {
    if (!zones) return [];

    return zones.filter((zone) => {
      // Filter by status
      if (
        !filters.statuses.includes(zone.status)
      ) {
        return false;
      }

      // Filter by country
      if (
        filters.countries.length > 0 &&
        !filters.countries.includes(zone.country || '')
      ) {
        return false;
      }

      // Filter by minimum eco score
      if (
        filters.minEcoScore > 0 &&
        (zone.ecoScore === undefined || zone.ecoScore < filters.minEcoScore)
      ) {
        return false;
      }

      return true;
    });
  }, [zones, filters]);
};

/**
 * Hook to get unique countries from zones
 */
export const useZoneCountries = (zones: Zone[]): string[] => {
  return useMemo(() => {
    const countries = new Set<string>();
    zones.forEach((zone) => {
      if (zone.country) {
        countries.add(zone.country);
      }
    });
    return Array.from(countries).sort();
  }, [zones]);
};

/**
 * Hook to get filter statistics (how many zones match current filters)
 */
export const useFilterStats = (
  zones: Zone[],
  filters: MapFilters
): { filtered: number; total: number; percentage: number } => {
  const filteredZones = useMapFilters(zones, filters);
  const total = zones.length;
  const filtered = filteredZones.length;

  return {
    filtered,
    total,
    percentage: total > 0 ? Math.round((filtered / total) * 100) : 0,
  };
};
