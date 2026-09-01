# MINEGUARD AI — Python Backend (FastAPI + WebSockets)

This is the standalone **Python FastAPI backend** for **MINEGUARD AI**, providing identical REST endpoints and WebSocket telemetry as the Node.js Express backend.

---

## 🚀 Features

- **FastAPI REST API**:
  - `GET /api/state`: Full mine state (nodes, tunnels, sensors, workers, AI prediction).
  - `GET /api/route/{worker_id}`: Dynamic Dijkstra shortest safe route calculation.
  - `POST /api/scenarios/normal`: Reset mine to normal safe operating condition.
  - `POST /api/scenarios/collapse`: Trigger collapse in Tunnel T-07 with instant reroute.
- **WebSocket Gateway (`ws://localhost:5000/ws`)**:
  - Broadcasts live telemetry and receives scenario triggers / worker relocations.
- **Dijkstra Safe Evacuation Pathfinding**:
  - Calculates detour routing penalizing unstable/collapsed mine tunnels with infinite cost.
- **AI Subsidence Risk Engine**:
  - Ingests displacement, tilt, vibration, and stress to generate 30-minute deformation projections.

---

## 🛠️ How to Run

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the FastAPI Server
```bash
uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```
or run directly:
```bash
python main.py
```

### 3. Connect Frontend
Start the React frontend in the `client/` directory:
```bash
cd ../client
npm run dev
```
The React frontend at `http://localhost:5173` will connect to `http://localhost:5000` via proxy.
