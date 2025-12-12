import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { getWeeklyScore, getHistory } from '../api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [currentScore, setCurrentScore] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [scoreRes, historyRes] = await Promise.all([
        getWeeklyScore(),
        getHistory()
      ]);

      setCurrentScore(scoreRes.data);
      setHistory(historyRes.data.history);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (score) => {
    if (score === null || score === undefined) {
      return { label: 'No Data', class: 'status-badge' };
    }
    if (score < 20) {
      return { label: 'Excellent', class: 'status-badge status-good' };
    }
    if (score < 40) {
      return { label: 'Good', class: 'status-badge status-good' };
    }
    if (score < 60) {
      return { label: 'Moderate Drift', class: 'status-badge status-warning' };
    }
    return { label: 'High Drift', class: 'status-badge status-alert' };
  };

  const chartData = {
    labels: history.map(h => `Week ${h.week}`),
    datasets: [
      {
        label: 'Neuro Load Score',
        data: history.map(h => h.neuro_load_score),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Speech Drift',
        data: history.map(h => h.speech_drift),
        borderColor: '#f093fb',
        backgroundColor: 'rgba(240, 147, 251, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Cognitive Drift',
        data: history.map(h => h.cognitive_drift),
        borderColor: '#4facfe',
        backgroundColor: 'rgba(79, 172, 254, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Visual-Motor Drift',
        data: history.map(h => h.visual_drift),
        borderColor: '#43e97b',
        backgroundColor: 'rgba(67, 233, 123, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Drift Score'
        }
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const statusInfo = getStatusInfo(currentScore?.neuro_load_score);

  return (
    <div className="dashboard">
      <div className="card">
        <h2 className="card-title">Current Week Performance</h2>
        <div className="score-display">
          <div className="score-value">
            {currentScore?.neuro_load_score !== null && currentScore?.neuro_load_score !== undefined
              ? currentScore.neuro_load_score.toFixed(1)
              : '--'}
          </div>
          <div className="score-label">Neuro Load Score</div>
          <span className={statusInfo.class}>{statusInfo.label}</span>
        </div>

        {currentScore && (
          <div style={{ marginTop: '1.5rem' }}>
            <div className="metric-row">
              <span className="metric-label">Speech Drift</span>
              <span className="metric-value">
                {currentScore.speech_drift !== null ? currentScore.speech_drift.toFixed(1) : '--'}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Cognitive Drift</span>
              <span className="metric-value">
                {currentScore.cognitive_drift !== null ? currentScore.cognitive_drift.toFixed(1) : '--'}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Visual-Motor Drift</span>
              <span className="metric-value">
                {currentScore.visual_drift !== null ? currentScore.visual_drift.toFixed(1) : '--'}
              </span>
            </div>
          </div>
        )}

        {currentScore?.status === 'incomplete' && (
          <p style={{ marginTop: '1rem', color: '#666', textAlign: 'center' }}>
            Complete your weekly check-in to see your score
          </p>
        )}
      </div>

      {history.length > 0 && (
        <div className="card">
          <h2 className="card-title">Performance Trend</h2>
          <div style={{ height: '300px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {history.length === 0 && (
        <div className="card">
          <h2 className="card-title">Getting Started</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Welcome to BrainGauge! Complete your first weekly check-in to establish your baseline
            and start tracking your cognitive performance.
          </p>
          <p style={{ color: '#666' }}>
            Your first week's assessment will serve as your baseline for all future comparisons.
          </p>
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default Dashboard;
