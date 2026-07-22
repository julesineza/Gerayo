const ACTIVE_STATUSES = ['REQUESTED', 'ACCEPTED', 'STARTED'];

export function isActiveStatus(status) {
  return ACTIVE_STATUSES.includes(status);
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

export function calculateFare(pickupLat, pickupLng, destLat, destLng) {
  const distanceKm = haversineKm(pickupLat, pickupLng, destLat, destLng);
  const base = 2000;
  const perKm = 500;
  return Math.round(base + distanceKm * perKm);
}

export const tripInclude = {
  passenger: { select: { id: true, fullName: true, email: true } },
  driver: {
    select: {
      id: true,
      fullName: true,
      email: true,
      driverProfile: { select: { rating: true, latitude: true, longitude: true } },
    },
  },
};

export function formatTrip(trip) {
  if (!trip) return null;
  return {
    ...trip,
    driver: trip.driver
      ? {
          ...trip.driver,
          rating: trip.driver.driverProfile?.rating ?? 5,
          latitude: trip.driver.driverProfile?.latitude,
          longitude: trip.driver.driverProfile?.longitude,
        }
      : null,
  };
}
