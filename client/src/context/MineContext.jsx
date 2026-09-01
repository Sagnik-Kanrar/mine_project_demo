import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { socketManager } from '../services/socket';
import { audioSynth } from '../utils/audioSynth';

const MineContext = createContext(null);

export const MineProvider = ({ children }) => {
  const [sensors, setSensors] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [tunnels, setTunnels] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [zones, setZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [simulationState, setSimulationState] = useState({
    mode: 'NORMAL',
    activeScenarioName: 'Normal Mine Operations',
    emergencyModeActive: false,
    sirenActive: false,
    smsBroadcastSent: false,
    controlRoomNotified: true,
    collapsedTunnelIds: [],
    affectedWorkerIds: [],
    lastScenarioChange: new Date().toISOString(),
  });

  const [activePage, setActivePage] = useState('dashboard');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('ALL');
  const [selectedTunnel, setSelectedTunnel] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [activeRouteWorkerId, setActiveRouteWorkerId] = useState('W-001');
  const [activeRoutePlan, setActiveRoutePlan] = useState(null);
  const [isEmergencyHUDOpen, setIsEmergencyHUDOpen] = useState(false);
  const [isSIHTourOpen, setIsSIHTourOpen] = useState(false);
  const [isSensorSimulatorOpen, setIsSensorSimulatorOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [bannerNotification, setBannerNotification] = useState(null);

  // Fetch initial full state
  const loadInitialData = useCallback(async () => {
    try {
      const data = await api.getFullState();
      if (data) {
        if (data.sensors) setSensors(data.sensors);
        if (data.workers) setWorkers(data.workers);
        if (data.tunnels) setTunnels(data.tunnels);
        if (data.nodes) setNodes(data.nodes);
        if (data.zones) setZones(data.zones);
        if (data.alerts) setAlerts(data.alerts);
        if (data.aiPrediction) setAiPrediction(data.aiPrediction);
        if (data.state) setSimulationState(data.state);
        setLastUpdated(new Date().toISOString());
      }
    } catch (e) {
      console.warn('Backend connection not yet established, will retry via WebSocket.', e);
    }
  }, []);

  const fetchWorkerRoute = useCallback(async (workerId) => {
    try {
      const plan = await api.getWorkerRoute(workerId);
      setActiveRoutePlan(plan);
      return plan;
    } catch (e) {
      return null;
    }
  }, []);

  useEffect(() => {
    loadInitialData();

    // Initial default worker route
    fetchWorkerRoute('W-001');

    socketManager.setConnectionCallback((connected) => {
      setIsConnected(connected);
    });
    socketManager.connect();

    // WS handlers
    const unsubInit = socketManager.subscribe('INIT_STATE', (data) => {
      if (data.sensors) setSensors(data.sensors);
      if (data.workers) setWorkers(data.workers);
      if (data.tunnels) setTunnels(data.tunnels);
      if (data.nodes) setNodes(data.nodes);
      if (data.zones) setZones(data.zones);
      if (data.alerts) setAlerts(data.alerts);
      if (data.aiPrediction) setAiPrediction(data.aiPrediction);
      if (data.state) setSimulationState(data.state);
      setLastUpdated(new Date().toISOString());
    });

    const unsubTick = socketManager.subscribe('TELEMETRY_TICK', (data) => {
      if (data.sensors) setSensors(data.sensors);
      if (data.workers) setWorkers(data.workers);
      if (data.tunnels) setTunnels(data.tunnels);
      if (data.zones) setZones(data.zones);
      if (data.aiPrediction) setAiPrediction(data.aiPrediction);
      if (data.state) setSimulationState(data.state);
      setLastUpdated(new Date().toISOString());
    });

    const unsubAlert = socketManager.subscribe('ALERT_TRIGGERED', (alert) => {
      setAlerts((prev) => [alert, ...prev]);
      if (alert.severity === 'CRITICAL') {
        audioSynth.playWarning();
        setBannerNotification(`🚨 CRITICAL ALERT: ${alert.title} - ${alert.location}`);
      } else if (alert.severity === 'WARNING') {
        audioSynth.playWarning();
        setBannerNotification(`⚠️ WARNING: ${alert.title}`);
      }
    });

    const unsubScenario = socketManager.subscribe('SCENARIO_UPDATED', (data) => {
      if (data.state) setSimulationState(data.state);
      if (data.alerts) setAlerts(data.alerts);
      if (data.workers) setWorkers(data.workers);
      if (data.tunnels) setTunnels(data.tunnels);
    });

    const unsubEmergency = socketManager.subscribe('EMERGENCY_STATE_CHANGED', (data) => {
      if (data.emergencyActive !== undefined) {
        setIsEmergencyHUDOpen(data.emergencyActive);
        if (data.emergencyActive) {
          audioSynth.startSiren();
        } else {
          audioSynth.stopSiren();
        }
      }
      if (data.sirenActive !== undefined) {
        if (data.sirenActive) audioSynth.startSiren();
        else audioSynth.stopSiren();
      }
    });

    const unsubRoute = socketManager.subscribe('ROUTE_RECALCULATED', (data) => {
      setBannerNotification(data.message);
      audioSynth.playWarning();
      if (activeRouteWorkerId) {
        fetchWorkerRoute(activeRouteWorkerId);
      }
    });

    return () => {
      unsubInit();
      unsubTick();
      unsubAlert();
      unsubScenario();
      unsubEmergency();
      unsubRoute();
    };
  }, [loadInitialData, fetchWorkerRoute, activeRouteWorkerId]);

  // Sync active route on worker selection change
  useEffect(() => {
    if (activeRouteWorkerId) {
      fetchWorkerRoute(activeRouteWorkerId);
    }
  }, [activeRouteWorkerId, fetchWorkerRoute]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioSynth.setMuted(next);
  };

  const clearBannerNotification = () => setBannerNotification(null);

  // Dynamic Evaluator Overrides
  const toggleTunnelBlock = async (tunnelId) => {
    audioSynth.playWarning();
    const res = await api.toggleTunnelBlock(tunnelId);
    if (res.tunnel) {
      setTunnels((prev) => prev.map((t) => (t.id === tunnelId ? res.tunnel : t)));
    }
    if (res.state) {
      setSimulationState(res.state);
    }
    if (activeRouteWorkerId) {
      fetchWorkerRoute(activeRouteWorkerId);
    }
    const isNowBlocked = res.tunnel?.status === 'COLLAPSED';
    setBannerNotification(
      isNowBlocked
        ? `🚨 Tunnel ${tunnelId} marked COLLAPSED. Dijkstra recalculating safe detour.`
        : `🟢 Tunnel ${tunnelId} restored to OPERATIONAL status.`
    );
  };

  const overrideSensorValue = async (sensorId, value) => {
    const res = await api.overrideSensorValue(sensorId, value);
    if (res.sensor) {
      setSensors((prev) => prev.map((s) => (s.id === sensorId ? res.sensor : s)));
    }
    if (res.aiPrediction) {
      setAiPrediction(res.aiPrediction);
    }
  };

  const relocateWorker = async (workerId, nodeId) => {
    audioSynth.playClick();
    const res = await api.relocateWorker(workerId, nodeId);
    if (res.worker) {
      setWorkers((prev) => prev.map((w) => (w.id === workerId ? res.worker : w)));
    }
    if (res.routePlan) {
      setActiveRoutePlan(res.routePlan);
    }
    setBannerNotification(`📍 Worker ${workerId} relocated to ${nodeId}. Safe route recalculated.`);
  };

  const advanceEvacuation = async (workerId) => {
    audioSynth.playClick();
    const res = await api.advanceEvacuation(workerId);
    if (res.workers) {
      setWorkers(res.workers);
    }
    if (activeRouteWorkerId) {
      fetchWorkerRoute(activeRouteWorkerId);
    }
  };

  // Scenario Triggers
  const runScenarioNormal = async () => {
    audioSynth.playClick();
    audioSynth.stopSiren();
    setIsEmergencyHUDOpen(false);
    const res = await api.simulateNormal();
    if (res.state) {
      setSensors(res.state.sensors);
      setWorkers(res.state.workers);
      setTunnels(res.state.tunnels);
      setZones(res.state.zones);
      setAiPrediction(res.state.aiPrediction);
      setSimulationState(res.state.state);
    }
    if (activeRouteWorkerId) fetchWorkerRoute(activeRouteWorkerId);
    setBannerNotification('🟢 Simulation Reset: Normal Baseline Operations Restored.');
  };

  const runScenarioSubsidence = async () => {
    audioSynth.playWarning();
    const res = await api.simulateIncreasingSubsidence();
    if (res.state) {
      setSensors(res.state.sensors);
      setTunnels(res.state.tunnels);
      setZones(res.state.zones);
      setAiPrediction(res.state.aiPrediction);
      setSimulationState(res.state.state);
    }
    if (activeRouteWorkerId) fetchWorkerRoute(activeRouteWorkerId);
    setBannerNotification('⚠️ Simulation: Increasing Subsidence & Strata Movement Injected in Zone B.');
  };

  const runScenarioCollapse = async () => {
    audioSynth.playWarning();
    audioSynth.startSiren();
    const res = await api.simulateTunnelCollapse();
    if (res.state) {
      setSensors(res.state.sensors);
      setWorkers(res.state.workers);
      setTunnels(res.state.tunnels);
      setZones(res.state.zones);
      setAiPrediction(res.state.aiPrediction);
      setSimulationState(res.state.state);
    }
    setIsEmergencyHUDOpen(true);
    if (activeRouteWorkerId) fetchWorkerRoute(activeRouteWorkerId);
    setBannerNotification('🚨 CATASTROPHIC COLLAPSE: Tunnel T-07 Blocked. Dynamic Safe Rerouting Active!');
  };

  const runScenarioWorkerSOS = async () => {
    audioSynth.playWarning();
    const res = await api.simulateWorkerEmergency();
    if (res.state) {
      setWorkers(res.state.workers);
      setSimulationState(res.state.state);
    }
    setBannerNotification('🆘 WORKER DISTRESS: Worker W-003 SOS beacon activated in Zone B.');
  };

  const runScenarioSensorOffline = async () => {
    audioSynth.playClick();
    const res = await api.simulateSensorFailure();
    if (res.state) {
      setSensors(res.state.sensors);
      setSimulationState(res.state.state);
    }
    setBannerNotification('⚠️ SENSOR OFFLINE: Telemetry signal loss simulated on SENS-001.');
  };

  const toggleEmergency = async () => {
    audioSynth.playClick();
    const nextState = !isEmergencyHUDOpen;
    setIsEmergencyHUDOpen(nextState);
    if (nextState) {
      audioSynth.startSiren();
    } else {
      audioSynth.stopSiren();
    }
    await api.toggleEmergency();
  };

  const toggleSiren = async (active) => {
    audioSynth.playClick();
    const res = await api.toggleSiren(active);
    if (res.sirenActive) {
      audioSynth.startSiren();
    } else {
      audioSynth.stopSiren();
    }
  };

  const sendEmergencySMS = async () => {
    audioSynth.playSuccess();
    const res = await api.sendEmergencySMS();
    setBannerNotification(`📱 ${res.message}`);
    return res;
  };

  const acknowledgeAlert = async (id) => {
    audioSynth.playClick();
    await api.acknowledgeAlert(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  const resolveAlert = async (id) => {
    audioSynth.playSuccess();
    await api.resolveAlert(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true, acknowledged: true } : a)));
  };

  return (
    <MineContext.Provider
      value={{
        sensors,
        workers,
        tunnels,
        nodes,
        zones,
        alerts,
        aiPrediction,
        simulationState,
        activePage,
        selectedTunnel,
        selectedWorker,
        selectedSensor,
        activeRouteWorkerId,
        activeRoutePlan,
        isEmergencyHUDOpen,
        isSIHTourOpen,
        isSensorSimulatorOpen,
        isMuted,
        isConnected,
        selectedZoneFilter,
        lastUpdated,
        bannerNotification,

        setActivePage,
        setSelectedZoneFilter,
        setSelectedTunnel,
        setSelectedWorker,
        setSelectedSensor,
        setActiveRouteWorkerId,
        setIsEmergencyHUDOpen,
        setIsSIHTourOpen,
        setIsSensorSimulatorOpen,
        toggleMute,
        clearBannerNotification,

        runScenarioNormal,
        runScenarioSubsidence,
        runScenarioCollapse,
        runScenarioWorkerSOS,
        runScenarioSensorOffline,

        toggleTunnelBlock,
        overrideSensorValue,
        relocateWorker,
        advanceEvacuation,

        toggleEmergency,
        toggleSiren,
        sendEmergencySMS,
        acknowledgeAlert,
        resolveAlert,
        fetchWorkerRoute,
      }}
    >
      {children}
    </MineContext.Provider>
  );
};

export const useMine = () => {
  const context = useContext(MineContext);
  if (!context) {
    throw new Error('useMine must be used within a MineProvider');
  }
  return context;
};
