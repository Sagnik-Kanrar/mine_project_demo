"""
MINEGUARD AI — Python FastAPI Backend Server
Provides Real-Time IoT Strata Telemetry, AI Subsidence Risk Estimation,
Dynamic Dijkstra Safe Evacuation Pathfinding, and Live WebSocket Streams.
"""

import asyncio
import copy
import json
import math
import random
import time
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="MINEGUARD AI Python Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Static Mine Geometry & Initial Data
# ---------------------------------------------------------
INITIAL_NODES = [
    {"id": "E1", "name": "Main Incline Portal", "x": 114, "y": 70, "elevation": -140, "isExit": True, "isOpen": True, "type": "SURFACE_INCLINE", "zone": "Zone A"},
    {"id": "E2", "name": "North Return Ventilation Shaft", "x": 860, "y": 70, "elevation": -290, "isExit": True, "isOpen": True, "type": "VERTICAL_SHAFT", "zone": "Zone D"},
    {"id": "E3", "name": "Emergency Escape Shaft #3", "x": 114, "y": 550, "elevation": -220, "isExit": True, "isOpen": True, "type": "EMERGENCY_PORTAL", "zone": "Zone C"},
    {"id": "REF-1", "name": "Refuge Chamber Bay #1", "x": 500, "y": 360, "elevation": -260, "isExit": True, "isOpen": True, "type": "REFUGE_BAY", "zone": "Zone B"},
    {"id": "J1", "name": "Main Trunk Junction", "x": 114, "y": 196, "elevation": -160, "isExit": False, "isOpen": True, "type": "JUNCTION", "zone": "Zone A"},
    {"id": "J2", "name": "Haulage Crosscut J-02", "x": 280, "y": 196, "elevation": -180, "isExit": False, "isOpen": True, "type": "JUNCTION", "zone": "Zone A"},
    {"id": "J3", "name": "Zone B Gate Entry J-03", "x": 280, "y": 360, "elevation": -220, "isExit": False, "isOpen": True, "type": "JUNCTION", "zone": "Zone B"},
    {"id": "J4", "name": "Longwall Intake J-04", "x": 500, "y": 196, "elevation": -240, "isExit": False, "isOpen": True, "type": "JUNCTION", "zone": "Zone B"},
    {"id": "J5", "name": "Longwall Tailgate J-05", "x": 700, "y": 196, "elevation": -260, "isExit": False, "isOpen": True, "type": "JUNCTION", "zone": "Zone B"},
    {"id": "J6", "name": "Return Airway Crosscut J-06", "x": 700, "y": 360, "elevation": -260, "isExit": False, "isOpen": True, "type": "JUNCTION", "zone": "Zone B"},
    {"id": "J7", "name": "North Airway Substation J-07", "x": 500, "y": 70, "elevation": -280, "isExit": False, "isOpen": True, "type": "JUNCTION", "zone": "Zone D"},
    {"id": "J8", "name": "Depillaring Section DP-4 J-08", "x": 280, "y": 480, "elevation": -220, "isExit": False, "isOpen": True, "type": "JUNCTION", "zone": "Zone C"},
    {"id": "J9", "name": "South Haulage Dip J-09", "x": 500, "y": 480, "elevation": -230, "isExit": False, "isOpen": True, "type": "JUNCTION", "zone": "Zone C"},
    {"id": "J10", "name": "Depillaring Bleeder J-10", "x": 700, "y": 480, "elevation": -240, "isExit": False, "isOpen": True, "type": "JUNCTION", "zone": "Zone C"},
]

