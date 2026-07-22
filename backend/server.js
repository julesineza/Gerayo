import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import driverRoutes from './routes/drivers.js';
import paymentRoutes from './routes/payments.js';
import { requireAuth } from './middleware/requireAuth.js';
import { supabaseAuth } from './lib/supabase.js';
import prisma from './lib/prisma.js';
import { setIO } from './lib/socket.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

setIO(io);

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/trips', tripRoutes);
app.use('/drivers', driverRoutes);
app.use('/payments', paymentRoutes);

app.get('/', requireAuth, (req, res) => {
  res.send('Gerayo Amahoro Backend API is Running..casa.');
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    if (error || !user) {
      return next(new Error('Invalid token'));
    }
    socket.userId = user.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, socket.userId);

  socket.on('joinDriverRoom', async () => {
    const profile = await prisma.driverProfile.findUnique({
      where: { userId: socket.userId },
    });
    if (profile?.isApproved) {
      socket.join('drivers');
      console.log('Driver joined room:', socket.userId);
    }
  });

  socket.on('leaveDriverRoom', () => {
    socket.leave('drivers');
  });

  socket.on('joinTrip', ({ tripId }) => {
    if (tripId) {
      socket.join(`trip-${tripId}`);
    }
  });

  socket.on('leaveTrip', ({ tripId }) => {
    if (tripId) {
      socket.leave(`trip-${tripId}`);
    }
  });

  socket.on('updateLocation', async (data) => {
    const { tripId, latitude, longitude } = data;
    if (!tripId || latitude == null || longitude == null) return;

    await prisma.driverProfile.updateMany({
      where: { userId: socket.userId },
      data: { latitude, longitude },
    });

    io.to(`trip-${tripId}`).emit(`locationUpdate-${tripId}`, {
      tripId,
      latitude,
      longitude,
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
