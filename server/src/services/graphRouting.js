export class MineGraphRoutingService {
  constructor(nodes, tunnels) {
    this.nodes = new Map();
    this.adjacencyList = new Map();
    this.tunnels = new Map();
    this.updateGraph(nodes, tunnels);
  }

  updateGraph(nodes, tunnels) {
    this.nodes.clear();
    this.adjacencyList.clear();
    this.tunnels.clear();

    for (const node of nodes) {
      this.nodes.set(node.id, node);
      this.adjacencyList.set(node.id, []);
    }

    for (const tunnel of tunnels) {
      this.tunnels.set(tunnel.id, tunnel);

      // Compute dynamic safety penalty
      let riskMultiplier = 1.0;
      let isTraversable = tunnel.isAvailableForEvacuation && tunnel.status !== 'COLLAPSED';

      if (!isTraversable) {
        riskMultiplier = Infinity;
      } else {
        switch (tunnel.riskLevel) {
          case 'SAFE':
            riskMultiplier = 1.0;
            break;
          case 'CAUTION':
            riskMultiplier = 2.5; // Small penalty
            break;
          case 'WARNING':
            riskMultiplier = 7.0; // Large penalty
            break;
          case 'CRITICAL':
            riskMultiplier = Infinity; // Avoid entirely
            isTraversable = false;
            break;
        }
      }

      const effectiveCost = isTraversable ? tunnel.distance * riskMultiplier : Infinity;

      // Bidirectional tunnel connectivity
      const edgeForward = {
        tunnelId: tunnel.id,
        from: tunnel.fromNode,
        to: tunnel.toNode,
        distance: tunnel.distance,
        riskLevel: tunnel.riskLevel,
        status: tunnel.status,
        isAvailable: isTraversable,
        effectiveCost,
      };

      const edgeBackward = {
        tunnelId: tunnel.id,
        from: tunnel.toNode,
        to: tunnel.fromNode,
        distance: tunnel.distance,
        riskLevel: tunnel.riskLevel,
        status: tunnel.status,
        isAvailable: isTraversable,
        effectiveCost,
      };

      this.adjacencyList.get(tunnel.fromNode)?.push(edgeForward);
      this.adjacencyList.get(tunnel.toNode)?.push(edgeBackward);
    }
  }

  /**
   * Calculates the Shortest SAFE path using Dijkstra algorithm with risk weighting
   */
  calculateSafestPath(startNodeId, specificExitId) {
    if (!this.nodes.has(startNodeId)) {
      return null;
    }

    const exits = Array.from(this.nodes.values()).filter(
      (n) => n.isExit && n.isOpen && (!specificExitId || n.id === specificExitId)
    );

    if (exits.length === 0) {
      return null;
    }

    // Dijkstra algorithm
    const distances = new Map();
    const actualDistances = new Map();
    const previousNode = new Map();
    const previousTunnel = new Map();
    const visited = new Set();
    const unvisited = new Set();

    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, Infinity);
      actualDistances.set(nodeId, Infinity);
      previousNode.set(nodeId, null);
      previousTunnel.set(nodeId, null);
      unvisited.add(nodeId);
    }

    distances.set(startNodeId, 0);
    actualDistances.set(startNodeId, 0);

    while (unvisited.size > 0) {
      // Find node with minimum cost
      let currentSmallest = null;
      let smallestDist = Infinity;

      for (const nodeId of unvisited) {
        const dist = distances.get(nodeId) ?? Infinity;
        if (dist < smallestDist) {
          smallestDist = dist;
          currentSmallest = nodeId;
        }
      }

      if (currentSmallest === null || smallestDist === Infinity) {
        break; // All remaining nodes unreachable
      }

      unvisited.delete(currentSmallest);
      visited.add(currentSmallest);

      const neighbors = this.adjacencyList.get(currentSmallest) || [];
      for (const edge of neighbors) {
        if (visited.has(edge.to) || !edge.isAvailable || edge.effectiveCost === Infinity) {
          continue;
        }

        const candidateCost = (distances.get(currentSmallest) ?? Infinity) + edge.effectiveCost;
        const candidateActualDist = (actualDistances.get(currentSmallest) ?? 0) + edge.distance;

        if (candidateCost < (distances.get(edge.to) ?? Infinity)) {
          distances.set(edge.to, candidateCost);
          actualDistances.set(edge.to, candidateActualDist);
          previousNode.set(edge.to, currentSmallest);
          previousTunnel.set(edge.to, edge.tunnelId);
        }
      }
    }

    // Select the best reachable exit with lowest cost
    let bestExit = null;
    let minCost = Infinity;

    for (const exit of exits) {
      const cost = distances.get(exit.id) ?? Infinity;
      if (cost < minCost) {
        minCost = cost;
        bestExit = exit;
      }
    }

    if (!bestExit || minCost === Infinity) {
      // If all exits are blocked, attempt routing to Refuge Bay REF-1
      const refuge = this.nodes.get('REF-1');
      if (refuge && (distances.get('REF-1') ?? Infinity) < Infinity) {
        bestExit = refuge;
      } else {
        return null;
      }
    }

    // Reconstruct path
    const routeNodes = [];
    const routeTunnels = [];
    let curr = bestExit.id;

    while (curr !== null) {
      routeNodes.unshift(curr);
      const prevT = previousTunnel.get(curr);
      if (prevT) {
        routeTunnels.unshift(prevT);
      }
      curr = previousNode.get(curr) ?? null;
    }

    // Assess overall path risk
    let overallPathRisk = 'SAFE';
    for (const tId of routeTunnels) {
      const t = this.tunnels.get(tId);
      if (t) {
        if (t.riskLevel === 'CRITICAL') overallPathRisk = 'CRITICAL';
        else if (t.riskLevel === 'WARNING' && overallPathRisk !== 'CRITICAL') overallPathRisk = 'WARNING';
        else if (t.riskLevel === 'CAUTION' && overallPathRisk === 'SAFE') overallPathRisk = 'CAUTION';
      }
    }

    const totalDistance = actualDistances.get(bestExit.id) ?? 0;

    return {
      routeNodes,
      routeTunnels,
      totalDistance,
      destinationExit: bestExit.id,
      overallPathRisk,
    };
  }

  /**
   * Generates a complete EvacuationRoutePlan with turn-by-turn guidance
   */
  generateRoutePlan(
    workerId,
    workerName,
    startNodeId,
    hasBeenRecalculated = false,
    rerouteReason
  ) {
    const result = this.calculateSafestPath(startNodeId);
    if (!result) {
      return null;
    }

    const turnByTurn = [];
    const walkSpeedMps = 1.25; // 4.5 km/h underground walking speed

    for (let i = 0; i < result.routeTunnels.length; i++) {
      const tId = result.routeTunnels[i];
      const tunnel = this.tunnels.get(tId);
      const fromN = this.nodes.get(result.routeNodes[i]);
      const toN = this.nodes.get(result.routeNodes[i + 1]);

      const dist = tunnel?.distance || 100;
      const isLastStep = i === result.routeTunnels.length - 1;
      const destName = toN?.name || `Junction ${toN?.id}`;

      let instruction = `Proceed along ${tunnel?.name || tId} towards ${destName} (${dist}m)`;
      if (isLastStep && toN?.isExit) {
        instruction = `Final leg: Advance along ${tunnel?.name} to reach surface exit ${destName} (${dist}m) 🚪`;
      } else if (isLastStep && toN?.type === 'REFUGE_BAY') {
        instruction = `Immediate safety: Enter ${destName} and secure airtight hatch (${dist}m) 🛡️`;
      }

      turnByTurn.push({
        step: i + 1,
        instruction,
        tunnelId: tId,
        distanceM: dist,
        safetyStatus: tunnel?.riskLevel || 'SAFE',
      });
    }

    const estimatedTimeSeconds = Math.round(result.totalDistance / walkSpeedMps);

    return {
      workerId,
      workerName,
      startNode: startNodeId,
      destinationExit: result.destinationExit,
      routeNodes: result.routeNodes,
      routeTunnels: result.routeTunnels,
      totalDistanceMeters: result.totalDistance,
      estimatedTimeSeconds,
      overallPathRisk: result.overallPathRisk,
      turnByTurn,
      alternativeRoutesCount: 2,
      hasBeenRecalculated,
      rerouteReason,
      calculatedAt: new Date().toISOString(),
    };
  }
}
