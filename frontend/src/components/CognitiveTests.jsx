import React, { useState, useEffect, useRef } from 'react';
import { submitCognitiveTest } from '../api';

function CognitiveTests({ onComplete }) {
  const [currentTest, setCurrentTest] = useState('intro'); // intro, reaction, nback, results
  const [reactionTrials, setReactionTrials] = useState([]);
  const [nbackTrials, setNbackTrials] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  // Reaction test state
  const [showTarget, setShowTarget] = useState(false);
  const [reactionStartTime, setReactionStartTime] = useState(0);
  const [reactionCount, setReactionCount] = useState(0);

  // N-back test state
  const [nbackSequence, setNbackSequence] = useState([]);
  const [nbackIndex, setNbackIndex] = useState(0);
  const [nbackStartTime, setNbackStartTime] = useState(0);

  const REACTION_TRIALS = 10;
  const NBACK_TRIALS = 20;
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  useEffect(() => {
    if (currentTest === 'reaction' && reactionCount < REACTION_TRIALS) {
      scheduleReactionTarget();
    }
  }, [currentTest, reactionCount]);

  useEffect(() => {
    if (currentTest === 'nback' && nbackIndex === 0) {
      generateNbackSequence();
    }
  }, [currentTest]);

  useEffect(() => {
    if (currentTest === 'nback' && nbackSequence.length > 0 && nbackIndex < nbackSequence.length) {
      const timer = setTimeout(() => {
        setNbackStartTime(Date.now());
      }, 500);
      return () => clearTimeout(timer);
    } else if (currentTest === 'nback' && nbackIndex >= nbackSequence.length) {
      submitResults();
    }
  }, [nbackIndex, nbackSequence, currentTest]);

  const scheduleReactionTarget = () => {
    const delay = 1000 + Math.random() * 3000; // 1-4 seconds
    setTimeout(() => {
      setShowTarget(true);
      setReactionStartTime(Date.now());
    }, delay);
  };

  const handleReactionClick = () => {
    if (showTarget) {
      const reactionTime = Date.now() - reactionStartTime;
      setReactionTrials([...reactionTrials, { correct: true, time: reactionTime }]);
      setShowTarget(false);
      setReactionCount(reactionCount + 1);

      if (reactionCount + 1 >= REACTION_TRIALS) {
        setCurrentTest('nback');
      }
    } else {
      // False start
      setReactionTrials([...reactionTrials, { correct: false, time: 0 }]);
      setReactionCount(reactionCount + 1);
    }
  };

  const generateNbackSequence = () => {
    const sequence = [];
    const targetIndices = new Set();

    // Ensure some matches (2-back)
    const numMatches = Math.floor(NBACK_TRIALS * 0.3); // 30% matches
    while (targetIndices.size < numMatches) {
      const idx = 2 + Math.floor(Math.random() * (NBACK_TRIALS - 2));
      targetIndices.add(idx);
    }

    for (let i = 0; i < NBACK_TRIALS; i++) {
      if (targetIndices.has(i) && i >= 2) {
        // Make it match 2-back
        sequence.push(sequence[i - 2]);
      } else {
        // Random letter, but avoid accidental matches
        let letter;
        do {
          letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        } while (i >= 2 && letter === sequence[i - 2]);
        sequence.push(letter);
      }
    }

    setNbackSequence(sequence);
  };

  const handleNbackResponse = (isMatch) => {
    const responseTime = Date.now() - nbackStartTime;
    const actualMatch = nbackIndex >= 2 && nbackSequence[nbackIndex] === nbackSequence[nbackIndex - 2];
    const correct = isMatch === actualMatch;

    setNbackTrials([...nbackTrials, { correct, time: responseTime }]);
    setNbackIndex(nbackIndex + 1);
  };

  const submitResults = async () => {
    setProcessing(true);
    try {
      const response = await submitCognitiveTest({
        reaction_time_trials: reactionTrials,
        working_memory_trials: nbackTrials
      });

      setResult(response.data);
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (err) {
      console.error('Failed to submit cognitive tests:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (processing) {
    return <div className="loading">Processing results...</div>;
  }

  if (result) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h3 style={{ color: '#155724', marginBottom: '1.5rem' }}>
          Cognitive Tests Complete
        </h3>
        <div className="metric-row">
          <span className="metric-label">Reaction Time</span>
          <span className="metric-value">{result.reaction_results.avg_time}ms</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Reaction Accuracy</span>
          <span className="metric-value">{result.reaction_results.accuracy.toFixed(1)}%</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Memory Accuracy</span>
          <span className="metric-value">{result.memory_results.accuracy.toFixed(1)}%</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Drift Score</span>
          <span className="metric-value">{result.drift_score.toFixed(1)}</span>
        </div>
      </div>
    );
  }

  if (currentTest === 'intro') {
    return (
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Cognitive Performance Tests</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          You'll complete two quick tests:
        </p>

        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>1. Reaction Time Test</h4>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Click as quickly as possible when the target appears. Complete {REACTION_TRIALS} trials.
          </p>
        </div>

        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>2. Working Memory Test (2-Back)</h4>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Watch letters appear one at a time. Press "Match" if the current letter matches the one
            from 2 positions back. Press "No Match" otherwise.
          </p>
        </div>

        <button className="button" onClick={() => setCurrentTest('reaction')}>
          Start Tests
        </button>
      </div>
    );
  }

  if (currentTest === 'reaction') {
    return (
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem' }}>Reaction Time Test</h3>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Trial {reactionCount + 1} of {REACTION_TRIALS}
        </p>

        <div
          onClick={handleReactionClick}
          style={{
            width: '100%',
            height: '300px',
            background: showTarget ? '#28a745' : '#f8f9fa',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.1s',
            marginBottom: '1rem'
          }}
        >
          {showTarget ? (
            <div style={{ fontSize: '4rem', color: 'white' }}>●</div>
          ) : (
            <div style={{ color: '#999' }}>Wait for the target...</div>
          )}
        </div>

        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          {showTarget ? 'Click now!' : 'Click as fast as you can when the target appears'}
        </p>
      </div>
    );
  }

  if (currentTest === 'nback') {
    const currentLetter = nbackSequence[nbackIndex];
    const progress = ((nbackIndex + 1) / NBACK_TRIALS) * 100;

    return (
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem' }}>2-Back Memory Test</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          {nbackIndex + 1} of {NBACK_TRIALS}
        </p>

        <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div style={{
          width: '200px',
          height: '200px',
          margin: '0 auto 1.5rem',
          background: '#f8f9fa',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '6rem',
          fontWeight: 'bold',
          color: '#333'
        }}>
          {currentLetter}
        </div>

        <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
          Does this match the letter from 2 positions back?
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="button"
            onClick={() => handleNbackResponse(true)}
            style={{ flex: 1, background: '#28a745' }}
          >
            Match
          </button>
          <button
            className="button"
            onClick={() => handleNbackResponse(false)}
            style={{ flex: 1, background: '#dc3545' }}
          >
            No Match
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default CognitiveTests;
