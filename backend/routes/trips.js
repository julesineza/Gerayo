import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import prisma from '../lib/prisma.js';
import {
  calculateFare,
  tripInclude,
  formatTrip,
} from '../lib/tripUtils.js';
import { emitTripRequest, emitTripStatus, emitTripUnavailable } from '../lib/socket.js';

const router = Router();

async function fetchTrip(id) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: tripInclude,
  });
  return formatTrip(trip);
}

router.post('/', requireAuth, async (req, res) => {
  const {
    pickupName,
    pickupLat,
    pickupLng,
    destinationName,
    destinationLat,
    destinationLng,
  } = req.body;

  if (
    pickupLat == null ||
    pickupLng == null ||
    destinationLat == null ||
    destinationLng == null
  ) {
    return res.status(400).json({ error: 'Pickup and destination coordinates are required' });
  }

  const existing = await prisma.trip.findFirst({
    where: {
      passengerId: req.user.id,
      status: { in: ['REQUESTED', 'ACCEPTED', 'STARTED'] },
    },
  });
  if (existing) {
    return res.status(409).json({ error: 'You already have an active trip' });
  }

  const estimatedFare = calculateFare(pickupLat, pickupLng, destinationLat, destinationLng);

  const trip = await prisma.trip.create({
    data: {
      passengerId: req.user.id,
      pickupName,
      pickupLat,
      pickupLng,
      destinationName,
      destinationLat,
      destinationLng,
      estimatedFare,
    },
    include: tripInclude,
  });

  const formatted = formatTrip(trip);
  emitTripRequest(formatted);
  res.status(201).json(formatted);
});

router.get('/active', requireAuth, async (req, res) => {
  const trip = await prisma.trip.findFirst({
    where: {
      OR: [{ passengerId: req.user.id }, { driverId: req.user.id }],
      status: { in: ['REQUESTED', 'ACCEPTED', 'STARTED'] },
    },
    include: tripInclude,
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json(formatTrip(trip));
});

router.get('/history', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { role: true },
  });

  const trips = await prisma.trip.findMany({
    where:
      user.role === 'PASSENGER'
        ? { passengerId: req.user.id }
        : { driverId: req.user.id },
    include: tripInclude,
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json(trips.map(formatTrip));
});

router.get('/:id', requireAuth, async (req, res) => {
  const trip = await fetchTrip(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.status(200).json(trip);
});

router.patch('/:id/accept', requireAuth, requireRole('DRIVER'), async (req, res) => {
  const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  if (trip.status !== 'REQUESTED') {
    return res.status(409).json({ error: `Trip already ${trip.status.toLowerCase()}` });
  }

  const driverProfile = await prisma.driverProfile.findUnique({
    where: { userId: req.user.id },
  });
  if (!driverProfile?.isApproved) {
    return res.status(403).json({ error: 'Driver not approved' });
  }
  if (driverProfile.status !== 'AVAILABLE') {
    return res.status(409).json({ error: 'Driver is not available' });
  }

  await prisma.$transaction([
    prisma.trip.update({
      where: { id: req.params.id },
      data: { driverId: req.user.id, status: 'ACCEPTED' },
    }),
    prisma.driverProfile.update({
      where: { userId: req.user.id },
      data: { status: 'ON_TRIP' },
    }),
  ]);

  const updatedTrip = await fetchTrip(req.params.id);
  emitTripUnavailable(trip.id);
  emitTripStatus(updatedTrip);
  res.status(200).json(updatedTrip);
});

router.patch('/:id/start', requireAuth, requireRole('DRIVER'), async (req, res) => {
  const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  if (trip.driverId !== req.user.id) {
    return res.status(403).json({ error: 'Only the assigned driver can start this trip' });
  }
  if (trip.status !== 'ACCEPTED') {
    return res.status(409).json({ error: `Cannot start trip in status ${trip.status}` });
  }

  await prisma.trip.update({
    where: { id: req.params.id },
    data: { status: 'STARTED', startedAt: new Date() },
  });

  const updatedTrip = await fetchTrip(req.params.id);
  emitTripStatus(updatedTrip);
  res.status(200).json(updatedTrip);
});

router.patch('/:id/complete', requireAuth, requireRole('DRIVER'), async (req, res) => {
  const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  if (trip.driverId !== req.user.id) {
    return res.status(403).json({ error: 'Only the assigned driver can complete this trip' });
  }
  if (trip.status !== 'STARTED') {
    return res.status(409).json({ error: `Cannot complete trip in status ${trip.status}` });
  }

  await prisma.$transaction([
    prisma.trip.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    }),
    prisma.driverProfile.update({
      where: { userId: trip.driverId },
      data: { status: 'AVAILABLE' },
    }),
  ]);

  const updatedTrip = await fetchTrip(req.params.id);
  emitTripStatus(updatedTrip);
  res.status(200).json(updatedTrip);
});

router.patch('/:id/cancel', requireAuth, async (req, res) => {
  const { cancelReason } = req.body;
  const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  if (['COMPLETED', 'CANCELLED'].includes(trip.status)) {
    return res.status(409).json({ error: `Cannot cancel a ${trip.status.toLowerCase()} trip` });
  }

  const isPassenger = trip.passengerId === req.user.id;
  const isDriver = trip.driverId === req.user.id;
  if (!isPassenger && !isDriver) {
    return res.status(403).json({ error: 'Not authorized to cancel this trip' });
  }

  await prisma.trip.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED', cancelReason },
  });

  if (trip.driverId) {
    await prisma.driverProfile.update({
      where: { userId: trip.driverId },
      data: { status: 'AVAILABLE' },
    });
  }

  const updatedTrip = await fetchTrip(req.params.id);
  emitTripStatus(updatedTrip);
  if (trip.status === 'REQUESTED') {
    emitTripUnavailable(trip.id);
  }
  res.status(200).json(updatedTrip);
});

export default router;
