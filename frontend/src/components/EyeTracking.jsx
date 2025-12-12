import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { submitVisualTest } from '../api';

function EyeTracking({ onComplete }) {
  const [status, setStatus] = useState('init'); // init, loading, ready, tracking, processing, complete
  const [model, setModel] = useState(null);
  const [trackingData, setTrackingData] = useState({
    positions: [],
    target_positions: [],
    blinks: [],
    duration: 0
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const targetRef = useRef({ x: 0.5, y: 0.5 });
  const startTimeRef = useRef(0);
  const animationRef = useRef(null);
  const trackingIntervalRef = useRef(null);

  const TEST_DURATION = 15000; // 15 seconds
  const TARGET_SPEED = 0.001; // pixels per ms

  useEffect(() => {
    loadModel();
    return () => {
      cleanup();
    };
  }, []);

  const loadModel = async () => {
    try {
      setStatus('loading');
      await tf.ready();
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
      setStatus('ready');
    } catch (err) {
      setError('Failed to load face detection model');
      console.error(err);
    }
  };

  const startTracking = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus('tracking');
      startTimeRef.current = Date.now();

      // Start tracking loop
      trackingIntervalRef.current = setInterval(trackFace, 100);

      // Start target animation
      animateTarget();

      // Stop after duration
      setTimeout(() => {
        stopTracking();
      }, TEST_DURATION);

    } catch (err) {
      setError('Camera access denied. Please allow camera access.');
      console.error(err);
    }
  };

  const trackFace = async () => {
    if (!model || !videoRef.current || status !== 'tracking') return;

    try {
      const predictions = await model.estimateFaces(videoRef.current, false);

      if (predictions.length > 0) {
        const face = predictions[0];

        // Get eye positions (approximate from face landmarks)
        const leftEye = face.landmarks[0]; // Left eye
        const rightEye = face.landmarks[1]; // Right eye

        // Average eye position
        const eyeX = (leftEye[0] + rightEye[0]) / 2 / videoRef.current.videoWidth;
        const eyeY = (leftEye[1] + rightEye[1]) / 2 / videoRef.current.videoHeight;

        const timestamp = Date.now() - startTimeRef.current;

        // Check for blinks (very rough approximation)
        // In a real implementation, you'd use more sophisticated blink detection
        const eyeDistance = Math.sqrt(
          Math.pow(rightEye[0] - leftEye[0], 2) +
          Math.pow(rightEye[1] - leftEye[1], 2)
        );

        // If eyes are very close together (closed), might be a blink
        // This is a simplified heuristic
        const avgEyeDistance = 100; // Approximate baseline
        if (eyeDistance < avgEyeDistance * 0.5) {
          setTrackingData(prev => ({
            ...prev,
            blinks: [...prev.blinks, timestamp]
          }));
        }

        setTrackingData(prev => ({
          ...prev,
          positions: [...prev.positions, { x: eyeX, y: eyeY, timestamp }],
          target_positions: [...prev.target_positions, {
            x: targetRef.current.x,
            y: targetRef.current.y,
            timestamp
          }]
        }));
      }
    } catch (err) {
      console.error('Face tracking error:', err);
    }
  };

  const animateTarget = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let angle = 0;
    const radius = 0.3; // 30% of screen
    const centerX = 0.5;
    const centerY = 0.5;

    const animate = () => {
      if (status !== 'tracking') return;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update target position (circular motion)
      angle += 0.02;
      targetRef.current = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };

      // Draw target
      ctx.beginPath();
      ctx.arc(
        targetRef.current.x * width,
        targetRef.current.y * height,
        20,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = '#667eea';
      ctx.fill();

      // Draw tracking instructions
      ctx.fillStyle = '#333';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Follow the dot with your eyes', width / 2, 30);

      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.ceil((TEST_DURATION - elapsed) / 1000);
      ctx.fillText(`${remaining}s remaining`, width / 2, height - 20);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopTracking = () => {
    setStatus('processing');

    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }

    // Stop tracking
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }

    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Calculate duration
    const duration = (Date.now() - startTimeRef.current) / 1000;

    // Remove duplicate blinks (within 500ms)
    const uniqueBlinks = [];
    trackingData.blinks.forEach(blink => {
      if (uniqueBlinks.length === 0 || blink - uniqueBlinks[uniqueBlinks.length - 1] > 500) {
        uniqueBlinks.push(blink);
      }
    });

    const finalData = {
      ...trackingData,
      blinks: uniqueBlinks,
      duration
    };

    submitResults(finalData);
  };

  const submitResults = async (data) => {
    try {
      const response = await submitVisualTest(data);
      setResult(response.data);

      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (err) {
      setError('Failed to submit eye tracking data');
      console.error(err);
    }
  };

  const cleanup = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (status === 'loading') {
    return <div className="loading">Loading face detection model...</div>;
  }

  if (status === 'processing') {
    return <div className="loading">Processing eye tracking data...</div>;
  }

  if (result) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h3 style={{ color: '#155724', marginBottom: '1.5rem' }}>
          Eye Tracking Complete
        </h3>
        <div className="metric-row">
          <span className="metric-label">Tracking Accuracy</span>
          <span className="metric-value">{result.results.tracking_accuracy.toFixed(1)}%</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Blink Rate</span>
          <span className="metric-value">{result.results.blink_rate.toFixed(1)}/min</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Total Blinks</span>
          <span className="metric-value">{result.results.total_blinks}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Drift Score</span>
          <span className="metric-value">{result.drift_score.toFixed(1)}</span>
        </div>
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Eye Movement Tracking</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          This test will track your eye movements as you follow a moving target for 15 seconds.
        </p>

        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Instructions:</h4>
          <ul style={{ fontSize: '0.9rem', color: '#666', paddingLeft: '1.5rem' }}>
            <li>Allow camera access when prompted</li>
            <li>Position your face clearly in view</li>
            <li>Follow the blue dot with your eyes only (don't move your head)</li>
            <li>Try to blink naturally</li>
          </ul>
        </div>

        <button className="button" onClick={startTracking}>
          Start Eye Tracking
        </button>
      </div>
    );
  }

  if (status === 'tracking') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              maxWidth: '640px',
              borderRadius: '12px',
              transform: 'scaleX(-1)' // Mirror video
            }}
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '640px',
              pointerEvents: 'none'
            }}
          />
        </div>
      </div>
    );
  }

  return null;
}

export default EyeTracking;