INITIAL_TUNNELS = [
    {"id": "T-01", "name": "Main Drift Incline", "fromNode": "E1", "toNode": "J1", "distance": 140, "riskLevel": "SAFE", "status": "CLEAR", "deformationMm": 1.2, "velocityMmPerMin": 0.01, "isAvailableForEvacuation": True, "zone": "Zone A", "crossSection": "4.8m x 3.2m", "supportType": "Steel Arch & Rock Bolts", "travelTimeSeconds": 84, "lastInspection": "2024-08-30"},
    {"id": "T-02", "name": "Haulage Level 1 East", "fromNode": "J1", "toNode": "J2", "distance": 180, "riskLevel": "SAFE", "status": "CLEAR", "deformationMm": 1.8, "velocityMmPerMin": 0.02, "isAvailableForEvacuation": True, "zone": "Zone A", "crossSection": "4.5m x 3.0m", "supportType": "Resin Bolts & Wire Mesh", "travelTimeSeconds": 108, "lastInspection": "2024-08-29"},
    {"id": "T-03", "name": "Incline Dip 1 South", "fromNode": "J2", "toNode": "J3", "distance": 170, "riskLevel": "SAFE", "status": "CLEAR", "deformationMm": 2.1, "velocityMmPerMin": 0.02, "isAvailableForEvacuation": True, "zone": "Zone A", "crossSection": "4.2m x 3.0m", "supportType": "Rock Bolts", "travelTimeSeconds": 102, "lastInspection": "2024-08-28"},
    {"id": "T-04", "name": "Substation North Crosscut", "fromNode": "J1", "toNode": "J7", "distance": 260, "riskLevel": "SAFE", "status": "CLEAR", "deformationMm": 1.4, "velocityMmPerMin": 0.01, "isAvailableForEvacuation": True, "zone": "Zone D", "crossSection": "4.0m x 2.8m", "supportType": "Steel Props", "travelTimeSeconds": 156, "lastInspection": "2024-08-27"},
    {"id": "T-05", "name": "Longwall Maingate 102", "fromNode": "J2", "toNode": "J4", "distance": 240, "riskLevel": "SAFE", "status": "CLEAR", "deformationMm": 3.4, "velocityMmPerMin": 0.03, "isAvailableForEvacuation": True, "zone": "Zone B", "crossSection": "5.0m x 3.5m", "supportType": "Hydraulic Chocks & Cable Bolts", "travelTimeSeconds": 144, "lastInspection": "2024-08-31"},
    {"id": "T-06", "name": "Longwall Conveyor Bypass", "fromNode": "J3", "toNode": "REF-1", "distance": 230, "riskLevel": "SAFE", "status": "CLEAR", "deformationMm": 3.8, "velocityMmPerMin": 0.04, "isAvailableForEvacuation": True, "zone": "Zone B", "crossSection": "4.5m x 3.2m", "supportType": "Steel Arches", "travelTimeSeconds": 138, "lastInspection": "2024-08-31"},
    {"id": "T-07", "name": "Longwall Face LW-102 Track", "fromNode": "J4", "toNode": "J5", "distance": 210, "riskLevel": "CAUTION", "status": "CLEAR", "deformationMm": 5.8, "velocityMmPerMin": 0.08, "isAvailableForEvacuation": True, "zone": "Zone B", "crossSection": "5.2m x 3.8m", "supportType": "Powered Roof Supports (Shields)", "travelTimeSeconds": 126, "lastInspection": "2024-08-31"},
    {"id": "T-08", "name": "Longwall Tailgate Bleeder", "fromNode": "J5", "toNode": "E2", "distance": 220, "riskLevel": "SAFE", "status": "CLEAR", "deformationMm": 3.1, "velocityMmPerMin": 0.03, "isAvailableForEvacuation": True, "zone": "Zone D", "crossSection": "4.2m x 3.0m", "supportType": "Cable Bolts & Mesh", "travelTimeSeconds": 132, "lastInspection": "2024-08-30"},
    {"id": "T-09", "name": "North Airway Header", "fromNode": "J7", "toNode": "E2", "distance": 360, "riskLevel": "SAFE", "status": "CLEAR", "deformationMm": 1.1, "velocityMmPerMin": 0.01, "isAvailableForEvacuation": True, "zone": "Zone D", "crossSection": "4.8m x 3.2m", "supportType": "Shotcrete & Rock Bolts", "travelTimeSeconds": 216, "lastInspection": "2024-08-25"},
    {"id": "T-10", "name": "Longwall Tailgate Return", "fromNode": "J5", "toNode": "J6", "distance": 170, "riskLevel": "SAFE", "status": "CLEAR", "deformationMm": 4.2, "velocityMmPerMin": 0.04, "isAvailableForEvacuation": True, "zone": "Zone B", "crossSection": "4.5m x 3.0m", "supportType": "Steel Arches", "travelTimeSeconds": 102, "lastInspection": "2024-08-31"},
    {"id": "T-11", "name": "Refuge Connector East", "fromNode": "REF-1", "toNode": "J6", "distance": 210, "riskLevel": "SAFE", "status": "CLEAR", "deformationMm": 3.9, "velocityMmPerMin": 0.03, "isAvailableForEvacuation": True, "zone": "Zone B", "crossSection": "4.2m x 3.0m", "supportType": "Rock Bolts", "travelTimeSeconds": 126, "lastInspection": "2024-08-31"},
    {"id": "T-12", "name": "Depillaring Main Level 1", "fromNode": "J3", "toNode": "J8", "distance": 130, "riskLevel": "SAFE", "status": "CLEAR", "deformationMm": 2.6, "velocityMmPerMin": 0.02, "isAvailableForEvacuation": True, "zone": "Zone C", "crossSection": "4.2m x 3.0m", "supportType": "Timber & Hydraulic Props", "travelTimeSeconds": 78, "lastInspection": "2024-08-28"},
    {"id": "T-13", "name": "Depillaring Extraction Slice", "fromNode": "J8", "toNode": "J9", "distance": 230, "riskLevel": "SAFE", "status": "CLEAR", "deformationMm": 3.5, "velocityMmPerMin": 0.03, "isAvailableForEvacuation": True, "zone": "Zone C", "crossSection": "4.0m x 2.8m", "supportType": "Hydraulic Props", "travelTimeSeconds": 138, "lastInspection": "2024-08-29"},
    {"id": "T-14", "name": "Depillaring Goaf Edge", "fromNode": "J9", "toNode": "J10", "distance": 210, "riskLevel": "CAUTION", "status": "CLEAR", "deformationMm": 4.8, "velocityMmPerMin": 0.05, "isAvailableForEvacuation": True, "zone": "Zone C", "crossSection": "4.0m x 2.8m", "supportType": "Chock Shields", "travelTimeSeconds": 126, "lastInspection": "2024-08-30"},
    {"id": "T-15", "name": "South Escape Portal Incline", "fromNode": "J8", "toNode": "E3", "distance": 180, "riskLevel": "SAFE", "status": "CLEAR", "deformationMm": 1.5, "velocityMmPerMin": 0.01, "isAvailableForEvacuation": True, "zone": "Zone C", "crossSection": "4.0m x 3.0m", "supportType": "Steel Arches", "travelTimeSeconds": 108, "lastInspection": "2024-08-27"},
    {"id": "T-16", "name": "Depillaring Return Drift", "fromNode": "J10", "toNode": "J6", "distance": 130, "riskLevel": "SAFE", "status": "CLEAR", "deformationMm": 3.7, "velocityMmPerMin": 0.03, "isAvailableForEvacuation": True, "zone": "Zone C", "crossSection": "4.2m x 3.0m", "supportType": "Rock Bolts", "travelTimeSeconds": 78, "lastInspection": "2024-08-29"},
]

