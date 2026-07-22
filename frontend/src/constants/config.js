// Update this to your machine's LAN IP when testing on a physical device
export const API_BASE_URL = __DEV__
  ? 'http://192.168.1.66:4000'
  : 'https://your-production-api.com';

export const SOCKET_URL = API_BASE_URL;
