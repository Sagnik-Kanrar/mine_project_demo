# 🛡️ MINEGUARD AI
### AI-Enabled Low-Cost Real-Time Mine Subsidence Monitoring, Prediction and Intelligent Emergency Evacuation System for Underground Coal Mines in India
**Smart India Hackathon (SIH) Working Demonstration Prototype**

---

## 📋 1. Project Overview & Problem Statement

### The Problem in Indian Underground Coal Mines
Underground coal mining (e.g. in ECL Raniganj, BCCL Jharia, SCCL Godavari Valley, SECL Korba) is inherently susceptible to **strata subsidence, catastrophic roof falls, and goaf caving incidents**. Conventional methods rely on manual tell-tales and periodic visual inspections, which fail to detect micro-seismic pre-collapse strata movements. 

Furthermore, during an emergency collapse or gas surge:
1. **Conventional GPS does NOT work underground** due to hundreds of meters of solid rock overburden.
2. Standard evacuation routes often lead miners directly into collapsing or hazardous tunnel intersections.
3. Mine control rooms lack real-time visibility into individual miner locations and dynamic tunnel safety states.

### The Solution: MINEGUARD AI
**MINEGUARD AI** is an end-to-end real-time mine safety platform designed to:
- Continuously monitor strata deformation using low-cost IoT sensor nodes (LVDT extensometers, biaxial tiltmeters, geophones, hydraulic pressure cells).
- Predict subsidence risk up to 30 minutes in advance using AI/ML strata velocity forecasting.
- Localize miners subsurface using an **Underground Positioning System (UPS)** based on UWB (Ultra-Wideband), BLE mesh, and helmet IMU dead-reckoning.
- Compute the **Shortest SAFE Evacuation Route** using graph-based risk penalty Dijkstra/A* algorithms that dynamically avoid collapsed tunnels in real time.

---

## 🏗️ 2. System Architecture

```
+-----------------------------------------------------------------------------------+
|                           UNDERGROUND COAL MINE ENVIRONMENT                       |
+-----------------------------------------------------------------------------------+
|  [Roof LVDT Sensors]  [BNO055 Tiltmeters]  [14Hz Geophones]  [Hydraulic Load Cells] |
|                                   │                                               |
|                                   ▼ (RS-485 / I2C)                                |
|                         [ESP32 IoT Edge Nodes]                                    |
|                                   │                                               |
|                                   ▼ (LoRa / LoRaWAN 868MHz Subsurface Mesh)       |
|                       [Underground LoRa Repeater Gateway]                         |
|                                   │                                               |
|  [UWB Anchors DWM1000] ──(Time-of-Flight)──> [Miner Smart Helmet / UPS Tag]      |
+───────────────────────────────────┼───────────────────────────────────────────────+
                                    │ (Optical Fiber Shaft Trunk / Ethernet)
                                    ▼
+-----------------------------------------------------------------------------------+
|                        SURFACE MINE CONTROL ROOM SERVER                           |
+-----------------------------------------------------------------------------------+
|  [Node.js + Express / Python FastAPI Server] ◄──► [WebSocket Real-Time Stream]    |
|  [In-Memory Real-Time Mining Store] ◄──► [Dijkstra Shortest SAFE Path Engine]     |
|  [AI/ML Subsidence Prediction Engine] ◄──► [Explainable AI (XAI) Engine]          |
+───────────────────────────────────┼───────────────────────────────────────────────+
                                    │ (HTTP & WS)
                                    ▼
+-----------------------------------------------------------------------------------+
|                       MINEGUARD AI COMMAND CENTER DASHBOARD                       |
+-----------------------------------------------------------------------------------+
|  - Real-Time KPI Cards (Mine Status, Active Nodes, Miners Underground, Risk Dial) |
|  - Live 2D Vector Underground Mine Map (SVG/Canvas with Animated Miner Beacons)   |
|  - Strata Waveform Charts (Displacement, Tilt, Vibration, Stress)                |
|  - Intelligent Evacuation Route Visualizer with Dynamic Rerouting Detours         |
|  - Full-Screen Red Alert Emergency Mode HUD & Broadcast Dispatcher                |
|  - SIH Demonstration Scenario Panel (1-Click Scenario Injectors)                 |
+-----------------------------------------------------------------------------------+
```