INITIAL_WORKERS = [
    {"id": "W-001", "name": "Rajesh Kumar", "role": "Shearer Machine Operator", "zone": "Zone B", "currentNodeId": "J4", "currentTunnelId": "T-07", "position": {"x": 510, "y": 196, "elevation": -240}, "status": "SAFE", "batteryTag": 94, "heartRateBpm": 78, "assignedExitId": "E1", "distanceToExit": 770, "estimatedEvacTimeSeconds": 462, "currentRoute": ["J4", "J2", "J1", "E1"], "positioningMethod": "UWB_TOF_ANCHORS", "lastPingTime": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
    {"id": "W-002", "name": "Amit Sharma", "role": "Roof Bolting Lead", "zone": "Zone B", "currentNodeId": "J5", "currentTunnelId": "T-07", "position": {"x": 680, "y": 196, "elevation": -260}, "status": "SAFE", "batteryTag": 88, "heartRateBpm": 84, "assignedExitId": "E2", "distanceToExit": 220, "estimatedEvacTimeSeconds": 132, "currentRoute": ["J5", "E2"], "positioningMethod": "UWB_TOF_ANCHORS", "lastPingTime": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
    {"id": "W-003", "name": "Sunil Murmu", "role": "Chock Support Mechanic", "zone": "Zone B", "currentNodeId": "REF-1", "currentTunnelId": "T-06", "position": {"x": 500, "y": 360, "elevation": -260}, "status": "SAFE", "batteryTag": 91, "heartRateBpm": 74, "assignedExitId": "E1", "distanceToExit": 720, "estimatedEvacTimeSeconds": 432, "currentRoute": ["REF-1", "J3", "J2", "J1", "E1"], "positioningMethod": "UWB_TOF_ANCHORS", "lastPingTime": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
    {"id": "W-004", "name": "Deepak Hansda", "role": "Depillaring Section Miner", "zone": "Zone C", "currentNodeId": "J9", "currentTunnelId": "T-13", "position": {"x": 500, "y": 480, "elevation": -230}, "status": "SAFE", "batteryTag": 82, "heartRateBpm": 80, "assignedExitId": "E3", "distanceToExit": 410, "estimatedEvacTimeSeconds": 246, "currentRoute": ["J9", "J8", "E3"], "positioningMethod": "BLE_MESH_IMU", "lastPingTime": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
    {"id": "W-005", "name": "Vikas Soren", "role": "Depillaring Section Miner", "zone": "Zone C", "currentNodeId": "J10", "currentTunnelId": "T-14", "position": {"x": 680, "y": 480, "elevation": -240}, "status": "SAFE", "batteryTag": 79, "heartRateBpm": 82, "assignedExitId": "E3", "distanceToExit": 620, "estimatedEvacTimeSeconds": 372, "currentRoute": ["J10", "J9", "J8", "E3"], "positioningMethod": "BLE_MESH_IMU", "lastPingTime": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
    {"id": "W-006", "name": "Manoj Mahato", "role": "Conveyor Belt Attendant", "zone": "Zone A", "currentNodeId": "J1", "currentTunnelId": "T-01", "position": {"x": 114, "y": 196, "elevation": -160}, "status": "SAFE", "batteryTag": 96, "heartRateBpm": 72, "assignedExitId": "E1", "distanceToExit": 140, "estimatedEvacTimeSeconds": 84, "currentRoute": ["J1", "E1"], "positioningMethod": "UWB_TOF_ANCHORS", "lastPingTime": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
    {"id": "W-007", "name": "Pawan Bauri", "role": "Substation Electrician", "zone": "Zone D", "currentNodeId": "J7", "currentTunnelId": "T-04", "position": {"x": 500, "y": 70, "elevation": -280}, "status": "SAFE", "batteryTag": 85, "heartRateBpm": 76, "assignedExitId": "E2", "distanceToExit": 360, "estimatedEvacTimeSeconds": 216, "currentRoute": ["J7", "E2"], "positioningMethod": "BLE_MESH_IMU", "lastPingTime": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
    {"id": "W-008", "name": "Sanjay Singh", "role": "Mining Sirdar (Safety Officer)", "zone": "Zone A", "currentNodeId": "J2", "currentTunnelId": "T-02", "position": {"x": 280, "y": 196, "elevation": -180}, "status": "SAFE", "batteryTag": 93, "heartRateBpm": 75, "assignedExitId": "E1", "distanceToExit": 320, "estimatedEvacTimeSeconds": 192, "currentRoute": ["J2", "J1", "E1"], "positioningMethod": "UWB_TOF_ANCHORS", "lastPingTime": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
]

INITIAL_SENSORS = [
    {"id": "SENS-001", "name": "Roof Extensometer LW102-1", "type": "GROUND_DISPLACEMENT", "value": 3.8, "unit": "mm", "zone": "Zone B", "tunnelId": "T-07", "nodeId": "J4", "status": "NORMAL", "battery": 95, "signal": "GOOD", "rssi": -68, "thresholds": {"caution": 5.0, "warning": 10.0, "critical": 15.0}, "history": [{"timestamp": "01:00", "value": 3.6}, {"timestamp": "01:05", "value": 3.8}]},
    {"id": "SENS-005", "name": "Biaxial Clinometer LW102-1", "type": "TILT_ANGLE", "value": 0.8, "unit": "°", "zone": "Zone B", "tunnelId": "T-07", "nodeId": "J4", "status": "NORMAL", "battery": 92, "signal": "GOOD", "rssi": -71, "thresholds": {"caution": 2.5, "warning": 4.5, "critical": 6.0}, "history": [{"timestamp": "01:00", "value": 0.7}, {"timestamp": "01:05", "value": 0.8}]},
    {"id": "SENS-013", "name": "Micro-Seismic Geophone 1", "type": "VIBRATION", "value": 12.4, "unit": "Hz", "zone": "Zone B", "tunnelId": "T-07", "nodeId": "J5", "status": "NORMAL", "battery": 90, "signal": "GOOD", "rssi": -74, "thresholds": {"caution": 25.0, "warning": 45.0, "critical": 75.0}, "history": [{"timestamp": "01:00", "value": 11.8}, {"timestamp": "01:05", "value": 12.4}]},
    {"id": "SENS-017", "name": "Hydraulic Load Cell 1", "type": "PRESSURE_STRESS", "value": 18.5, "unit": "MPa", "zone": "Zone B", "tunnelId": "T-07", "nodeId": "J4", "status": "NORMAL", "battery": 94, "signal": "GOOD", "rssi": -70, "thresholds": {"caution": 28.0, "warning": 38.0, "critical": 45.0}, "history": [{"timestamp": "01:00", "value": 18.2}, {"timestamp": "01:05", "value": 18.5}]},
]

# ---------------------------------------------------------
# Dynamic Global State
# ---------------------------------------------------------
mine_nodes = copy.deepcopy(INITIAL_NODES)
mine_tunnels = copy.deepcopy(INITIAL_TUNNELS)
mine_workers = copy.deepcopy(INITIAL_WORKERS)
mine_sensors = copy.deepcopy(INITIAL_SENSORS)
mine_alerts = []
simulation_state = {
    "mode": "NORMAL",
    "activeScenarioName": "Normal Operation (Safe)",
    "emergencyModeActive": False,
    "sirenActive": False,
    "collapsedTunnelIds": [],
    "affectedWorkerIds": [],
    "stepCount": 0,
    "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
}

connected_websockets: List[WebSocket] = []

# ---------------------------------------------------------
# Graph Routing (Dijkstra)
# ---------------------------------------------------------
def calculate_dijkstra_route(start_node_id: str, worker_id: Optional[str] = None):
    exits = [n["id"] for n in mine_nodes if n.get("isExit") and n.get("isOpen")]
    if not exits:
        return None

    # Build adjacency list
    adj = {}
    for n in mine_nodes:
        adj[n["id"]] = []

    for t in mine_tunnels:
        u, v = t["fromNode"], t["toNode"]
        if t["status"] == "COLLAPSED" or not t.get("isAvailableForEvacuation"):
            weight = float("inf")
        else:
            w_mult = 1.0
            if t["riskLevel"] == "CAUTION":
                w_mult = 2.5
            elif t["riskLevel"] == "WARNING":
                w_mult = 7.0
            elif t["riskLevel"] == "CRITICAL":
                w_mult = float("inf")
            weight = t["distance"] * w_mult

        adj[u].append((v, weight, t["id"], t["distance"]))
        adj[v].append((u, weight, t["id"], t["distance"]))

    # Dijkstra from start_node_id
    dist = {n["id"]: float("inf") for n in mine_nodes}
    prev = {n["id"]: None for n in mine_nodes}
    prev_tunnel = {n["id"]: None for n in mine_nodes}
    prev_dist = {n["id"]: 0 for n in mine_nodes}
    unvisited = set(mine_nodes[i]["id"] for i in range(len(mine_nodes)))

    dist[start_node_id] = 0

    while unvisited:
        curr = min(unvisited, key=lambda x: dist[x])
        if dist[curr] == float("inf"):
            break
        unvisited.remove(curr)

        for neighbor, w, t_id, actual_d in adj[curr]:
            if neighbor in unvisited:
                alt = dist[curr] + w
                if alt < dist[neighbor]:
                    dist[neighbor] = alt
                    prev[neighbor] = curr
                    prev_tunnel[neighbor] = t_id
                    prev_dist[neighbor] = actual_d

    # Find closest reachable exit
    best_exit = None
    min_cost = float("inf")
    for ex in exits:
        if dist[ex] < min_cost:
            min_cost = dist[ex]
            best_exit = ex

    if not best_exit or min_cost == float("inf"):
        return None

    # Reconstruct path
    curr = best_exit
    route_nodes = []
    route_tunnels = []
    total_distance = 0

    while curr:
        route_nodes.insert(0, curr)
        if prev[curr]:
            route_tunnels.insert(0, prev_tunnel[curr])
            total_distance += prev_dist[curr]
        curr = prev[curr]

    turn_by_turn = []
    for idx, r_node in enumerate(route_nodes):
        turn_by_turn.append({
            "step": idx + 1,
            "instruction": f"Head to {r_node}",
            "waypoint": r_node,
            "distanceM": 50,
            "heading": "FORWARD"
        })

    worker = next((w for w in mine_workers if w["id"] == worker_id), None)

    return {
        "workerId": worker_id or "W-001",
        "workerName": worker["name"] if worker else "Miner",
        "originNode": start_node_id,
        "destinationExit": best_exit,
        "totalDistanceMeters": total_distance,
        "estimatedTimeSeconds": int(total_distance / 1.67),
        "overallPathRisk": "SAFE",
        "routeNodes": route_nodes,
        "routeTunnels": route_tunnels,
        "turnByTurn": turn_by_turn,
        "calculatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }

def calculate_ai_prediction():
    disp = next((s["value"] for s in mine_sensors if s["id"] == "SENS-001"), 3.8)
    tilt = next((s["value"] for s in mine_sensors if s["id"] == "SENS-005"), 0.8)
    vib = next((s["value"] for s in mine_sensors if s["id"] == "SENS-013"), 12.4)
    stress = next((s["value"] for s in mine_sensors if s["id"] == "SENS-017"), 18.5)

    risk_score = min(100, int((disp / 15.0) * 50 + (tilt / 6.0) * 25 + (vib / 75.0) * 15 + (stress / 45.0) * 10))

    if risk_score >= 70 or disp >= 15.0:
        classification = "CRITICAL"
        summary = "CRITICAL ALERT: Strata displacement exceeds safety limit (15mm). Imminent roof fall."
        rec = "Engage immediate emergency evacuation protocol (DGMS Sec-44)."
    elif risk_score >= 45 or disp >= 8.0:
        classification = "WARNING"
        summary = "WARNING: Accelerated ground movement in Longwall Face. Increased acoustic emissions."
        rec = "Halt extraction in Zone B, inspect hydraulic supports."
    elif risk_score >= 30:
        classification = "CAUTION"
        summary = "CAUTION: Minor micro-seismic activity and delamination detected."
        rec = "Continue normal operations with heightened sensor sampling."
    else:
        classification = "SAFE"
        summary = "Nominal strata conditions. Rock mechanics balance stable."
        rec = "Maintain standard monitoring schedule."

    forecast = []
    for m in range(0, 35, 5):
        val = disp * math.exp(0.04 * m) if classification == "CRITICAL" else disp + 0.05 * m
        forecast.append({
            "minute": m,
            "predictedDeformationMm": round(val, 2),
            "upperBoundMm": round(val * 1.15, 2),
            "lowerBoundMm": round(val * 0.85, 2),
            "criticalThresholdMm": 15.0,
            "riskLevel": "CRITICAL" if val >= 15.0 else "WARNING" if val >= 10.0 else "SAFE",
        })

    return {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "overallRiskScore": risk_score,
        "riskClassification": classification,
        "inputs": {
            "groundDisplacementMm": disp,
            "displacementVelocityMmPerMin": 0.04,
            "tiltAngleDeg": tilt,
            "vibrationHz": vib,
            "porePressureMpa": stress,
            "historicalTrendRate": 2.4,
        },
        "forecast30Min": forecast,
        "explanation": {
            "summary": summary,
            "recommendation": rec,
            "dominantFactors": [
                {"factor": "Roof Displacement", "weight": 52, "impact": "HIGH", "detail": f"{disp} mm displacement"},
                {"factor": "Biaxial Roof Tilt", "weight": 24, "impact": "MEDIUM", "detail": f"{tilt}° angle"},
                {"factor": "Micro-Seismic Vibration", "weight": 14, "impact": "MEDIUM", "detail": f"{vib} Hz frequency"},
                {"factor": "Hydraulic Chock Stress", "weight": 10, "impact": "LOW", "detail": f"{stress} MPa load pressure"},
            ],
        },
    }

# ---------------------------------------------------------
# REST API Endpoints
# ---------------------------------------------------------
@app.get("/api/state")
def get_state():
    return {
        "nodes": mine_nodes,
        "tunnels": mine_tunnels,
        "workers": mine_workers,
        "sensors": mine_sensors,
        "alerts": mine_alerts,
        "simulationState": simulation_state,
        "aiPrediction": calculate_ai_prediction(),
    }

@app.get("/api/route/{worker_id}")
def get_route(worker_id: str):
    worker = next((w for w in mine_workers if w["id"] == worker_id), None)
    if not worker:
        return {"error": "Worker not found"}
    plan = calculate_dijkstra_route(worker["currentNodeId"], worker_id)
    return plan

@app.post("/api/scenarios/normal")
def scenario_normal():
    global simulation_state
    simulation_state["mode"] = "NORMAL"
    simulation_state["activeScenarioName"] = "Normal Operation (Safe)"
    simulation_state["emergencyModeActive"] = False
    simulation_state["sirenActive"] = False
    simulation_state["collapsedTunnelIds"] = []
    simulation_state["affectedWorkerIds"] = []

    for t in mine_tunnels:
        t["status"] = "CLEAR"
        t["riskLevel"] = "SAFE"
        t["isAvailableForEvacuation"] = True
        t["deformationMm"] = 2.4

    for w in mine_workers:
        w["status"] = "SAFE"

    for s in mine_sensors:
        s["status"] = "NORMAL"
        s["value"] = 3.8 if s["type"] == "GROUND_DISPLACEMENT" else 0.8 if s["type"] == "TILT_ANGLE" else 12.4

    return {"success": True, "state": get_state()}

@app.post("/api/scenarios/collapse")
def scenario_collapse():
    global simulation_state
    simulation_state["mode"] = "TUNNEL_COLLAPSE"
    simulation_state["activeScenarioName"] = "Catastrophic Roof Collapse (Tunnel T-07)"
    simulation_state["emergencyModeActive"] = True
    simulation_state["sirenActive"] = True
    simulation_state["collapsedTunnelIds"] = ["T-07"]
    simulation_state["affectedWorkerIds"] = ["W-001", "W-002", "W-003"]

    for t in mine_tunnels:
        if t["id"] == "T-07":
            t["status"] = "COLLAPSED"
            t["riskLevel"] = "CRITICAL"
            t["isAvailableForEvacuation"] = False
            t["deformationMm"] = 18.9

    for w in mine_workers:
        if w["id"] in simulation_state["affectedWorkerIds"]:
            w["status"] = "EVACUATING"
            # Detour W-001 away from T-07 to E1
            if w["id"] == "W-001":
                w["assignedExitId"] = "E1"
                w["currentRoute"] = ["J4", "J2", "J1", "E1"]

    for s in mine_sensors:
        if s["id"] == "SENS-001":
            s["status"] = "CRITICAL"
            s["value"] = 18.9
        elif s["id"] == "SENS-005":
            s["status"] = "CRITICAL"
            s["value"] = 6.4
        elif s["id"] == "SENS-013":
            s["status"] = "CRITICAL"
            s["value"] = 78.5

    return {"success": True, "state": get_state()}

# ---------------------------------------------------------
# WebSocket Broadcast
# ---------------------------------------------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_websockets.append(websocket)
    try:
        await websocket.send_text(json.dumps({"type": "STATE_UPDATE", "payload": get_state()}))
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            action_type = msg.get("type")

            if action_type == "TRIGGER_SCENARIO":
                sc = msg.get("payload", {}).get("scenario")
                if sc == "NORMAL":
                    scenario_normal()
                elif sc == "COLLAPSE":
                    scenario_collapse()
                await broadcast_state()

            elif action_type == "RELOCATE_WORKER":
                w_id = msg.get("payload", {}).get("workerId")
                n_id = msg.get("payload", {}).get("nodeId")
                target_w = next((w for w in mine_workers if w["id"] == w_id), None)
                target_n = next((n for n in mine_nodes if n["id"] == n_id), None)
                if target_w and target_n:
                    target_w["currentNodeId"] = n_id
                    target_w["position"]["x"] = target_n["x"]
                    target_w["position"]["y"] = target_n["y"]
                await broadcast_state()
    except WebSocketDisconnect:
        connected_websockets.remove(websocket)

async def broadcast_state():
    state_json = json.dumps({"type": "STATE_UPDATE", "payload": get_state()})
    for ws in list(connected_websockets):
        try:
            await ws.send_text(state_json)
        except Exception:
            if ws in connected_websockets:
                connected_websockets.remove(ws)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
