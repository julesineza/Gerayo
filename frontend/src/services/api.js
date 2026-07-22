import { API_BASE_URL } from '../constants/config';

const API_BASE = API_BASE_URL;

class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle empty responses
      const text = await response.text();
      let data;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError, 'Response text:', text);
          throw new Error('Invalid JSON response from server');
        }
      } else {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.session?.access_token) {
      this.setToken(response.session.access_token);
    }
    
    return response;
  }

  async logout() {
    this.clearToken();
  }

  // Driver endpoints
  async createDriverProfile(driverData) {
    return this.request('/drivers/apply', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  }

  async getDriverProfile() {
    return this.request('/drivers/me');
  }

  async getPendingDrivers() {
    return this.request('/drivers/pending');
  }

  async approveDriver(driverProfileId) {
    return this.request(`/drivers/${driverProfileId}/approve`, {
      method: 'PATCH',
    });
  }

  async updateDriverStatus(status) {
    return this.request('/drivers/me/status', {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Trip endpoints
  async createTrip(tripData) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  async getTrip(tripId) {
    return this.request(`/trips/${tripId}`);
  }

  async getTripHistory() {
    return this.request('/trips/history');
  }

  async getActiveTrip() {
    const trip = await this.request('/trips/active');
    return trip || null;
  }

  async acceptTrip(tripId) {
    return this.request(`/trips/${tripId}/accept`, {
      method: 'PATCH',
    });
  }

  async startTrip(tripId) {
    return this.request(`/trips/${tripId}/start`, {
      method: 'PATCH',
    });
  }

  async completeTrip(tripId) {
    return this.request(`/trips/${tripId}/complete`, {
      method: 'PATCH',
    });
  }

  async cancelTrip(tripId, cancelReason) {
    return this.request(`/trips/${tripId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ cancelReason }),
    });
  }

  // Payment endpoints
  async processPayment(tripId, paymentData) {
    return this.request(`/payments/trip/${tripId}`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentStatus(paymentId) {
    return this.request(`/payments/${paymentId}`);
  }
}

const apiService = new ApiService(API_BASE);

export default apiService;