---

## ⚡ 3. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **HTML5, CSS3, JavaScript (React.js JSX)**, Vite | Ultra-responsive industrial control room dashboard |
| **Styling & Icons** | Tailwind CSS, Lucide React | Modern dark enterprise theme, DGMS hazard color codes |
| **Data Visualization** | Recharts, Custom SVG Canvas | Live time-series waveforms, 2D vector mine map, semi-circle risk gauge |
| **Audio Alert Synthesizer**| Web Audio API | Synthetic siren, warning chime, click feedback without external assets |
| **Backend Option 1 (Default)** | **Node.js, Express.js (Pure JavaScript ES Modules)** | REST APIs, graph algorithms, AI simulation, event broadcasting |
| **Backend Option 2 (Python)** | **Python 3, FastAPI, Uvicorn, WebSockets** | Alternative Python backend in `server_py/` |
| **Real-Time Streaming** | WebSockets (`ws`) | Sub-100ms telemetry push to all connected monitoring stations |
| **Routing Algorithm** | Weighted Dijkstra / A* Graph Engine | Dynamically computes the shortest **safe** path, penalizing high-risk tunnels |
| **AI / ML Layer** | Multi-Parameter Strata Forecasting | Predictive 30-min deformation curves with 95% confidence bounds & XAI |

---

## 📡 4. Hardware Architecture (Target Deployment)

```
[Strata Sensors] ──> [ESP32 Microcontroller] ──> [LoRa SX1276 (868MHz)] ──> [Shaft Gateway] ──> [Server]
```

### 1. Underground Strata Sensors:
- **Ground Displacement:** Linear Variable Differential Transformer (LVDT) / Potentiometric extensometers mounted across roof-to-floor and pillar-to-pillar.
- **Roof Tilt & Clinometer:** BNO055 / MPU6050 6-axis IMU measuring strata angular deviation ($^\circ$).
- **Micro-Seismic Vibration:** 14 Hz Geophones & acoustic emission probes detecting rock micro-fracturing prior to collapse.
- **Pillar Stress & Pore Pressure:** Vibrating wire hydraulic pressure cells ($MPa$) monitoring overburden weight transfer.
- **Environmental Probes:** NDIR Optical Methane ($\text{CH}_4$), Carbon Monoxide ($\text{CO}$), Temperature & Humidity.
- **Surface Datum:** Surface GNSS Base Station measuring reference ground subsidence above coal panels.

### 2. Underground Positioning System (UPS) — *Why NOT GPS?*:
> [!IMPORTANT]
> **Conventional GPS satellite signals cannot penetrate underground rock strata.** MINEGUARD AI utilizes:
> - **UWB Anchors (Decawave DWM1000):** Fixed at tunnel junctions measuring Time-of-Flight (ToF) distance to miner tags within $\pm 0.5\text{m}$.
> - **BLE Mesh Beacons:** Bluetooth Low Energy RSSI trilateration for secondary corridors.
> - **Inertial Dead-Reckoning:** Helmet-integrated triaxial IMU calculating step count, heading, and elevation changes if anchor signal is obstructed.

---

## 🧮 5. Core Innovation: Shortest SAFE Route Algorithm

### Graph Model
- **Nodes ($V$):** Junctions ($J_1 \dots J_{12}$), Surface Incline Exits ($E_1 \dots E_4$), and Refuge Chambers ($\text{REF-1}$).
- **Edges ($E$):** Tunnel sections with length $d_e$, risk level $R_e$, and availability status $S_e$.

### Dynamic Penalty Cost Function
$$\text{Cost}(e) = \begin{cases} d_e \times 1.0 & \text{if } R_e = \text{SAFE} \\ d_e \times 2.5 & \text{if } R_e = \text{CAUTION} \\ d_e \times 7.0 & \text{if } R_e = \text{WARNING} \\ \infty & \text{if } R_e = \text{CRITICAL or COLLAPSED} \end{cases}$$

