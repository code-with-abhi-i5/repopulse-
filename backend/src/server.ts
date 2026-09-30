// ============================================================
// RepoPulse — Main Server Bootstrap (Node.js + Express + WebSockets)
// ============================================================

import express from 'express';
import http from 'http';
import cors from 'cors';
import { ENV } from './config/env.js';
import { apiRouter } from './routes/api.routes.js';
import { initSocketServer } from './lib/socket.js';
import { checkDatabaseConnection } from './lib/prisma.js';
import { initializeWorkers } from './workers/index.js';
import { startBackgroundPoller, stopBackgroundPoller } from './workers/poller.js';

const app = express();
const server = http.createServer(app);

// 1. Middlewares
app.use(cors({
  origin: '*', // Allow all origins for dev/dashboard
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Real-Time WebSockets
initSocketServer(server);

// 3. API Routes
app.use('/api/v1', apiRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'RepoPulse API Engine',
    version: '1.0.0',
    mode: 'Hackathon Zero-Auth Mode',
    health: '/api/v1/health',
    docs: 'Refer to BACKEND_SYSTEM_DESIGN.md',
  });
});

// 4. 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// 5. Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// 6. Startup Sequence
async function startServer() {
  console.log('\n======================================================');
  console.log('🚀 Starting RepoPulse Node.js Backend Engine...');
  console.log('======================================================');

  // Verify Supabase Database Connection
  const isDbConnected = await checkDatabaseConnection();

  // Initialize Background Workers
  initializeWorkers();

  // Start Automated Background Poller if DB is online
  if (isDbConnected) {
    startBackgroundPoller(90);
  }

  // Start HTTP & WebSocket Server
  server.listen(ENV.PORT, () => {
    console.log(`\n✨ RepoPulse Server is live at http://localhost:${ENV.PORT}`);
    console.log(`📡 WebSocket server running on port ${ENV.PORT}`);
    console.log(`🌐 API base endpoint: http://localhost:${ENV.PORT}/api/v1`);
    console.log('======================================================\n');
  });
}

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  stopBackgroundPoller();
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, stopping server...');
  stopBackgroundPoller();
  server.close(() => process.exit(0));
});

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
