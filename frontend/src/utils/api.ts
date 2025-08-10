// API utility functions for CryptoReels frontend

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
          message: data.message
        };
      }

      return {
        success: true,
        data,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Game API methods
  async initializeGame(mode: 'live' | 'test' = 'live') {
    return this.request('/api/game/initialize', {
      method: 'POST',
      body: JSON.stringify({ mode })
    });
  }

  async spin(betAmount: number, gameId?: string) {
    return this.request('/api/game/spin', {
      method: 'POST',
      body: JSON.stringify({ betAmount, gameId })
    });
  }

  async getGameStatus(gameId: string) {
    return this.request(`/api/game/status/${gameId}`);
  }

  // Configuration API methods
  async getGameConfig() {
    return this.request('/api/config');
  }

  // Naffles integration methods
  async checkNafflesHealth() {
    return this.request('/api/naffles/health');
  }

  async createNafflesSession(playerId: string, tokenType: string) {
    return this.request('/api/naffles/session', {
      method: 'POST',
      body: JSON.stringify({ playerId, tokenType })
    });
  }

  async requestVRF(sessionId: string) {
    return this.request('/api/naffles/vrf', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
  }
}

// Default API client instance
export const apiClient = new ApiClient();

// Utility functions
export const isNafflesAvailable = async (): Promise<boolean> => {
  try {
    const response = await apiClient.checkNafflesHealth();
    return response.success;
  } catch {
    return false;
  }
};

export const formatBalance = (amount: number, currency: string = 'CREDITS'): string => {
  return `${amount.toLocaleString()} ${currency}`;
};

export const formatBetAmount = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
};