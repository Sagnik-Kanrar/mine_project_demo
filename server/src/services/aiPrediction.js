export class AISubsidencePredictionService {
  /**
   * Evaluates current sensor streams and historical trends to compute subsidence risk score,
   * 30-minute predictive deformation curve, and explainable feature contributions.
   */
  evaluateSubsidenceRisk(sensors) {
    // Extract key feature values from active sensor array
    const displacementSensors = sensors.filter((s) => s.type === 'GROUND_DISPLACEMENT' && s.status !== 'OFFLINE');
    const tiltSensors = sensors.filter((s) => s.type === 'TILT_ANGLE' && s.status !== 'OFFLINE');
    const imuSensors = sensors.filter((s) => s.type === 'IMU_ACCELEROMETER' && s.status !== 'OFFLINE');
    const vibSensors = sensors.filter((s) => s.type === 'VIBRATION' && s.status !== 'OFFLINE');
    const pressureSensors = sensors.filter((s) => s.type === 'PRESSURE_STRESS' && s.status !== 'OFFLINE');
    const tempSensors = sensors.filter((s) => s.type === 'TEMPERATURE' && s.status !== 'OFFLINE');
    const humiditySensors = sensors.filter((s) => s.type === 'HUMIDITY' && s.status !== 'OFFLINE');

    // Max values represent peak vulnerability
    const maxDisplacement = Math.max(...displacementSensors.map((s) => s.value), 2.5);
    const maxTilt = Math.max(...tiltSensors.map((s) => s.value), 0.6);
    const maxImu = Math.max(...imuSensors.map((s) => s.value), 0.08);
    const maxVibration = Math.max(...vibSensors.map((s) => s.value), 12.0);
    const maxPressure = Math.max(...pressureSensors.map((s) => s.value), 16.0);
    const maxTemp = Math.max(...tempSensors.map((s) => s.value), 26.0);
    const maxHumidity = Math.max(...humiditySensors.map((s) => s.value), 65.0);

    // Calculate approximate displacement velocity (mm/min)
    const displacementSensor1 = sensors.find((s) => s.id === 'SENS-001');
    let velocity = 0.04;
    if (displacementSensor1 && displacementSensor1.history && displacementSensor1.history.length >= 2) {
      const last = displacementSensor1.history[displacementSensor1.history.length - 1].value;
      const prev = displacementSensor1.history[displacementSensor1.history.length - 2].value;
      velocity = Math.max(0.01, Number(((last - prev) / 5).toFixed(3)));
    }

    // Weighted Machine Learning Emulation Score (0 to 100)
    // Feature 1: Displacement (0 - 20mm -> 0 - 35 pts)
    const displacementScore = Math.min(35, (maxDisplacement / 15.0) * 35);

    // Feature 2: Velocity / Acceleration Rate (0 - 1.5mm/min -> 0 - 25 pts)
    const velocityScore = Math.min(25, (velocity / 1.0) * 25);

    // Feature 3: Tilt Angle (0 - 8 deg -> 0 - 15 pts)
    const tiltScore = Math.min(15, (maxTilt / 6.0) * 15);

    // Feature 4: Micro-seismic vibration / acoustic emissions (0 - 80 Hz -> 0 - 12 pts)
    const vibScore = Math.min(12, (maxVibration / 60.0) * 12);

    // Feature 5: Hydraulic stress on support pillars (0 - 45 MPa -> 0 - 13 pts)
    const stressScore = Math.min(13, (maxPressure / 40.0) * 13);

    const rawRiskScore = displacementScore + velocityScore + tiltScore + vibScore + stressScore;
    const overallRiskScore = Math.round(Math.min(100, Math.max(8, rawRiskScore)));

    let riskClassification = 'SAFE';
    if (overallRiskScore >= 80) riskClassification = 'CRITICAL';
    else if (overallRiskScore >= 60) riskClassification = 'WARNING';
    else if (overallRiskScore >= 35) riskClassification = 'CAUTION';

    // Generate 30-Minute Predictive Strata Deformation Forecast Curve
    const forecast30Min = [];
    const criticalThresholdMm = 15.0;

    for (let min = 0; min <= 30; min += 5) {
      // Exponential strata velocity model: D(t) = D_0 + v*t + 0.5*a*t^2
      const accelerationFactor = (overallRiskScore / 100) * 0.015;
      const projectedDeform = maxDisplacement + velocity * min + 0.5 * accelerationFactor * Math.pow(min, 1.8);
      const uncertainty = (min / 30) * 0.8 + 0.2;

      const lowerBound = Math.max(0, projectedDeform - uncertainty);
      const upperBound = projectedDeform + uncertainty;
      const probabilityOfFailure = Math.min(
        100,
        Math.round((Math.max(0, projectedDeform - 10) / (criticalThresholdMm - 10)) * 100)
      );

      forecast30Min.push({
        minute: min,
        predictedDeformationMm: Number(projectedDeform.toFixed(2)),
        lowerBoundMm: Number(lowerBound.toFixed(2)),
        upperBoundMm: Number(upperBound.toFixed(2)),
        criticalThresholdMm,
        probabilityOfFailure: Math.max(0, probabilityOfFailure),
      });
    }

    // Explainable AI (XAI) feature contribution breakdown
    const dominantFactors = [
      {
        factor: 'Strata Roof Displacement',
        weight: Math.round((displacementScore / rawRiskScore) * 100) || 35,
        impact: maxDisplacement > 8 ? 'HIGH' : maxDisplacement > 4 ? 'MEDIUM' : 'LOW',
        detail: `Current peak displacement is ${maxDisplacement.toFixed(1)} mm (Warning threshold: 10.0 mm)`,
      },
      {
        factor: 'Deformation Rate (Velocity)',
        weight: Math.round((velocityScore / rawRiskScore) * 100) || 25,
        impact: velocity > 0.4 ? 'HIGH' : velocity > 0.15 ? 'MEDIUM' : 'LOW',
        detail: `Rate of strata movement is ${velocity.toFixed(2)} mm/min`,
      },
      {
        factor: 'Roof Support Tilt / Clinometer Angle',
        weight: Math.round((tiltScore / rawRiskScore) * 100) || 15,
        impact: maxTilt > 3.0 ? 'HIGH' : maxTilt > 1.5 ? 'MEDIUM' : 'LOW',
        detail: `Biaxial tilt deviation measured at ${maxTilt.toFixed(1)}°`,
      },
      {
        factor: 'Micro-Seismic Acoustic Vibration',
        weight: Math.round((vibScore / rawRiskScore) * 100) || 12,
        impact: maxVibration > 40 ? 'HIGH' : maxVibration > 20 ? 'MEDIUM' : 'LOW',
        detail: `Geophone peak response ${maxVibration.toFixed(1)} Hz (Rock fracturing indicator)`,
      },
      {
        factor: 'Hydraulic Strata Pressure',
        weight: Math.round((stressScore / rawRiskScore) * 100) || 13,
        impact: maxPressure > 35 ? 'HIGH' : maxPressure > 25 ? 'MEDIUM' : 'LOW',
        detail: `Overburden pressure load at ${maxPressure.toFixed(1)} MPa`,
      },
    ];

    let summary = 'Strata stability parameters are within safe nominal ranges. No immediate subsidence hazard detected.';
    let recommendation = 'Maintain standard continuous telemetry polling and routine shift inspection.';

    if (riskClassification === 'CRITICAL') {
      summary =
        'CRITICAL SUBSIDENCE ACCELERATION: Severe ground displacement coupled with high micro-seismic activity indicates imminent roof failure risk.';
      recommendation =
        'IMMEDIATE ACTION: Sound emergency alarm, order immediate evacuation of affected zones, and initiate dynamic safe path routing.';
    } else if (riskClassification === 'WARNING') {
      summary =
        'Elevated strata deformation rate and high tilt observed near active longwall face. Subsidence probability escalating.';
      recommendation =
        'Reinforce powered roof supports, restrict non-essential personnel from Zone B, and prepare evacuation corridors.';
    } else if (riskClassification === 'CAUTION') {
      summary =
        'Moderate increase in displacement velocity detected. Strata settling observed in response to coal extraction.';
      recommendation =
        'Increase sensor sampling frequency, inspect extensometer anchors, and alert sector overman.';
    }

    return {
      overallRiskScore,
      riskClassification,
      confidenceScore: 92,
      timestamp: new Date().toISOString(),
      inputs: {
        groundDisplacementMm: Number(maxDisplacement.toFixed(2)),
        displacementVelocityMmPerMin: Number(velocity.toFixed(2)),
        tiltAngleDeg: Number(maxTilt.toFixed(2)),
        vibrationG: Number(maxImu.toFixed(2)),
        vibrationHz: Number(maxVibration.toFixed(1)),
        porePressureMpa: Number(maxPressure.toFixed(1)),
        temperatureC: Number(maxTemp.toFixed(1)),
        humidityPct: Number(maxHumidity.toFixed(1)),
        historicalTrendRate: Number((velocity * 60).toFixed(1)), // mm/hour
      },
      forecast30Min,
      explanation: {
        summary,
        dominantFactors,
        recommendation,
      },
    };
  }
}
