// API Service for connecting React frontend to Flask backend

// ensure the base URL ends with '/api' so we don't accidentally call the wrong path
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/+$/,'')}/api`;


// Helper function for API calls
async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

// ==================== API Methods ====================

export const apiService = {
  /**
   * Health check - Test if backend is running
   */
  async healthCheck() {
    return fetchAPI<{ status: string; message: string }>('/health');
  },

  /**
   * Get KPI metrics for dashboard cards
   */
  async getKPIs() {
    return fetchAPI<{
      totalTourists: number;
      totalTouristsChange: number;
      congestionIndex: number;
      congestionIndexChange: number;
      avgEcoScore: number;
      avgEcoScoreChange: number;
      activeAlerts: number;
      activeAlertsChange: number;
    }>('/kpis');
  },

  /**
   * Get weekly congestion prediction data for chart
   */
  async getCongestionWeekly() {
    return fetchAPI<Array<{
      day: string;
      actual: number;
      predicted: number;
    }>>('/congestion/weekly');
  },

  /**
   * Get seasonal analysis data (monthly)
   */
  async getSeasonalData() {
    return fetchAPI<Array<{
      month: string;
      tourists: number;
      stress: number;
    }>>('/seasonal');
  },

  /**
   * Get tourist segmentation (K-Means clustering results)
   */
  async getTouristSegments() {
    return fetchAPI<Array<{
      name: string;
      value: number;
      color: string;
    }>>('/clustering/segments');
  },

  /**
   * Get Environmental Stress Index for a location
   */
  async getESI(location: string) {
    return fetchAPI<{
      score: number;
      level: string;
      factors: {
        volume: number;
        duration: number;
        waste: number;
        capacity: number;
      };
    }>(`/esi/current?location=${encodeURIComponent(location)}`);
  },

  /**
   * Get sustainable recommendations
   */
  async getRecommendations() {
    return fetchAPI<Array<{
      type: string;
      title: string;
      subtitle: string;
      reason: string;
      ecoScore: number;
      icon: string;
    }>>('/recommendations');
  },

  /**
   * Get smart alerts
   */
  async getAlerts() {
    return fetchAPI<Array<{
      severity: 'critical' | 'warning' | 'info';
      title: string;
      detail: string;
      time: string;
      icon: string;
    }>>('/alerts');
  },

  /**
   * Get GIS zones for heatmap
   */
  async getGISZones(country: string = 'IN') {
    return fetchAPI<Array<{
      name: string;
      lat: number;
      lng: number;
      density: number;
      status: 'critical' | 'high' | 'moderate' | 'low';
      country: string;
    }>>(`/gis/zones?country=${country}`);
  },

  /**
   * Check booking availability for a destination
   */
  async checkBookingAvailability(destination: string, date: string, visitors: number) {
    const response = await fetch(`${API_BASE_URL}/booking/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ destination, date, visitors }),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Get AI-powered insights about tourism patterns
   */
  async getAIInsights() {
    return fetchAPI<Array<{
      type: string;
      title: string;
      description: string;
      metric?: string;
      change?: number;
      recommendation?: string;
    }>>('/insights');
  },

  /**
   * Get hourly congestion timeline for a destination
   */
  async getHourlyCongestion(destination: string) {
    return fetchAPI<Array<{
      hour: string;
      congestion: number;
      visitors: number;
    }>>(`/congestion/hourly?destination=${encodeURIComponent(destination)}`);
  },

  /**
   * Export all dashboard data
   */
  async exportDashboardData() {
    return fetchAPI<{
      timestamp: string;
      kpis: any;
      zones: any;
      congestion_weekly: any;
      seasonal: any;
      segments: any;
      recommendations: any;
      alerts: any;
    }>('/export/dashboard');
  },
};

// Export individual functions for convenience
export const {
  healthCheck,
  getKPIs,
  getCongestionWeekly,
  getSeasonalData,
  getTouristSegments,
  getESI,
  getRecommendations,
  getAlerts,
  getGISZones,
} = apiService;

export default apiService;
