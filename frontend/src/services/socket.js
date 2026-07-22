import { io } from 'socket.io-client';

import { SOCKET_URL } from '../constants/config';

const SOCKET_BASE = SOCKET_URL;

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_BASE, {
      auth: {
        token: token,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Driver location updates
  updateLocation(tripId, location) {
    if (this.socket?.connected) {
      this.socket.emit('updateLocation', {
        tripId,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  }

  // Listen for location updates (for passengers)
  onLocationUpdate(tripId, callback) {
    if (!this.socket?.connected) return;

    const eventName = `locationUpdate-${tripId}`;
    this.socket.on(eventName, callback);
    
    this.listeners.set(eventName, callback);
  }

  // Remove location update listener
  offLocationUpdate(tripId) {
    if (!this.socket?.connected) return;

    const eventName = `locationUpdate-${tripId}`;
    this.socket.off(eventName);
    this.listeners.delete(eventName);
  }

  // Listen for new trip requests (for drivers)
  onTripRequest(callback) {
    if (!this.socket?.connected) return;

    this.socket.on('tripRequest', callback);
    this.listeners.set('tripRequest', callback);
  }

  offTripRequest() {
    if (!this.socket?.connected) return;

    this.socket.off('tripRequest');
    this.listeners.delete('tripRequest');
  }

  onTripUnavailable(callback) {
    if (!this.socket?.connected) return;

    this.socket.on('tripUnavailable', callback);
    this.listeners.set('tripUnavailable', callback);
  }

  offTripUnavailable() {
    if (!this.socket?.connected) return;

    this.socket.off('tripUnavailable');
    this.listeners.delete('tripUnavailable');
  }

  // Listen for trip status updates
  onTripStatusUpdate(tripId, callback) {
    if (!this.socket?.connected) return;

    const eventName = `tripStatus-${tripId}`;
    this.socket.on(eventName, callback);
    this.listeners.set(eventName, callback);
  }

  offTripStatusUpdate(tripId) {
    if (!this.socket?.connected) return;

    const eventName = `tripStatus-${tripId}`;
    this.socket.off(eventName);
    this.listeners.delete(eventName);
  }

  // Listen for driver status changes
  onDriverStatusUpdate(callback) {
    if (!this.socket?.connected) return;

    this.socket.on('driverStatusUpdate', callback);
    this.listeners.set('driverStatusUpdate', callback);
  }

  offDriverStatusUpdate() {
    if (!this.socket?.connected) return;

    this.socket.off('driverStatusUpdate');
    this.listeners.delete('driverStatusUpdate');
  }

  // Join a trip room for real-time updates
  joinTripRoom(tripId) {
    if (this.socket?.connected) {
      this.socket.emit('joinTrip', { tripId });
    }
  }

  // Leave a trip room
  leaveTripRoom(tripId) {
    if (this.socket?.connected) {
      this.socket.emit('leaveTrip', { tripId });
    }
  }

  // Join driver availability room
  joinDriverRoom() {
    if (this.socket?.connected) {
      this.socket.emit('joinDriverRoom');
    }
  }

  // Leave driver availability room
  leaveDriverRoom() {
    if (this.socket?.connected) {
      this.socket.emit('leaveDriverRoom');
    }
  }

  // Check connection status
  isConnected() {
    return this.socket?.connected || false;
  }
}

const socketService = new SocketService();

export default socketService;
