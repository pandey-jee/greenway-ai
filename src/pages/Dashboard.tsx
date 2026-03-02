import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, Leaf, AlertTriangle, RefreshCw } from "lucide-react";
import { useLastUpdated } from "@/hooks/useLastUpdated";
import KPICard from "@/components/KPICard";
import { CongestionChart, SeasonalChart } from "@/components/Charts";
import InteractiveMap from "@/components/InteractiveMap";
import DestinationBooking from "@/components/DestinationBooking";
import RecommendationsPanel from "@/components/RecommendationsPanel";
import ESIGauge from "@/components/ESIGauge";
import TouristClustering from "@/components/TouristClustering";
import AlertsPanel from "@/components/AlertsPanel";
import AIInsightsPanel from "@/components/AIInsightsPanel";
import HourlyCongestionTimeline from "@/components/HourlyCongestionTimeline";
import ExportButton from "@/components/ExportButton";
import CountrySelector from "@/components/CountrySelector";
import Navbar from "@/components/Navbar";
import { apiService } from "@/services/api";

const Dashboard = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('IN');
  
  // Fetch data from backend API
  const { data: kpisData, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: apiService.getKPIs,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: congestionData } = useQuery({
    queryKey: ['congestion'],
    queryFn: apiService.getCongestionWeekly,
  });

  const { data: seasonalData } = useQuery({
    queryKey: ['seasonal'],
    queryFn: apiService.getSeasonalData,
  });

  const { data: clusters } = useQuery({
    queryKey: ['clusters'],
    queryFn: apiService.getTouristSegments,
  });

  // fetch gis zones first since other queries depend on them
  const { data: gisZones, isLoading: gisLoading } = useQuery({
    queryKey: ['gis', selectedCountry],
    queryFn: () => apiService.getGISZones(selectedCountry),
  });

  const { data: esiData } = useQuery({
    queryKey: ['esi', gisZones?.[0]?.name],
    queryFn: () => apiService.getESI(gisZones && gisZones.length > 0 ? gisZones[0].name : ''),
    enabled: !!gisZones && gisZones.length > 0,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: apiService.getRecommendations,
    refetchInterval: 30000, // Refresh every 30 seconds for fresh recommendations
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: apiService.getAlerts,
  });

  // Track when data was last updated (after queries are defined)
  const { displayTime, lastUpdated } = useLastUpdated([kpisLoading]);

  // Build KPI cards from API data
  const kpis = kpisData ? [
    { 
      title: "Total Tourists Today", 
      value: kpisData.totalTourists.toLocaleString(), 
      change: kpisData.totalTouristsChange, 
      icon: Users, 
      color: "primary" as const 
    },
    { 
      title: "Congestion Index", 
      value: `${kpisData.congestionIndex}%`, 
      change: kpisData.congestionIndexChange, 
      icon: TrendingUp, 
      color: "warning" as const 
    },
    { 
      title: "Avg Eco Score", 
      value: kpisData.avgEcoScore.toString(), 
      change: kpisData.avgEcoScoreChange, 
      icon: Leaf, 
      color: "success" as const 
    },
    { 
      title: "Active Alerts", 
      value: kpisData.activeAlerts.toString(), 
      change: kpisData.activeAlertsChange, 
      icon: AlertTriangle, 
      color: "destructive" as const 
    },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Policy Dashboard</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-muted-foreground text-sm">AI-powered insights for sustainable tourism planning</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                <RefreshCw className="w-3 h-3" />
                <span>Last updated: {displayTime}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CountrySelector 
              selectedCountry={selectedCountry} 
              onCountryChange={setSelectedCountry}
            />
            <ExportButton />
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpisLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-5 h-24 animate-pulse bg-muted/20" />
            ))
          ) : (
            kpis.map((k) => <KPICard key={k.title} {...k} />)
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <CongestionChart data={congestionData} />
          <SeasonalChart data={seasonalData} />
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <ESIGauge data={esiData} />
          <TouristClustering data={clusters} />
          <AlertsPanel data={alerts} />
        </div>

        {/* AI Insights + Hourly Timeline Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <AIInsightsPanel />
          <HourlyCongestionTimeline
            destinations={gisZones ? gisZones.map(z => z.name) : []}
          />
        </div>

        {/* Booking Check Row */}
        <div className="mb-5">
          <DestinationBooking destinations={gisZones} loading={gisLoading} />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <InteractiveMap data={gisZones} loading={gisLoading} enableFilters={true} />
          <RecommendationsPanel data={recommendations} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
