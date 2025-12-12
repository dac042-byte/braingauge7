import React, { useState, useEffect } from 'react';
import { getHistory, resetBaseline } from '../api';

function Profile() {
  const [history, setHistory] = useState([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await getHistory();
      setHistory(response.data.history);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleResetBaseline = async () => {
    setLoading(true);
    try {
      await resetBaseline();
      setHistory([]);
      setShowResetConfirm(false);
      alert('Baseline reset successfully. Start a new check-in to create a new baseline.');
    } catch (err) {
      alert('Failed to reset baseline');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `braingauge-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = {
    totalWeeks: history.length,
    avgScore: history.length > 0
      ? (history.reduce((sum, h) => sum + (h.neuro_load_score || 0), 0) / history.filter(h => h.neuro_load_score).length).toFixed(1)
      : 0,
    baselineDate: history.find(h => h.is_baseline)?.date
  };

  return (
    <div className="profile">
      <div className="card">
        <h2 className="card-title">Profile Statistics</h2>

        <div className="metric-row">
          <span className="metric-label">Total Assessments</span>
          <span className="metric-value">{stats.totalWeeks}</span>
        </div>

        <div className="metric-row">
          <span className="metric-label">Average Neuro Load Score</span>
          <span className="metric-value">{stats.avgScore || '--'}</span>
        </div>

        {stats.baselineDate && (
          <div className="metric-row">
            <span className="metric-label">Baseline Established</span>
            <span className="metric-value">
              {new Date(stats.baselineDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">Data Management</h2>

        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Export Data</h4>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
            Download your assessment history as a JSON file for your records or further analysis.
          </p>
          <button
            className="button button-secondary"
            onClick={handleExportData}
            disabled={history.length === 0}
          >
            📥 Export Data
          </button>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e0e0e0' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#dc3545' }}>Reset Baseline</h4>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
            This will delete all your assessment history and reset your baseline. You'll start fresh
            with your next check-in as the new baseline.
          </p>

          {!showResetConfirm ? (
            <button
              className="button"
              onClick={() => setShowResetConfirm(true)}
              style={{ background: '#dc3545' }}
            >
              Reset Baseline
            </button>
          ) : (
            <div style={{ background: '#f8d7da', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ color: '#721c24', marginBottom: '1rem', fontWeight: 'bold' }}>
                Are you sure? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="button"
                  onClick={handleResetBaseline}
                  disabled={loading}
                  style={{ background: '#dc3545', flex: 1 }}
                >
                  {loading ? 'Resetting...' : 'Yes, Reset'}
                </button>
                <button
                  className="button button-secondary"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">About BrainGauge</h2>
        <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6', marginBottom: '1rem' }}>
          BrainGauge is a cognitive performance tracking tool designed for athletes to monitor
          changes in cognitive function through weekly assessments.
        </p>
        <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6', marginBottom: '1rem' }}>
          <strong>Important:</strong> This is NOT a medical device. It's designed for performance
          awareness and trend monitoring only. Always consult healthcare professionals for medical
          advice.
        </p>
        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
          <div className="metric-row" style={{ border: 'none', padding: '0.25rem 0' }}>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Version</span>
            <span style={{ fontSize: '0.85rem', color: '#333' }}>1.0.0</span>
          </div>
          <div className="metric-row" style={{ border: 'none', padding: '0.25rem 0' }}>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Assessments</span>
            <span style={{ fontSize: '0.85rem', color: '#333' }}>Speech, Cognitive, Visual-Motor</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
