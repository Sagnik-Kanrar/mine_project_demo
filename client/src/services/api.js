const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  async getFullState() {
    const res = await fetch(`${API_BASE}/state`);
    if (!res.ok) throw new Error('Failed to fetch full state');
    return res.json();
  },

  async getSensors() {
    const res = await fetch(`${API_BASE}/sensors`);
    if (!res.ok) throw new Error('Failed to fetch sensors');
    return res.json();
  },

  async getSensorById(id) {
    const res = await fetch(`${API_BASE}/sensors/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch sensor ${id}`);
    return res.json();
  },

  async getWorkers() {
    const res = await fetch(`${API_BASE}/workers`);
    if (!res.ok) throw new Error('Failed to fetch workers');
    return res.json();
  },

  async getMineTopology() {
    const res = await fetch(`${API_BASE}/mine`);
    if (!res.ok) throw new Error('Failed to fetch mine topology');
    return res.json();
  },

  async getAlerts() {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async acknowledgeAlert(id) {
    const res = await fetch(`${API_BASE}/alerts/${id}/ack`, { method: 'POST' });
    return res.json();
  },

  async resolveAlert(id) {
    const res = await fetch(`${API_BASE}/alerts/${id}/resolve`, { method: 'POST' });
    return res.json();
  },

  async getAIRisk() {
    const res = await fetch(`${API_BASE}/risk`);
    if (!res.ok) throw new Error('Failed to fetch AI risk score');
    return res.json();
  },

  async getRoutes() {
    const res = await fetch(`${API_BASE}/routes`);
    if (!res.ok) throw new Error('Failed to fetch evacuation routes');
    return res.json();
  },

  async getWorkerRoute(workerId) {
    const res = await fetch(`${API_BASE}/routes/worker/${workerId}`);
    if (!res.ok) throw new Error(`Failed to fetch route for worker ${workerId}`);
    return res.json();
  },

  // Dynamic Evaluator Overrides
  async toggleTunnelBlock(tunnelId) {
    const res = await fetch(`${API_BASE}/simulation/toggle-tunnel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tunnelId }),
    });
    if (!res.ok) throw new Error(`Failed to toggle tunnel ${tunnelId}`);
    return res.json();
  },

  async overrideSensorValue(sensorId, value) {
    const res = await fetch(`${API_BASE}/simulation/sensor-override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sensorId, value }),
    });
    if (!res.ok) throw new Error(`Failed to override sensor ${sensorId}`);
    return res.json();
  },

  async relocateWorker(workerId, nodeId) {
    const res = await fetch(`${API_BASE}/simulation/relocate-worker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId, nodeId }),
    });
    if (!res.ok) throw new Error(`Failed to relocate worker ${workerId}`);
    return res.json();
  },

  async advanceEvacuation(workerId) {
    const res = await fetch(`${API_BASE}/simulation/evacuation-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId }),
    });
    if (!res.ok) throw new Error('Failed to advance evacuation');
    return res.json();
  },

  // Simulation Triggers
  async simulateNormal() {
    const res = await fetch(`${API_BASE}/simulation/normal`, { method: 'POST' });
    return res.json();
  },

  async simulateIncreasingSubsidence() {
    const res = await fetch(`${API_BASE}/simulation/warning`, { method: 'POST' });
    return res.json();
  },

  async simulateTunnelCollapse() {
    const res = await fetch(`${API_BASE}/simulation/collapse`, { method: 'POST' });
    return res.json();
  },

  async simulateWorkerEmergency() {
    const res = await fetch(`${API_BASE}/simulation/worker-emergency`, { method: 'POST' });
    return res.json();
  },

  async simulateSensorFailure() {
    const res = await fetch(`${API_BASE}/simulation/sensor-failure`, { method: 'POST' });
    return res.json();
  },

  // Emergency HUD Actions
  async toggleEmergency() {
    const res = await fetch(`${API_BASE}/emergency/toggle`, { method: 'POST' });
    return res.json();
  },

  async toggleSiren(active) {
    const res = await fetch(`${API_BASE}/emergency/siren`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    return res.json();
  },

  async sendEmergencySMS() {
    const res = await fetch(`${API_BASE}/emergency/sms`, { method: 'POST' });
    return res.json();
  },
};
