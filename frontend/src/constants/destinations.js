// Known Kigali destinations for demo booking
export const DESTINATIONS = {
  Home: {
    name: 'Home (Nyarutarama)',
    lat: -1.9536,
    lng: 30.0926,
  },
  'Home (Nyarutarama)': {
    name: 'Home (Nyarutarama)',
    lat: -1.9536,
    lng: 30.0926,
  },
  Work: {
    name: 'Work (CBD Kigali)',
    lat: -1.9441,
    lng: 30.0619,
  },
  Airport: {
    name: 'Kigali International Airport',
    lat: -1.9686,
    lng: 30.1395,
  },
};

const DEFAULT_DEST = {
  name: 'Custom Destination',
  lat: -1.9500,
  lng: 30.0700,
};

export function resolveDestination(label) {
  if (!label) return DEFAULT_DEST;
  const key = label.trim();
  if (DESTINATIONS[key]) return DESTINATIONS[key];
  return { ...DEFAULT_DEST, name: key };
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateFare(pickupLat, pickupLng, destLat, destLng) {
  const distanceKm = haversineKm(pickupLat, pickupLng, destLat, destLng);
  return Math.round(2000 + distanceKm * 500);
}

export function formatRwf(amount) {
  return `${Number(amount || 0).toLocaleString()} RWF`;
}
