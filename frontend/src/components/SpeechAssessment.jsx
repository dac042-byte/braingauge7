import React, { useState, useEffect, useRef } from 'react';
import { getPassage, uploadAudio } from '../api';

function SpeechAssessment({ onComplete }) {
  const [passage, setPassage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    loadPassage();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadPassage = async () => {
    try {
      const response = await getPassage();
      setPassage(response.data.passage);
    } catch (err) {
      setError('Failed to load passage');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);

    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const submitRecording = async () => {
    if (!audioBlob) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await uploadAudio(audioBlob, recordingTime);
      setResult(response.data);

      // Auto-complete after showing results
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (err) {
      setError('Failed to process recording. Please try again.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const retryRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setResult(null);
    setError(null);
  };

  if (result) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h3 style={{ color: '#155724', marginBottom: '1.5rem' }}>
          Speech Assessment Complete
        </h3>
        <div className="metric-row">
          <span className="metric-label">Words per Minute</span>
          <span className="metric-value">{result.metrics.wpm}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Filler Words</span>
          <span className="metric-value">{result.metrics.filler_count}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Drift Score</span>
          <span className="metric-value">{result.drift_score.toFixed(1)}</span>
        </div>
        {result.is_baseline && (
          <p style={{ marginTop: '1rem', color: '#856404', fontSize: '0.9rem' }}>
            This is your baseline assessment. Future assessments will be compared to these results.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}

      <div style={{
        background: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        lineHeight: '1.8'
      }}>
        <h4 style={{ marginBottom: '1rem', color: '#333' }}>Read this passage:</h4>
        <p style={{ fontSize: '1.1rem', color: '#555' }}>{passage}</p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {!isRecording && !audioBlob && (
          <button className="button" onClick={startRecording}>
            🎤 Start Recording
          </button>
        )}

        {isRecording && (
          <div>
            <div style={{
              fontSize: '3rem',
              color: '#dc3545',
              marginBottom: '1rem',
              animation: 'pulse 1.5s infinite'
            }}>
              ●
            </div>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </div>
            <button className="button" onClick={stopRecording}>
              ⏹ Stop Recording
            </button>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              Recommended: 20-60 seconds
            </p>
          </div>
        )}

        {audioBlob && !processing && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
              <p>Recording complete: {recordingTime} seconds</p>
            </div>
            <button className="button" onClick={submitRecording}>
              Submit Recording
            </button>
            <button
              className="button button-secondary"
              onClick={retryRecording}
              style={{ marginTop: '0.5rem' }}
            >
              Record Again
            </button>
          </div>
        )}

        {processing && (
          <div className="loading">
            <div>Processing your recording...</div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              This may take a moment
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default SpeechAssessment;
