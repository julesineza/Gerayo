const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000' 
  : 'https://your-production-api.com';

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    this.clearToken();
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  // Driver endpoints
  async createDriverProfile(driverData) {
    return this.request('/api/drivers/profile', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  }

  async updateDriverStatus(status) {
    return this.request('/api/drivers/status', {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateDriverLocation(location) {
    return this.request('/api/drivers/location', {
      method: 'PATCH',
      body: JSON.stringify(location),
    });
  }

  // Trip endpoints
  async createTrip(tripData) {
    return this.request('/api/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  async acceptTrip(tripId) {
    return this.request(`/api/trips/${tripId}/accept`, {
      method: 'POST',
    });
  }

  async startTrip(tripId) {
    return this.request(`/api/trips/${tripId}/start`, {
      method: 'POST',
    });
  }

  async completeTrip(tripId) {
    return this.request(`/api/trips/${tripId}/complete`, {
      method: 'POST',
    });
  }

  async cancelTrip(tripId, reason) {
    return this.request(`/api/trips/${tripId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getActiveTrip() {
    return this.request('/api/trips/active');
  }

  // Payment endpoints
  async processPayment(paymentData) {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentHistory() {
    return this.request('/api/payments/history');
  }

  // Rating endpoints
  async submitRating(ratingData) {
    return this.request('/api/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  }

  // User endpoints
  async getProfile() {
    return this.request('/api/users/profile');
  }

  async updateProfile(profileData) {
    return this.request('/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }
}

const apiService = new ApiService(API_BASE_URL);

export default apiService;
