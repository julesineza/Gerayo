const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Enable Real-Time WebSockets for GPS and Driver-Matching
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for security later in production
  }
});

app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Simple baseline route
app.get('/', (req, res) => {
  res.send('Gerayo Amahoro Backend API is Running..casa.');
});

// WebSocket connection for real-time tracking
io.on('connection', (socket) => {
  console.log('A user/driver connected:', socket.id);
  
  // Listen for driver location updates
  socket.on('updateLocation', (data) => {
    // Broadcast location to matching passenger
    io.emit(`locationUpdate-${data.tripId}`, data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});