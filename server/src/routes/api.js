import { Router } from 'express';

export function createApiRouter(engine) {
  const router = Router();

  // Full state snapshot
  router.get('/state', (_req, res) => {
    res.json(engine.getCompleteState());
  });

  // Sensors
  router.get('/sensors', (_req, res) => {
    res.json(engine.getSensors());
  });

  router.get('/sensors/:id', (req, res) => {
    const sensor = engine.getSensorById(req.params.id);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }
    res.json(sensor);
  });

  // Mine topology
  router.get('/mine', (_req, res) => {
    res.json({
      zones: engine.getZones(),
      tunnels: engine.getTunnels(),
      nodes: engine.getNodes(),
    });
  });

  router.get('/tunnels', (_req, res) => {
    res.json(engine.getTunnels());
  });

  router.get('/zones', (_req, res) => {
    res.json(engine.getZones());
  });

  router.get('/nodes', (_req, res) => {
    res.json(engine.getNodes());
  });

  // Workers & Underground Positioning
  router.get('/workers', (_req, res) => {
    res.json(engine.getWorkers());
  });

  router.get('/workers/:id', (req, res) => {
    const worker = engine.getWorkerById(req.params.id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json(worker);
  });

  // Alerts
  router.get('/alerts', (_req, res) => {
    res.json(engine.getAlerts());
  });

  router.post('/alerts/:id/ack', (req, res) => {
    const success = engine.acknowledgeAlert(req.params.id);
    res.json({ success });
  });

  router.post('/alerts/:id/resolve', (req, res) => {
    const success = engine.resolveAlert(req.params.id);
    res.json({ success });
  });

  // AI Risk Assessment
  router.get('/risk', (_req, res) => {
    res.json(engine.getAIPrediction());
  });

  // Evacuation Routing
  router.get('/routes', (_req, res) => {
    const workers = engine.getWorkers();
    const plans = workers.map((w) => engine.calculateRouteForWorker(w.id)).filter(Boolean);
    res.json(plans);
  });

  router.get('/routes/worker/:workerId', (req, res) => {
    const plan = engine.calculateRouteForWorker(req.params.workerId);
    if (!plan) {
      return res.status(404).json({ error: 'Route calculation failed or worker not found' });
    }
    res.json(plan);
  });

  router.post('/route/calculate', (req, res) => {
    const { startNode, workerId } = req.body;
    if (!startNode) {
      return res.status(400).json({ error: 'startNode parameter is required' });
    }
    const tempWorkerId = workerId || 'W-CUSTOM';
    const plan = engine.calculateRouteForWorker(tempWorkerId);
    res.json(plan);
  });

  // ================= DYNAMIC EVALUATOR ACTIONS ================= //

  // Toggle obstruction/collapse on ANY tunnel
  router.post('/simulation/toggle-tunnel', (req, res) => {
    const { tunnelId } = req.body;
    if (!tunnelId) {
      return res.status(400).json({ error: 'tunnelId is required' });
    }
    try {
      const result = engine.toggleTunnelBlock(tunnelId);
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  // Manual sensor telemetry injection (Sliders)
  router.post('/simulation/sensor-override', (req, res) => {
    const { sensorId, value } = req.body;
    if (!sensorId || value === undefined) {
      return res.status(400).json({ error: 'sensorId and value are required' });
    }
    try {
      const result = engine.updateSensorValue(sensorId, Number(value));
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  // Relocate worker to another junction
  router.post('/simulation/relocate-worker', (req, res) => {
    const { workerId, nodeId } = req.body;
    if (!workerId || !nodeId) {
      return res.status(400).json({ error: 'workerId and nodeId are required' });
    }
    try {
      const result = engine.relocateWorker(workerId, nodeId);
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  // Advance evacuation progression
  router.post('/simulation/evacuation-step', (req, res) => {
    const { workerId } = req.body;
    const result = engine.advanceWorkerEvacuation(workerId);
    res.json(result);
  });

  // Scenario presets
  router.post('/simulation/normal', (_req, res) => {
    const state = engine.setScenarioNormal();
    res.json({ success: true, message: 'Simulation reset to normal', state });
  });

  router.post('/simulation/warning', (_req, res) => {
    const state = engine.setScenarioIncreasingSubsidence();
    res.json({ success: true, message: 'Simulating increasing subsidence', state });
  });

  router.post('/simulation/critical', (_req, res) => {
    const state = engine.setScenarioIncreasingSubsidence();
    res.json({ success: true, message: 'Simulating high strata pressure', state });
  });

  router.post('/simulation/collapse', (_req, res) => {
    const state = engine.setScenarioTunnelCollapse();
    res.json({ success: true, message: 'Simulating tunnel collapse in T-07', state });
  });

  router.post('/simulation/worker-emergency', (_req, res) => {
    const state = engine.setScenarioWorkerEmergency();
    res.json({ success: true, message: 'Simulating worker SOS distress beacon', state });
  });

  router.post('/simulation/sensor-failure', (_req, res) => {
    const state = engine.setScenarioSensorFailure();
    res.json({ success: true, message: 'Simulating sensor offline loss', state });
  });

  // Emergency triggers
  router.post('/emergency/toggle', (_req, res) => {
    const active = engine.toggleEmergencyMode();
    res.json({ emergencyModeActive: active });
  });

  router.post('/emergency/siren', (req, res) => {
    const { active } = req.body;
    const sirenActive = engine.toggleSiren(active);
    res.json({ sirenActive });
  });

  router.post('/emergency/sms', (_req, res) => {
    const result = engine.triggerSmsAlert();
    res.json(result);
  });

  return router;
}
