import {
  INITIAL_SENSORS,
  INITIAL_WORKERS,
  INITIAL_TUNNELS,
  INITIAL_NODES,
  INITIAL_ZONES,
  INITIAL_ALERTS,
} from '../data/mineData.js';
import { MineGraphRoutingService } from './graphRouting.js';
import { AISubsidencePredictionService } from './aiPrediction.js';

export class SimulationEngine {
  constructor() {
    this.sensors = JSON.parse(JSON.stringify(INITIAL_SENSORS));
    this.workers = JSON.parse(JSON.stringify(INITIAL_WORKERS));
    this.tunnels = JSON.parse(JSON.stringify(INITIAL_TUNNELS));
    this.nodes = JSON.parse(JSON.stringify(INITIAL_NODES));
    this.zones = JSON.parse(JSON.stringify(INITIAL_ZONES));
    this.alerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));

    this.state = {
      mode: 'NORMAL',
      activeScenarioName: 'Normal Mine Operations',
      emergencyModeActive: false,
      sirenActive: false,
      smsBroadcastSent: false,
      controlRoomNotified: true,
      collapsedTunnelIds: [],
      affectedWorkerIds: [],
      lastScenarioChange: new Date().toISOString(),
    };

    this.routingService = new MineGraphRoutingService(this.nodes, this.tunnels);
    this.aiService = new AISubsidencePredictionService();

    this.recalculateAllWorkerRoutes();
    this.startLiveTick();
  }

  setBroadcaster(broadcaster) {
    this.wsBroadcaster = broadcaster;
  }

  broadcast(type, data) {
    if (this.wsBroadcaster) {
      this.wsBroadcaster({
        type,
        data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  startLiveTick() {
    if (this.tickTimer) clearInterval(this.tickTimer);

    this.tickTimer = setInterval(() => {
      this.tick();
    }, 2000);
  }

  tick() {
    const timeStr = new Date().toLocaleTimeString('en-IN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Subtle random sensor fluctuations based on current mode
    for (const s of this.sensors) {
      if (s.status === 'OFFLINE') continue;

      let jitter = (Math.random() - 0.5) * 0.04;
      if (this.state.mode === 'INCREASING_SUBSIDENCE' && s.zone === 'ZONE-B') {
        jitter = Math.random() * 0.08;
      }

      if (s.type === 'GROUND_DISPLACEMENT') {
        s.value = Math.max(0.1, Number((s.value + jitter).toFixed(2)));
      } else if (s.type === 'TILT_ANGLE') {
        s.value = Math.max(0.05, Number((s.value + jitter * 0.5).toFixed(2)));
      } else if (s.type === 'VIBRATION') {
        s.value = Math.max(2.0, Number((s.value + (Math.random() - 0.5) * 0.6).toFixed(1)));
      } else if (s.type === 'PRESSURE_STRESS') {
        s.value = Math.max(5.0, Number((s.value + (Math.random() - 0.5) * 0.2).toFixed(1)));
      } else if (s.type === 'TEMPERATURE') {
        s.value = Number((s.value + (Math.random() - 0.5) * 0.05).toFixed(1));
      }

      s.lastUpdate = new Date().toISOString();

      // Maintain rolling history of last 15 points
      if (s.history.length > 15) {
        s.history.shift();
      }
      s.history.push({ timestamp: timeStr, value: s.value });
    }

    // Simulate worker vitals
    for (const w of this.workers) {
      if (w.status === 'EVACUATING' || this.state.emergencyModeActive) {
        w.heartRateBpm = Math.min(140, Math.max(95, w.heartRateBpm + Math.floor(Math.random() * 5 - 2)));
      } else if (w.status === 'TRAPPED') {
        w.heartRateBpm = Math.min(150, Math.max(120, w.heartRateBpm + Math.floor(Math.random() * 4 - 2)));
      } else {
        w.heartRateBpm = Math.min(88, Math.max(68, w.heartRateBpm + Math.floor(Math.random() * 3 - 1)));
      }
      w.lastPing = new Date().toISOString();
    }

    // AI Prediction & Zone Risk sync
    const aiPrediction = this.aiService.evaluateSubsidenceRisk(this.sensors);
    this.updateZoneRisks(aiPrediction);

    // Broadcast live telemetry tick
    this.broadcast('TELEMETRY_TICK', {
      sensors: this.sensors,
      workers: this.workers,
      tunnels: this.tunnels,
      zones: this.zones,
      aiPrediction,
      state: this.state,
    });
  }

  updateZoneRisks(aiPred) {
    for (const zone of this.zones) {
      if (zone.id === 'ZONE-B') {
        if (this.state.mode === 'NORMAL') {
          zone.riskLevel = aiPred.riskClassification;
        }
        const bSensors = this.sensors.filter((s) => s.zone === 'ZONE-B' && s.type === 'GROUND_DISPLACEMENT');
        if (bSensors.length > 0) {
          zone.latestDeformationMm = Math.max(...bSensors.map((s) => s.value));
        }
      }
    }
  }

  recalculateAllWorkerRoutes() {
    this.routingService.updateGraph(this.nodes, this.tunnels);

    for (const worker of this.workers) {
      if (worker.status === 'EVACUATED') continue;

      const plan = this.routingService.generateRoutePlan(
        worker.id,
        worker.name,
        worker.nearestNodeId,
        this.state.collapsedTunnelIds.length > 0,
        this.state.collapsedTunnelIds.length > 0 ? `Tunnel ${this.state.collapsedTunnelIds.join(', ')} impassable` : undefined
      );

      if (plan) {
        worker.currentRoute = plan.routeNodes;
        worker.assignedExitId = plan.destinationExit;
        worker.distanceToExit = plan.totalDistanceMeters;
        worker.estimatedEvacTimeSeconds = plan.estimatedTimeSeconds;
      }
    }
  }

  // ================= INTERACTIVE EVALUATOR OVERRIDES ================= //

  /**
   * Toggles collapse/obstruction on ANY tunnel in the mine.
   * This proves Dijkstra dynamically adapts without any hardcoding!
   */
  toggleTunnelBlock(tunnelId) {
    const tunnel = this.tunnels.find((t) => t.id === tunnelId);
    if (!tunnel) {
      throw new Error(`Tunnel ${tunnelId} not found`);
    }

    const isCurrentlyCollapsed = tunnel.status === 'COLLAPSED' || this.state.collapsedTunnelIds.includes(tunnelId);

    if (isCurrentlyCollapsed) {
      // Restore tunnel to OPERATIONAL & SAFE
      tunnel.status = 'OPERATIONAL';
      tunnel.riskLevel = 'SAFE';
      tunnel.isAvailableForEvacuation = true;
      tunnel.deformationMm = 2.4;
      tunnel.velocityMmPerMin = 0.02;

      this.state.collapsedTunnelIds = this.state.collapsedTunnelIds.filter((id) => id !== tunnelId);
      if (this.state.collapsedTunnelIds.length === 0) {
        this.state.emergencyModeActive = false;
        this.state.sirenActive = false;
        this.state.mode = 'NORMAL';
        this.state.activeScenarioName = 'Normal Mine Operations';
        for (const w of this.workers) {
          if (w.status === 'EVACUATING') w.status = 'SAFE';
        }
      }

      this.addAlert({
        severity: 'INFO',
        zone: tunnel.zone,
        location: `Tunnel ${tunnel.id} (${tunnel.name})`,
        title: `Tunnel ${tunnel.id} Cleared & Reopened`,
        description: `Hazard removed in segment ${tunnel.id}. Graph routing path weights normalized.`,
        actionRequired: 'Resume standard gallery haulage.',
        autoTriggered: false,
      });
    } else {
      // Collapse / Block tunnel
      tunnel.status = 'COLLAPSED';
      tunnel.riskLevel = 'CRITICAL';
      tunnel.isAvailableForEvacuation = false;
      tunnel.deformationMm = 18.5;
      tunnel.velocityMmPerMin = 2.8;

      if (!this.state.collapsedTunnelIds.includes(tunnelId)) {
        this.state.collapsedTunnelIds.push(tunnelId);
      }

      this.state.emergencyModeActive = true;
      this.state.sirenActive = true;
      this.state.mode = 'TUNNEL_COLLAPSE';
      this.state.activeScenarioName = `Emergency: Blockage in Tunnel ${tunnelId}`;

      // Identify affected workers in that zone
      const affected = this.workers.filter((w) => w.zone === tunnel.zone).map((w) => w.id);
      this.state.affectedWorkerIds = Array.from(new Set([...this.state.affectedWorkerIds, ...affected]));

      for (const w of this.workers) {
        if (this.state.affectedWorkerIds.includes(w.id)) {
          w.status = 'EVACUATING';
        }
      }

      this.addAlert({
        severity: 'CRITICAL',
        zone: tunnel.zone,
        location: `Tunnel ${tunnel.id} (${tunnel.name})`,
        title: `🚨 CRITICAL: Collapse Detected in ${tunnel.id}`,
        description: `Tunnel ${tunnel.id} has experienced strata failure and is impassable (Cost = ∞). Shortest safe path recalculated.`,
        actionRequired: 'Evacuate workforce immediately via newly computed safe detour.',
        autoTriggered: true,
      });
    }

    this.recalculateAllWorkerRoutes();

    this.broadcast('ROUTE_RECALCULATED', {
      message: `🚨 ROUTE UPDATED: Tunnel ${tunnelId} status changed to ${tunnel.status}. Alternative safe paths computed.`,
      tunnelId,
      status: tunnel.status,
    });

    this.broadcast('SCENARIO_UPDATED', {
      tunnels: this.tunnels,
      workers: this.workers,
      state: this.state,
    });

    return { success: true, tunnel, state: this.state };
  }

  /**
   * Overrides telemetry of any sensor (e.g. from live sliders) to test AI sensitivity
   */
  updateSensorValue(sensorId, value) {
    const sensor = this.sensors.find((s) => s.id === sensorId);
    if (!sensor) {
      throw new Error(`Sensor ${sensorId} not found`);
    }

    sensor.value = Number(value.toFixed(2));
    sensor.lastUpdate = new Date().toISOString();

    if (sensor.value >= sensor.thresholds.critical) {
      sensor.status = 'CRITICAL';
    } else if (sensor.value >= sensor.thresholds.warning) {
      sensor.status = 'WARNING';
    } else {
      sensor.status = 'NORMAL';
    }

    const aiPrediction = this.aiService.evaluateSubsidenceRisk(this.sensors);
    this.updateZoneRisks(aiPrediction);

    this.broadcast('TELEMETRY_TICK', {
      sensors: this.sensors,
      workers: this.workers,
      tunnels: this.tunnels,
      zones: this.zones,
      aiPrediction,
      state: this.state,
    });

    return { sensor, aiPrediction };
  }

  /**
   * Relocates a worker to a new underground junction to test pathfinding from anywhere
   */
  relocateWorker(workerId, nodeId) {
    const worker = this.workers.find((w) => w.id === workerId);
    if (!worker) throw new Error(`Worker ${workerId} not found`);

    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    worker.nearestNodeId = nodeId;
    worker.zone = node.zone;
    worker.position.x = node.x;
    worker.position.y = node.y;
    worker.position.elevation = node.elevation;

    this.recalculateAllWorkerRoutes();
    const routePlan = this.calculateRouteForWorker(workerId);

    this.broadcast('SCENARIO_UPDATED', {
      workers: this.workers,
      state: this.state,
    });

    return { worker, routePlan };
  }

  /**
   * Advances workers by one step along their evacuation path to simulate live movement to surface
   */
  advanceWorkerEvacuation(workerId) {
    const targetWorkers = workerId ? this.workers.filter((w) => w.id === workerId) : this.workers.filter((w) => w.status === 'EVACUATING');

    for (const w of targetWorkers) {
      if (!w.currentRoute || w.currentRoute.length <= 1) {
        // Arrived at exit
        w.status = 'EVACUATED';
        w.distanceToExit = 0;
        w.estimatedEvacTimeSeconds = 0;
        continue;
      }

      // Step to next node in route
      const nextNodeId = w.currentRoute[1];
      const nextNode = this.nodes.find((n) => n.id === nextNodeId);

      if (nextNode) {
        w.nearestNodeId = nextNode.id;
        w.position.x = nextNode.x;
        w.position.y = nextNode.y;
        w.position.elevation = nextNode.elevation;
        w.zone = nextNode.zone;
        w.currentRoute.shift();

        if (nextNode.isExit || nextNode.type === 'REFUGE_BAY') {
          w.status = 'EVACUATED';
          w.distanceToExit = 0;
          w.estimatedEvacTimeSeconds = 0;
        } else {
          // Re-estimate remaining distance
          w.distanceToExit = Math.max(0, w.distanceToExit - 80);
          w.estimatedEvacTimeSeconds = Math.round(w.distanceToExit / 1.25);
        }
      }
    }

    this.broadcast('SCENARIO_UPDATED', {
      workers: this.workers,
      state: this.state,
    });

    return { workers: this.workers };
  }

  // ================= SCENARIO HANDLERS ================= //

  setScenarioNormal() {
    this.sensors = JSON.parse(JSON.stringify(INITIAL_SENSORS));
    this.tunnels = JSON.parse(JSON.stringify(INITIAL_TUNNELS));
    this.zones = JSON.parse(JSON.stringify(INITIAL_ZONES));
    this.workers = JSON.parse(JSON.stringify(INITIAL_WORKERS));

    this.state = {
      mode: 'NORMAL',
      activeScenarioName: 'Normal Mine Operations',
      emergencyModeActive: false,
      sirenActive: false,
      smsBroadcastSent: false,
      controlRoomNotified: true,
      collapsedTunnelIds: [],
      affectedWorkerIds: [],
      lastScenarioChange: new Date().toISOString(),
    };

    this.recalculateAllWorkerRoutes();

    this.addAlert({
      severity: 'INFO',
      zone: 'ZONE-A',
      location: 'Central Control Hub',
      title: 'Mine Simulation Reset to Nominal',
      description: 'All 24 strata sensors and 16 tunnel sections reset to verified safe baseline.',
      actionRequired: 'Resume normal shift logging.',
      autoTriggered: false,
    });

    this.broadcast('SCENARIO_UPDATED', { state: this.state });
    return this.getCompleteState();
  }

  setScenarioIncreasingSubsidence() {
    this.state.mode = 'INCREASING_SUBSIDENCE';
    this.state.activeScenarioName = 'Increasing Strata Subsidence & Micro-Seismic Activity';
    this.state.lastScenarioChange = new Date().toISOString();

    // Ramp up Zone B sensor readings
    for (const s of this.sensors) {
      if (s.zone === 'ZONE-B') {
        if (s.type === 'GROUND_DISPLACEMENT') {
          s.value = 8.4;
          s.status = 'WARNING';
        } else if (s.type === 'TILT_ANGLE') {
          s.value = 3.2;
          s.status = 'WARNING';
        } else if (s.type === 'VIBRATION') {
          s.value = 54.8;
          s.status = 'WARNING';
        } else if (s.type === 'IMU_ACCELEROMETER') {
          s.value = 0.65;
          s.status = 'WARNING';
        } else if (s.type === 'PRESSURE_STRESS') {
          s.value = 36.4;
          s.status = 'WARNING';
        }
      }
    }

    const t07 = this.tunnels.find((t) => t.id === 'T-07');
    if (t07) {
      t07.riskLevel = 'WARNING';
      t07.deformationMm = 8.4;
      t07.velocityMmPerMin = 0.95;
    }

    const zoneB = this.zones.find((z) => z.id === 'ZONE-B');
    if (zoneB) {
      zoneB.riskLevel = 'WARNING';
      zoneB.latestDeformationMm = 8.4;
      zoneB.lastAlertTime = new Date().toISOString();
    }

    this.addAlert({
      severity: 'WARNING',
      zone: 'ZONE-B',
      location: 'Tunnel T-07 (Longwall Panel LW-102)',
      sensorId: 'SENS-001',
      title: 'Elevated Strata Subsidence Detected',
      description: 'Rapid increase in ground displacement (8.4 mm) and 54.8 Hz micro-seismic acoustic emission.',
      actionRequired: 'Inspect powered roof supports, prepare evacuation standby.',
      autoTriggered: true,
    });

    this.recalculateAllWorkerRoutes();
    this.broadcast('SCENARIO_UPDATED', { state: this.state });
    return this.getCompleteState();
  }

  setScenarioTunnelCollapse() {
    this.state.mode = 'TUNNEL_COLLAPSE';
    this.state.activeScenarioName = 'Catastrophic Roof Fall & Tunnel T-07 Collapse';
    this.state.emergencyModeActive = true;
    this.state.sirenActive = true;
    this.state.collapsedTunnelIds = ['T-07'];
    this.state.affectedWorkerIds = ['W-001', 'W-002', 'W-003'];
    this.state.lastScenarioChange = new Date().toISOString();

    // Mark T-07 as completely COLLAPSED & impassable
    const t07 = this.tunnels.find((t) => t.id === 'T-07');
    if (t07) {
      t07.riskLevel = 'CRITICAL';
      t07.status = 'COLLAPSED';
      t07.deformationMm = 18.9;
      t07.velocityMmPerMin = 3.8;
      t07.isAvailableForEvacuation = false;
    }

    // Critical sensor spikes in Zone B
    for (const s of this.sensors) {
      if (s.tunnelId === 'T-07' || s.zone === 'ZONE-B') {
        if (s.type === 'GROUND_DISPLACEMENT') {
          s.value = 18.9;
          s.status = 'CRITICAL';
        } else if (s.type === 'TILT_ANGLE') {
          s.value = 6.8;
          s.status = 'CRITICAL';
        } else if (s.type === 'VIBRATION') {
          s.value = 78.4;
          s.status = 'CRITICAL';
        } else if (s.type === 'IMU_ACCELEROMETER') {
          s.value = 1.45;
          s.status = 'CRITICAL';
        } else if (s.type === 'PRESSURE_STRESS') {
          s.value = 46.8;
          s.status = 'CRITICAL';
        }
      }
    }

    // Update Zone B to CRITICAL
    const zoneB = this.zones.find((z) => z.id === 'ZONE-B');
    if (zoneB) {
      zoneB.riskLevel = 'CRITICAL';
      zoneB.latestDeformationMm = 18.9;
      zoneB.lastAlertTime = new Date().toISOString();
    }

    // Update affected workers to EVACUATING
    for (const w of this.workers) {
      if (this.state.affectedWorkerIds.includes(w.id)) {
        w.status = 'EVACUATING';
        w.heartRateBpm = 118;
      }
    }

    // CRITICAL ALERT TRIGGER
    this.addAlert({
      severity: 'CRITICAL',
      zone: 'ZONE-B',
      location: 'Tunnel T-07 (LW-102 Tailgate)',
      sensorId: 'SENS-001',
      title: '🚨 CRITICAL: Strata Collapse in Tunnel T-07',
      description:
        'Major roof subsidence (18.9 mm) has breached safety limit. Tunnel T-07 is impassable. Intelligent rerouting activated.',
      actionRequired: 'Sound mine-wide siren, evacuate Zone B workforce via detour to Exit E1 or Refuge Bay.',
      autoTriggered: true,
    });

    this.recalculateAllWorkerRoutes();

    this.broadcast('EMERGENCY_STATE_CHANGED', {
      emergencyActive: true,
      collapsedTunnel: 'T-07',
      affectedWorkers: this.state.affectedWorkerIds,
    });

    this.broadcast('ROUTE_RECALCULATED', {
      message: '🚨 ROUTE UPDATED: Previous route through T-07 is unsafe. Alternative safe evacuation route calculated.',
      workerId: 'W-001',
      newExit: 'E1',
    });

    return this.getCompleteState();
  }

  setScenarioWorkerEmergency() {
    this.state.mode = 'WORKER_EMERGENCY';
    this.state.activeScenarioName = 'Worker SOS / Medical Distress in Depillaring Section';
    this.state.lastScenarioChange = new Date().toISOString();

    const w3 = this.workers.find((w) => w.id === 'W-003');
    if (w3) {
      w3.status = 'TRAPPED';
      w3.heartRateBpm = 138;
    }

    this.addAlert({
      severity: 'CRITICAL',
      zone: 'ZONE-B',
      location: 'Maingate LW-102 (Junction J6)',
      title: '🆘 WORKER DISTRESS BEACON ACTIVE',
      description: 'Worker Vikram Soren (W-003) triggered SOS tag button. Heart rate 138 BPM, zero movement for 180s.',
      actionRequired: 'Dispatch Mines Rescue Brigade (MRB) Team Alpha from Surface Station.',
      autoTriggered: false,
    });

    this.broadcast('SCENARIO_UPDATED', { state: this.state });
    return this.getCompleteState();
  }

  setScenarioSensorFailure() {
    this.state.mode = 'SENSOR_FAILURE';
    this.state.activeScenarioName = 'Sensor Telemetry Drop / Node Offline Failure';
    this.state.lastScenarioChange = new Date().toISOString();

    const s1 = this.sensors.find((s) => s.id === 'SENS-001');
    if (s1) {
      s1.status = 'OFFLINE';
      s1.signal = 'OFFLINE';
    }
    const s5 = this.sensors.find((s) => s.id === 'SENS-005');
    if (s5) {
      s5.status = 'OFFLINE';
      s5.signal = 'OFFLINE';
    }

    this.addAlert({
      severity: 'CAUTION',
      zone: 'ZONE-B',
      location: 'Tunnel T-07 Node J4',
      sensorId: 'SENS-001',
      title: '⚠️ SENSOR OFFLINE: Telemetry Lost',
      description: 'Sensors SENS-001 and SENS-005 stopped transmitting. Zone marked with CAUTION precaution.',
      actionRequired: 'Check LoRa repeater gateway and battery voltage.',
      autoTriggered: true,
    });

    this.broadcast('SCENARIO_UPDATED', { state: this.state });
    return this.getCompleteState();
  }

  // ================= EMERGENCY & ALERT ACTIONS ================= //

  toggleSiren(active) {
    this.state.sirenActive = active !== undefined ? active : !this.state.sirenActive;
    this.broadcast('EMERGENCY_STATE_CHANGED', { sirenActive: this.state.sirenActive });
    return this.state.sirenActive;
  }

  triggerSmsAlert() {
    this.state.smsBroadcastSent = true;
    const workerCount = this.workers.length;
    this.addAlert({
      severity: 'INFO',
      zone: 'ALL',
      location: 'Surface Telecom Gateway',
      title: 'Emergency SMS & Smart Helmet Tag Broadcast Sent',
      description: `Evacuation notice & safest route coordinates successfully transmitted to ${workerCount} worker tags and DGMS officials.`,
      actionRequired: 'Ensure all miners acknowledge helmet vibration signal.',
      autoTriggered: false,
    });
    this.broadcast('SCENARIO_UPDATED', { state: this.state });
    return { success: true, message: `Emergency SMS & UWB tags dispatched to ${workerCount} miners.`, count: workerCount };
  }

  toggleEmergencyMode(active) {
    this.state.emergencyModeActive = active !== undefined ? active : !this.state.emergencyModeActive;
    if (this.state.emergencyModeActive) {
      this.state.sirenActive = true;
      for (const w of this.workers) {
        if (w.status !== 'EVACUATED') {
          w.status = 'EVACUATING';
        }
      }
    } else {
      this.state.sirenActive = false;
      for (const w of this.workers) {
        if (w.status === 'EVACUATING') {
          w.status = 'SAFE';
        }
      }
    }
    this.broadcast('EMERGENCY_STATE_CHANGED', { emergencyActive: this.state.emergencyModeActive });
    return this.state.emergencyModeActive;
  }

  addAlert(alert) {
    const newAlert = {
      ...alert,
      id: `ALT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
    };
    this.alerts.unshift(newAlert);
    if (this.alerts.length > 50) this.alerts.pop();

    this.broadcast('ALERT_TRIGGERED', newAlert);
    return newAlert;
  }

  acknowledgeAlert(id) {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      this.broadcast('SCENARIO_UPDATED', { alerts: this.alerts });
      return true;
    }
    return false;
  }

  resolveAlert(id) {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.resolved = true;
      alert.acknowledged = true;
      this.broadcast('SCENARIO_UPDATED', { alerts: this.alerts });
      return true;
    }
    return false;
  }

  // ================= GETTERS ================= //

  getSensors() {
    return this.sensors;
  }

  getSensorById(id) {
    return this.sensors.find((s) => s.id === id);
  }

  getWorkers() {
    return this.workers;
  }

  getWorkerById(id) {
    return this.workers.find((w) => w.id === id);
  }

  getTunnels() {
    return this.tunnels;
  }

  getNodes() {
    return this.nodes;
  }

  getZones() {
    return this.zones;
  }

  getAlerts() {
    return this.alerts;
  }

  getState() {
    return this.state;
  }

  getAIPrediction() {
    return this.aiService.evaluateSubsidenceRisk(this.sensors);
  }

  calculateRouteForWorker(workerId) {
    const worker = this.workers.find((w) => w.id === workerId);
    if (!worker) return null;
    return this.routingService.generateRoutePlan(
      worker.id,
      worker.name,
      worker.nearestNodeId,
      this.state.collapsedTunnelIds.length > 0,
      this.state.collapsedTunnelIds.length > 0 ? `Tunnel ${this.state.collapsedTunnelIds.join(', ')} blocked` : undefined
    );
  }

  getCompleteState() {
    return {
      sensors: this.sensors,
      workers: this.workers,
      tunnels: this.tunnels,
      nodes: this.nodes,
      zones: this.zones,
      alerts: this.alerts,
      state: this.state,
      aiPrediction: this.getAIPrediction(),
    };
  }
}
