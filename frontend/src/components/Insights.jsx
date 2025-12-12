import React, { useState, useEffect } from 'react';
import { getInsights } from '../api';

function Insights() {
  const [insights, setInsights] = useState([]);
  const [currentScore, setCurrentScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const response = await getInsights();
      setInsights(response.data.insights || []);
      setCurrentScore(response.data.current_score);
      setError(null);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to load insights');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'alert': return '🚨';
      case 'positive': return '✨';
      case 'info': return 'ℹ️';
      default: return '💡';
    }
  };

  const getInsightClass = (type) => {
    switch (type) {
      case 'warning': return 'status-badge status-warning';
      case 'alert': return 'status-badge status-alert';
      case 'positive': return 'status-badge status-good';
      default: return 'status-badge';
    }
  };

  if (loading) {
    return <div className="loading">Loading insights...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <h2 className="card-title">Insights</h2>
        <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
          {error}
        </p>
        <p style={{ color: '#666', textAlign: 'center', fontSize: '0.9rem' }}>
          Complete at least 2 weeks of assessments to see personalized insights.
        </p>
      </div>
    );
  }

  return (
    <div className="insights">
      {currentScore !== null && (
        <div className="card">
          <h2 className="card-title">Current Status</h2>
          <div className="score-display">
            <div className="score-value">{currentScore.toFixed(1)}</div>
            <div className="score-label">Current Neuro Load Score</div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Performance Insights</h2>

        {insights.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
            No insights available yet. Keep completing your weekly assessments!
          </p>
        ) : (
          <div>
            {insights.map((insight, index) => (
              <div
                key={index}
                style={{
                  background: '#f8f9fa',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>
                    {getInsightIcon(insight.type)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                      {insight.area}
                    </div>
                    <p style={{ margin: 0, color: '#555', lineHeight: '1.6' }}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">Understanding Your Scores</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Neuro Load Score</h4>
          <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6' }}>
            Your overall cognitive performance metric. Lower scores indicate performance closer to
            your baseline, while higher scores suggest greater cognitive drift.
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Score Ranges</h4>
          <div className="metric-row">
            <span className="status-badge status-good">0-20: Excellent</span>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Minimal drift from baseline</span>
          </div>
          <div className="metric-row">
            <span className="status-badge status-good">20-40: Good</span>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Slight variations, within normal range</span>
          </div>
          <div className="metric-row">
            <span className="status-badge status-warning">40-60: Moderate</span>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Noticeable drift, monitor closely</span>
          </div>
          <div className="metric-row">
            <span className="status-badge status-alert">60+: High</span>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Significant drift, consider rest</span>
          </div>
        </div>

        <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#856404' }}>
            <strong>Note:</strong> BrainGauge is a performance tracking tool, not a medical device.
            Consult healthcare professionals for any health concerns.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Insights;
