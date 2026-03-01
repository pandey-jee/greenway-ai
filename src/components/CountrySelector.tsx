import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export const countries = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
];

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

const CountrySelector = ({ selectedCountry, onCountryChange }: CountrySelectorProps) => {
  const currentCountry = countries.find(c => c.code === selectedCountry);

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/30 shadow-sm">
      <Globe className="w-5 h-5 text-primary" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">Country:</span>
        <Select value={selectedCountry} onValueChange={onCountryChange}>
          <SelectTrigger className="w-48 bg-card">
            <SelectValue>
              {currentCountry && (
                <span className="flex items-center gap-2">
                  <span className="text-lg">{currentCountry.flag}</span>
                  <span>{currentCountry.name}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span className="text-lg">{country.flag}</span>
                  <span>{country.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CountrySelector;
