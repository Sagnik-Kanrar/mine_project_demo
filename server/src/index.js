import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { SimulationEngine } from './services/simulationEngine.js';
import { createApiRouter } from './routes/api.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Initialize simulation & physics engine
const simulationEngine = new SimulationEngine();

// Setup WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws' });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  // Send initial snapshot on connection
  ws.send(
    JSON.stringify({
      type: 'INIT_STATE',
      data: simulationEngine.getCompleteState(),
      timestamp: new Date().toISOString(),
    })
  );

  ws.on('close', () => {
    clients.delete(ws);
  });

  ws.on('error', () => {
    clients.delete(ws);
  });
});

// Configure broadcaster in simulation engine
simulationEngine.setBroadcaster((message) => {
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
});

// Mount REST API routes
app.use('/api', createApiRouter(simulationEngine));

// Root health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'MINEGUARD AI Backend',
    version: '1.0.0',
    connectedWsClients: clients.size,
    timestamp: new Date().toISOString(),
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  MINEGUARD AI Backend Server Running on Port ${PORT}`);
  console.log(`  REST API:      http://localhost:${PORT}/api`);
  console.log(`  WebSocket:     ws://localhost:${PORT}/ws`);
  console.log(`  Health Check:  http://localhost:${PORT}/health`);
  console.log(`====================================================`);
});
