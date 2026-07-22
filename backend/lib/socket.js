let io = null;

export function setIO(serverIO) {
  io = serverIO;
}

export function getIO() {
  return io;
}

export function emitTripStatus(trip) {
  if (!io || !trip) return;
  io.to(`trip-${trip.id}`).emit(`tripStatus-${trip.id}`, trip);
}

export function emitTripRequest(trip) {
  if (!io || !trip) return;
  io.to('drivers').emit('tripRequest', trip);
}

export function emitTripUnavailable(tripId) {
  if (!io || !tripId) return;
  io.to('drivers').emit('tripUnavailable', { tripId });
}
