import React, { useEffect, useState } from 'react';

export default function RiskGauge({ score, threatLevel, confidence }) {
  const [offset, setOffset] = useState(440);
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.82

  useEffect(() => {
    // Animate the strokeDashoffset on load
    const progressOffset = circumference - (score / 100) * circumference;
    const timer = setTimeout(() => {
      setOffset(progressOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  // Color mapping
  const getColor = (val) => {
    if (val <= 30) return '#10b981'; // Green
    if (val <= 70) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const currentColor = getColor(score);

  return (
    <div className="risk-gauge-container">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle
          className="risk-circle-bg"
          cx="80"
          cy="80"
          r={radius}
        />
        <circle
          className="risk-circle-value"
          cx="80"
          cy="80"
          r={radius}
          stroke={currentColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="risk-gauge-value">
        <div className="risk-percentage" style={{ color: currentColor }}>
          {score}%
        </div>
        <div className="risk-label" style={{ color: currentColor, fontSize: '0.75rem' }}>
          {threatLevel}
        </div>
      </div>
      {confidence !== undefined && (
        <div className="risk-gauge-subtext">
          AI Conf: {confidence}%
        </div>
      )}
    </div>
  );
}