---

## 🚀 6. Installation & Running Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- *(Optional for Python backend)*: Python 3.9+ with `pip`

---

### Option A: Node.js Express Backend + React JS Frontend (Recommended)

1. **Install dependencies:**
```bash
# In server/
cd server
npm install

# In client/
cd ../client
npm install
```

2. **Start Backend Server:**
```bash
cd server
npm run dev
```
*(Backend runs on `http://localhost:5000` with WebSocket on `ws://localhost:5000/ws`)*

3. **Start Frontend Dashboard:**
```bash
cd client
npm run dev
```
*(Frontend runs on `http://localhost:5173`)*

---

### Option B: Python FastAPI Backend + React JS Frontend

1. **Start Python Backend Server:**
```bash
cd server_py
pip install -r requirements.txt
python main.py
```
*(FastAPI server boots on `http://localhost:5000` with WebSockets on `ws://localhost:5000/ws`)*

2. **Start Frontend Dashboard:**
```bash
cd client
npm run dev
```

---

## 🎯 7. Live Demonstration Script for SIH Judges

Follow this step-by-step walkthrough to demonstrate the full working prototype:

### Step 1: Initial Baseline Monitoring (Dashboard)
- Open the dashboard at [http://localhost:5173](http://localhost:5173).
- Observe top KPI cards: Mine Status `● MONITORING`, Active Sensors `24 / 24`, Workers Underground `8`, AI Risk Score `~21% SAFE`.
- Point out the live 2D underground coal mine vector map showing all 4 zones (A, B, C, D) and active miner markers.

### Step 2: Simulate Increasing Strata Subsidence
- In the top SIH Demo Bar, click **`[ ⚠️ SIMULATE SUBSIDENCE ]`**.
- Notice how Zone B sensor telemetry ramps up (Displacement jumps to 8.4mm, tilt to 3.2°, vibration to 54.8Hz).
- Navigate to **AI Prediction Page**: Observe the AI risk gauge climb to **HIGH RISK (78-85%)**, the 30-minute predictive curve approaching the critical 15mm limit, and the Explainable AI (XAI) dominant factor weights.

### Step 3: Trigger Catastrophic Collapse & Dynamic Safe Rerouting (Core Innovation)
- In the demo bar, click **`[ 🚨 COLLAPSE T-07 & REROUTE ]`**.
- Observe the immediate synchronized reaction:
  1. Tunnel $T_7$ turns glowing **RED / COLLAPSED**.
  2. Audible alert siren activates.
  3. Red Alert banner pops up: `🚨 ROUTE UPDATED: Previous route through T-07 is unsafe. Alternative safe evacuation route calculated.`
  4. Worker $W_1$'s path dynamically detours from $E_2$ to **Exit $E_1$**.
  5. The full-screen **Red Alert Emergency Mode HUD** opens showing turn-by-turn guidance for all miners.

### Step 4: Emergency Dispatch & SMS Simulation
- In the Emergency HUD, click **"Dispatch SMS & Tag Alert"** to simulate broadcasting evacuation coordinates to smart helmet tags.
- Click **"Silence Siren"** to mute audio.
- Switch to **Emergency Evacuation Page** to inspect turn-by-turn navigation steps.

### Step 5: Reset Simulation
- Click **`[ 🟢 NORMAL MINE ]`** to reset all 24 sensors, tunnels, and routes back to normal.

---

## ⚠️ Important Prototype Limitation & Geological Disclaimer
> [!NOTE]
> This software is a functional demonstration prototype developed for the Smart India Hackathon. Sensor telemetry streams and subsurface worker positioning are simulated according to realistic geotechnical strata models. Real-world mine deployment requires DGMS (Directorate General of Mines Safety) certification, intrinsically safe flameproof hardware enclosures (IS/FLP certified for coal atmospheres), physical rock anchor calibration, and underground optical fiber infrastructure.

---

## 👥 Authors & Credits
Developed for **Smart India Hackathon (SIH)**.  
*MINEGUARD AI — Pioneering AI-Driven Safety in Underground Mining.*
