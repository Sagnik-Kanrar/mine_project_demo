import React, { useState, useMemo } from 'react';
import { useMine } from '../../context/MineContext';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Shield,
  MapPin,
  Radio,
  HardHat,
  Flame,
  Wind,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

export const MineMapCanvas = ({
  nodes = [],
  tunnels = [],
  sensors = [],
  workers = [],
  activeRoutePlan,
  selectedTunnel,
  selectedWorker,
  selectedSensor,
  onSelectTunnel,
  onSelectWorker,
  onSelectSensor,
  zoneFilter = 'ALL',
  height = 620,
  compact = false,
}) => {
  const { toggleTunnelBlock, relocateWorker, advanceEvacuation, activeRouteWorkerId } = useMine();

  const [zoom, setZoom] = useState(1);
  const [showSensors, setShowSensors] = useState(true);
  const [showWorkers, setShowWorkers] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showPillars, setShowPillars] = useState(true);
  const [showVentilation, setShowVentilation] = useState(true);

  // Selected item popover on canvas
  const [inspectedTunnel, setInspectedTunnel] = useState(null);
  const [inspectedNode, setInspectedNode] = useState(null);

  // Map nodes to coordinates map
  const nodeMap = useMemo(() => {
    const map = new Map();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const getRiskColor = (level, status) => {
    if (status === 'COLLAPSED') return '#EF4444';
    switch (level) {
      case 'CRITICAL':
        return '#EF4444';
      case 'WARNING':
        return '#F97316';
      case 'CAUTION':
        return '#F59E0B';
      case 'SAFE':
      default:
        return '#10B981';
    }
  };

  // Compute evacuation polyline points from active route plan
  const routePoints = useMemo(() => {
    if (!activeRoutePlan || !activeRoutePlan.routeNodes || activeRoutePlan.routeNodes.length < 2) {
      return '';
    }
    return activeRoutePlan.routeNodes
      .map((nodeId) => {
        const node = nodeMap.get(nodeId);
        return node ? `${node.x},${node.y}` : '';
      })
      .filter(Boolean)
      .join(' ');
  }, [activeRoutePlan, nodeMap]);

  const handleZoomIn = () => setZoom((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))));
  const handleResetZoom = () => setZoom(1);

  const handleTunnelClick = (t) => {
    setInspectedTunnel(t);
    setInspectedNode(null);
    onSelectTunnel?.(t);
  };

  const handleNodeClick = (n) => {
    setInspectedNode(n);
    setInspectedTunnel(null);
  };

  const handleToggleCurrentTunnel = async (tId) => {
    await toggleTunnelBlock(tId);
    const updated = tunnels.find((t) => t.id === tId);
    if (updated) {
      setInspectedTunnel({ ...updated });
    }
  };

  const handleRelocateCurrentWorker = async (nodeId) => {
    const targetWorkerId = activeRouteWorkerId || selectedWorker?.id || 'W-001';
    await relocateWorker(targetWorkerId, nodeId);
    setInspectedNode(null);
  };

  const evacuatingWorkersCount = workers.filter((w) => w.status === 'EVACUATING').length;

  return (
    <div className="relative flex flex-col w-full overflow-hidden rounded-2xl border border-mine-border bg-[#050811] shadow-2xl">
      {/* Top Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mine-border/80 bg-mine-card/85 px-4 py-2.5 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              Underground Mine Vector Network (Raniganj Seam 3)
            </span>
          </div>
          <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
            CAD Survey: DGMS Plan 1:500m
          </span>
        </div>

        {/* View Toggles, Evac Step & Zoom */}
        <div className="flex items-center gap-2">
          {evacuatingWorkersCount > 0 && (
            <button
              onClick={() => advanceEvacuation()}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 font-mono text-xs font-bold transition shadow-[0_0_12px_rgba(6,182,212,0.4)] animate-pulse"
              title="Step workers forward along safe route"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Step Evacuation ({evacuatingWorkersCount})</span>
            </button>
          )}

          {!compact && (
            <div className="hidden lg:flex items-center gap-1 border-r border-mine-border pr-2 mr-1 text-xs">
              <button
                onClick={() => setShowPillars(!showPillars)}
                className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                  showPillars ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Solid Coal Pillars"
              >
                <span>Pillars</span>
              </button>
              <button
                onClick={() => setShowVentilation(!showVentilation)}
                className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                  showVentilation ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Ventilation Airflow Vectors"
              >
                <Wind className="h-3 w-3" />
                <span>Airflow</span>
              </button>
              <button
                onClick={() => setShowSensors(!showSensors)}
                className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                  showSensors ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Strata Sensors"
              >
                <Radio className="h-3 w-3" />
                <span>Sensors</span>
              </button>
              <button
                onClick={() => setShowWorkers(!showWorkers)}
                className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                  showWorkers ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Tagged Miners"
              >
                <HardHat className="h-3 w-3" />
                <span>Miners</span>
              </button>
            </div>
          )}

          <div className="flex items-center bg-slate-900/90 rounded-lg border border-slate-800 p-0.5">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition font-mono text-[11px]"
              title="Reset Zoom"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Vector Coal Mine Canvas */}
      <div
        className="relative w-full overflow-auto bg-[#050811] select-none flex items-center justify-center p-2"
        style={{ height }}
      >
        <svg
          viewBox="0 0 1000 620"
          className="w-full h-full max-w-full transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <defs>
            {/* Surveying Background Grid */}
            <pattern id="surveyGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(24, 34, 53, 0.45)" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="1.5" fill="rgba(6, 182, 212, 0.2)" />
            </pattern>

            {/* Solid Coal Pillar Hatching Pattern */}
            <pattern id="coalPillarHatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="10" height="10" fill="#0C1322" />
              <line x1="0" y1="0" x2="0" y2="10" stroke="#1E293B" strokeWidth="2.5" />
            </pattern>

            {/* Goaf Caved Rock Breakdown Pattern */}
            <pattern id="goafTexture" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill="#18110D" />
              <path d="M 0 0 L 8 8 M 8 0 L 0 8 M 8 8 L 16 16 M 16 8 L 8 16" stroke="#451A03" strokeWidth="1" opacity="0.6" />
            </pattern>

            {/* Glowing filter for evacuation path */}
            <filter id="evacGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Collapse Warning Hazard Pattern */}
            <pattern id="collapseHazard" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="7" height="14" fill="#EF4444" opacity="0.9" />
              <rect x="7" width="7" height="14" fill="#7F1D1D" opacity="0.95" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width="1000" height="620" fill="url(#surveyGrid)" />

          {/* Geological Zone Boundaries & Depth Shading */}
          {showZones && (
            <g className="zones-layer" opacity="0.9">
              {/* Zone A: Main Incline (-140m) */}
              <rect
                x="40"
                y="30"
                width="340"
                height="390"
                rx="16"
                fill="rgba(16, 185, 129, 0.02)"
                stroke="rgba(16, 185, 129, 0.25)"
                strokeDasharray="4 4"
                strokeWidth="1.2"
              />
              <text x="56" y="52" fill="#10B981" fontSize="11" fontWeight="bold" fontFamily="monospace">
                ZONE A: MAIN INCLINE (Seam 3, -140m R.L.)
              </text>

              {/* Zone B: Longwall Face LW-102 (-260m) */}
              <rect
                x="410"
                y="160"
                width="545"
                height="240"
                rx="16"
                fill="rgba(245, 158, 11, 0.03)"
                stroke="rgba(245, 158, 11, 0.28)"
                strokeDasharray="4 4"
                strokeWidth="1.2"
              />
              <text x="426" y="182" fill="#F59E0B" fontSize="11" fontWeight="bold" fontFamily="monospace">
                ZONE B: LONGWALL PANEL LW-102 (Seam 3, -260m R.L.)
              </text>

              {/* Zone C: Depillaring Section DP-4 (-220m) */}
              <rect
                x="240"
                y="420"
                width="720"
                height="170"
                rx="16"
                fill="rgba(168, 85, 247, 0.02)"
                stroke="rgba(168, 85, 247, 0.25)"
                strokeDasharray="4 4"
                strokeWidth="1.2"
              />
              <text x="256" y="442" fill="#C084FC" fontSize="11" fontWeight="bold" fontFamily="monospace">
                ZONE C: DEPILLARING SECTION DP-4 (Sanctoria Seam, -220m R.L.)
              </text>

              {/* Zone D: North Return Airway (-290m) */}
              <rect
                x="340"
                y="20"
                width="610"
                height="130"
                rx="16"
                fill="rgba(6, 182, 212, 0.02)"
                stroke="rgba(6, 182, 212, 0.25)"
                strokeDasharray="4 4"
                strokeWidth="1.2"
              />
              <text x="356" y="40" fill="#06B6D4" fontSize="11" fontWeight="bold" fontFamily="monospace">
                ZONE D: NORTH RETURN AIRWAY & SUBSTATION (-290m R.L.)
              </text>
            </g>
          )}

          {/* Solid Coal Pillars (Bord-and-Pillar Blocks) */}
          {showPillars && (
            <g className="coal-pillars-layer">
              <rect x="150" y="80" width="100" height="80" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />
              <rect x="150" y="220" width="100" height="110" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />
              <rect x="150" y="390" width="100" height="60" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />

              <rect x="310" y="80" width="40" height="80" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />
              <rect x="410" y="60" width="60" height="70" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />
              <rect x="530" y="60" width="60" height="70" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />
              <rect x="650" y="60" width="190" height="70" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />

              <rect x="310" y="220" width="140" height="110" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />
              <rect x="310" y="390" width="160" height="60" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />
              <rect x="530" y="240" width="140" height="90" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />
              <rect x="530" y="390" width="140" height="60" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />

              <rect x="730" y="240" width="120" height="90" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />
              <rect x="730" y="390" width="120" height="60" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />
              <rect x="310" y="510" width="160" height="50" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />
              <rect x="530" y="510" width="140" height="50" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />
              <rect x="730" y="510" width="120" height="50" rx="4" fill="url(#coalPillarHatch)" stroke="#1E293B" strokeWidth="1" />

              {/* Longwall LW-102 Goaf Area */}
              <rect x="730" y="220" width="120" height="140" rx="6" fill="url(#goafTexture)" stroke="#78350F" strokeWidth="1" strokeDasharray="3 3" />
              <text x="790" y="295" fill="#D97706" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle" opacity="0.8">
                CAVED GOAF (LW-102)
              </text>
            </g>
          )}

          {/* Main Haulage Conveyor Track */}
          <line x1="114" y1="70" x2="114" y2="190" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="4 3" opacity="0.75" />
          <line x1="120" y1="196" x2="280" y2="196" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="4 3" opacity="0.75" />

          {/* Ventilation Airflow Direction Vectors */}
          {showVentilation && (
            <g className="ventilation-layer" opacity="0.6">
              <g stroke="#06B6D4" strokeWidth="1.5" fill="none" strokeDasharray="6 4">
                <path d="M 125 100 L 125 160" />
                <path d="M 160 185 L 240 185" />
                <path d="M 285 220 L 285 320" />
                <path d="M 320 215 L 440 215" />
                <path d="M 520 215 L 660 215" />
                <path d="M 320 355 L 460 355" />
                <path d="M 530 355 L 660 355" />
              </g>

              <g stroke="#F97316" strokeWidth="1.5" fill="none" strokeDasharray="6 4">
                <path d="M 705 320 L 705 240" />
                <path d="M 850 100 L 850 160" />
                <path d="M 600 115 L 420 115" />
                <path d="M 480 50 L 480 90" />
              </g>
            </g>
          )}

          {/* Tunnels Layer */}
          <g className="tunnels-layer">
            {tunnels.map((tunnel) => {
              const fromN = nodeMap.get(tunnel.fromNode);
              const toN = nodeMap.get(tunnel.toNode);
              if (!fromN || !toN) return null;

              const isSelected = selectedTunnel?.id === tunnel.id || inspectedTunnel?.id === tunnel.id;
              const isCollapsed = tunnel.status === 'COLLAPSED';
              const color = getRiskColor(tunnel.riskLevel, tunnel.status);

              return (
                <g
                  key={tunnel.id}
                  onClick={() => handleTunnelClick(tunnel)}
                  className="cursor-pointer group"
                >
                  {/* Outer tunnel rock rib casing */}
                  <line
                    x1={fromN.x}
                    y1={fromN.y}
                    x2={toN.x}
                    y2={toN.y}
                    stroke="#111827"
                    strokeWidth={isSelected ? '22' : '16'}
                    strokeLinecap="round"
                  />

                  {/* Tunnel gallery interior */}
                  <line
                    x1={fromN.x}
                    y1={fromN.y}
                    x2={toN.x}
                    y2={toN.y}
                    stroke={isCollapsed ? 'url(#collapseHazard)' : color}
                    strokeWidth={isSelected ? '12' : '8'}
                    strokeLinecap="round"
                    strokeOpacity={isCollapsed ? 0.95 : 0.85}
                    className="transition-all duration-300 group-hover:stroke-width-10"
                  />

                  {/* Collapsed Warning Strobe */}
                  {isCollapsed && (
                    <line
                      x1={fromN.x}
                      y1={fromN.y}
                      x2={toN.x}
                      y2={toN.y}
                      stroke="#EF4444"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                      className="animate-pulse"
                    />
                  )}

                  {/* Tunnel ID Badge */}
                  <g transform={`translate(${(fromN.x + toN.x) / 2}, ${(fromN.y + toN.y) / 2 - 9})`}>
                    <rect
                      x="-18"
                      y="-8"
                      width="36"
                      height="16"
                      rx="4"
                      fill="#0B1120"
                      stroke={isSelected ? '#22D3EE' : color}
                      strokeWidth={isSelected ? '2' : '1'}
                      className="shadow-lg"
                    />
                    <text
                      x="0"
                      y="3.5"
                      fill={color}
                      fontSize="8.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {tunnel.id}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* ACTIVE INTELLIGENT EVACUATION ROUTE OVERLAY */}
          {routePoints && (
            <g className="evacuation-route-layer">
              <polyline
                points={routePoints}
                fill="none"
                stroke="#06B6D4"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.45"
                filter="url(#evacGlow)"
              />
              <polyline
                points={routePoints}
                fill="none"
                stroke="#22D3EE"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="12 6"
                className="animate-evacuation-route"
              />
            </g>
          )}

          {/* Junction Nodes & Surface Exits */}
          <g className="nodes-layer">
            {nodes.map((node) => {
              const isExit = node.isExit;
              const isRefuge = node.type === 'REFUGE_BAY';
              const isInspected = inspectedNode?.id === node.id;

              if (isExit) {
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => handleNodeClick(node)}
                    className="cursor-pointer group"
                  >
                    <circle r="20" fill="#042F2E" stroke="#10B981" strokeWidth="2.5" className="animate-pulse-slow" />
                    <circle r="13" fill="#065F46" />
                    <text x="0" y="4.5" fill="#6EE7B7" fontSize="12" fontWeight="bold" textAnchor="middle">
                      🚪
                    </text>
                    <g transform="translate(0, 32)">
                      <rect x="-44" y="-9" width="88" height="18" rx="4" fill="#042F2E" stroke="#10B981" strokeWidth="1.2" />
                      <text x="0" y="4" fill="#A7F3D0" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                        {node.id} (EXIT)
                      </text>
                    </g>
                  </g>
                );
              }

              if (isRefuge) {
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => handleNodeClick(node)}
                    className="cursor-pointer group"
                  >
                    <rect x="-16" y="-16" width="32" height="32" rx="8" fill="#1E1B4B" stroke="#818CF8" strokeWidth="2.5" />
                    <text x="0" y="4.5" fill="#C7D2FE" fontSize="13" textAnchor="middle">
                      🛡️
                    </text>
                    <g transform="translate(0, 26)">
                      <rect x="-42" y="-8" width="84" height="16" rx="3" fill="#1E1B4B" stroke="#6366F1" strokeWidth="1" />
                      <text x="0" y="4" fill="#C7D2FE" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                        REFUGE BAY
                      </text>
                    </g>
                  </g>
                );
              }

              // Standard Mine Junction
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer group"
                >
                  <circle
                    r={isInspected ? '10' : '7.5'}
                    fill="#0B1120"
                    stroke={isInspected ? '#22D3EE' : '#475569'}
                    strokeWidth={isInspected ? '3' : '2'}
                  />
                  <circle r="3.5" fill={isInspected ? '#22D3EE' : '#94A3B8'} />
                  <text x="0" y="-12" fill={isInspected ? '#22D3EE' : '#94A3B8'} fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    {node.id}
                  </text>
                </g>
              );
            })}
          </g>

          {/* IoT Sensor Nodes Layer */}
          {showSensors && (
            <g className="sensors-layer">
              {sensors.map((sensor) => {
                const node = sensor.nodeId ? nodeMap.get(sensor.nodeId) : null;
                if (!node) return null;

                const isSelected = selectedSensor?.id === sensor.id;
                const isOffline = sensor.status === 'OFFLINE';
                const color = isOffline
                  ? '#64748B'
                  : getRiskColor(sensor.status === 'CRITICAL' ? 'CRITICAL' : sensor.status === 'WARNING' ? 'WARNING' : 'SAFE');

                const sensorIdx = parseInt(sensor.id.replace('SENS-', ''), 10) || 1;
                const offsetX = (sensorIdx % 2 === 0 ? 1 : -1) * 18;
                const offsetY = (sensorIdx % 3 === 0 ? -1 : 1) * 18;

                return (
                  <g
                    key={sensor.id}
                    transform={`translate(${node.x + offsetX}, ${node.y + offsetY})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSensor?.(sensor);
                    }}
                    className="cursor-pointer group"
                  >
                    <circle
                      r={isSelected ? '10' : '6.5'}
                      fill="#0B1120"
                      stroke={color}
                      strokeWidth="2"
                    />
                    <circle r="2.5" fill={color} />
                    <g transform="translate(0, -12)" className="opacity-75 group-hover:opacity-100 transition-opacity">
                      <rect x="-19" y="-6" width="38" height="12" rx="2" fill="#0A0F1D" stroke={color} strokeWidth="0.8" />
                      <text x="0" y="3" fill={color} fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                        {sensor.value} {sensor.unit}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* Worker Positions */}
          {showWorkers && (
            <g className="workers-layer">
              {workers.map((worker) => {
                const isSelected = selectedWorker?.id === worker.id || activeRoutePlan?.workerId === worker.id;
                const isEvacuating = worker.status === 'EVACUATING';
                const isTrapped = worker.status === 'TRAPPED';
                const isEvacuated = worker.status === 'EVACUATED';

                let tagColor = '#10B981';
                if (isTrapped) tagColor = '#EF4444';
                else if (isEvacuating) tagColor = '#F59E0B';
                else if (isEvacuated) tagColor = '#38BDF8';

                return (
                  <g
                    key={worker.id}
                    transform={`translate(${worker.position.x}, ${worker.position.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWorker?.(worker);
                    }}
                    className="cursor-pointer group"
                  >
                    <circle
                      r={isSelected ? '24' : '16'}
                      fill={tagColor}
                      fillOpacity="0.25"
                      className="animate-ping-slow"
                    />
                    <circle
                      r={isSelected ? '15' : '12'}
                      fill="#0B1120"
                      stroke={tagColor}
                      strokeWidth={isSelected ? '3' : '2'}
                    />
                    <text x="0" y="4" fill="#FFFFFF" fontSize="9.5" fontWeight="black" textAnchor="middle">
                      {isTrapped ? '🆘' : isEvacuated ? '✅' : isEvacuating ? '🏃' : '👷'}
                    </text>

                    {/* Worker ID Badge */}
                    <g transform="translate(0, 22)">
                      <rect
                        x="-22"
                        y="-7"
                        width="44"
                        height="15"
                        rx="3"
                        fill={isSelected ? '#083344' : '#0B1120'}
                        stroke={isSelected ? '#22D3EE' : tagColor}
                        strokeWidth="1.2"
                      />
                      <text
                        x="0"
                        y="3.5"
                        fill={isSelected ? '#22D3EE' : '#F8FAFC'}
                        fontSize="8"
                        fontWeight="black"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {worker.id}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* INLINE MAP POPUP: Tunnel Inspection & 1-Click Hazard Injection */}
        {inspectedTunnel && (
          <div className="absolute top-4 right-4 w-80 rounded-2xl border border-cyan-500/50 bg-[#0B1120]/95 p-4 shadow-2xl backdrop-blur-md z-30 font-mono text-xs space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                <strong className="text-white text-sm">{inspectedTunnel.id} ({inspectedTunnel.name})</strong>
              </div>
              <button
                onClick={() => setInspectedTunnel(null)}
                className="text-slate-400 hover:text-white font-bold text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Zone / Path:</span>
                <span className="text-white font-bold">{inspectedTunnel.zone} ({inspectedTunnel.fromNode} ↔ {inspectedTunnel.toNode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Length:</span>
                <span className="text-white">{inspectedTunnel.distance} meters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deformation:</span>
                <span className={`font-bold ${inspectedTunnel.deformationMm > 10 ? 'text-red-400' : 'text-cyan-300'}`}>
                  {inspectedTunnel.deformationMm.toFixed(1)} mm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    inspectedTunnel.status === 'COLLAPSED'
                      ? 'bg-red-950 text-red-300 border border-red-500/50'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {inspectedTunnel.status}
                </span>
              </div>
            </div>

            {/* Direct 1-Click Collapse / Clear Toggle */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => handleToggleCurrentTunnel(inspectedTunnel.id)}
                className={`w-full flex items-center justify-center gap-2 rounded-xl p-2.5 font-bold transition shadow-lg ${
                  inspectedTunnel.status === 'COLLAPSED'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50 animate-pulse'
                }`}
              >
                {inspectedTunnel.status === 'COLLAPSED' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>🟢 Clear Hazard & Reopen Tunnel</span>
                  </>
                ) : (
                  <>
                    <Flame className="h-4 w-4" />
                    <span>🚨 Collapse / Block Tunnel (Test Detour)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* INLINE MAP POPUP: Junction Node Relocation */}
        {inspectedNode && !inspectedNode.isExit && (
          <div className="absolute top-4 right-4 w-72 rounded-2xl border border-purple-500/50 bg-[#0B1120]/95 p-4 shadow-2xl backdrop-blur-md z-30 font-mono text-xs space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-400" />
                <strong className="text-white">{inspectedNode.name}</strong>
              </div>
              <button
                onClick={() => setInspectedNode(null)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-[11px] text-slate-300 space-y-1">
              <div>Zone: <strong className="text-white">{inspectedNode.zone}</strong></div>
              <div>Subsurface Elevation: <strong className="text-cyan-300">{inspectedNode.elevation}m</strong></div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => handleRelocateCurrentWorker(inspectedNode.id)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white p-2.5 font-bold transition shadow-lg shadow-purple-950"
              >
                <MapPin className="h-4 w-4" />
                Relocate Miner {activeRouteWorkerId || 'W-001'} Here
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map Bottom Legend & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-mine-border/80 bg-mine-card/90 px-4 py-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-mono text-[11px] font-bold text-slate-400 uppercase">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-6 rounded-full bg-emerald-500" />
            <span className="text-slate-300 font-mono text-[11px]">Safe Gallery</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-6 rounded-full bg-amber-500" />
            <span className="text-slate-300 font-mono text-[11px]">Caution (2.5x)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-6 rounded-full bg-orange-500" />
            <span className="text-slate-300 font-mono text-[11px]">Warning (7.0x)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-6 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 font-mono text-[11px]">Impassable (∞)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-6 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span className="text-cyan-300 font-mono text-[11px]">Active Evacuation Path</span>
          </div>
        </div>

        {activeRoutePlan && (
          <div className="flex items-center gap-2 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-md text-cyan-200 text-xs font-mono">
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            <span>
              Target: <strong className="text-white">{activeRoutePlan.destinationExit}</strong> • Dist:{' '}
              <strong className="text-white">{activeRoutePlan.totalDistanceMeters}m</strong> • Walk:{' '}
              <strong className="text-white">{Math.round(activeRoutePlan.estimatedTimeSeconds / 60)} min</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
