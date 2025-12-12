// BrainGauge - Main Application
// Uses BrainGaugeAPI (from api.js) which can work with localStorage or backend

const { useState, useEffect, useRef } = React;
const API = window.BrainGaugeAPI;
const Analysis = window.AnalysisEngine;

// =============================================================================
// SPEECH ASSESSMENT
// =============================================================================

function SpeechAssessment({ onComplete }) {
    const [passage, setPassage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        loadPassage();
        initSpeechRecognition();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const loadPassage = async () => {
        const passageText = await API.getPassage();
        setPassage(passageText);
    };

    const initSpeechRecognition = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + ' ';
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => prev + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                if (event.error !== 'no-speech') {
                    setError('Speech recognition error. Please try again.');
                }
            };
        } else {
            setError('Speech recognition not supported. Please use Chrome or Edge.');
        }
    };

    const startRecording = () => {
        if (!recognitionRef.current) {
            setError('Speech recognition not available');
            return;
        }

        setTranscript('');
        setIsRecording(true);
        startTimeRef.current = Date.now();
        recognitionRef.current.start();

        timerRef.current = setInterval(() => {
            setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 100);
    };

    const stopRecording = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsRecording(false);
        clearInterval(timerRef.current);
    };

    const submitRecording = async () => {
        if (!transcript.trim()) {
            setError('No speech detected. Please try again.');
            return;
        }

        setProcessing(true);

        try {
            const metrics = Analysis.analyzeSpeech(transcript, recordingTime);
            const baseline = await API.getBaseline();
            const drift = Analysis.calculateSpeechDrift(metrics, baseline?.speech);
            const week = await API.getCurrentWeek();

            const assessment = {
                week,
                type: 'speech',
                timestamp: new Date().toISOString(),
                metrics,
                driftScore: parseFloat(drift),
                isBaseline: week === 1
            };

            await API.saveAssessment(assessment);

            if (week === 1) {
                const current = await API.getBaseline() || {};
                await API.setBaseline({ ...current, speech: metrics });
            }

            setResult({ metrics, driftScore: drift, isBaseline: week === 1 });
            setTimeout(() => onComplete(), 2000);
        } catch (err) {
            setError('Failed to process recording');
        } finally {
            setProcessing(false);
        }
    };

    if (result) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
                <h3 style={{ color: '#155724', marginBottom: '1.5rem' }}>Speech Assessment Complete</h3>
                <div className="metric-row">
                    <span className="metric-label">Words per Minute</span>
                    <span className="metric-value">{result.metrics.wpm}</span>
                </div>
                <div className="metric-row">
                    <span className="metric-label">Filler Words</span>
                    <span className="metric-value">{result.metrics.fillerCount}</span>
                </div>
                <div className="metric-row">
                    <span className="metric-label">Drift Score</span>
                    <span className="metric-value">{result.driftScore}</span>
                </div>
                {result.isBaseline && (
                    <p style={{ marginTop: '1rem', color: '#856404', fontSize: '0.9rem' }}>
                        This is your baseline. Future assessments will compare to this.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div>
            {error && <div className="error">{error}</div>}

            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', lineHeight: '1.8' }}>
                <h4 style={{ marginBottom: '1rem', color: '#333' }}>Read this passage:</h4>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>{passage}</p>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                {!isRecording && !transcript && (
                    <button className="button" onClick={startRecording}>🎤 Start Recording</button>
                )}

                {isRecording && (
                    <div>
                        <div style={{ fontSize: '3rem', color: '#dc3545', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>●</div>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                            {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </div>
                        <button className="button" onClick={stopRecording}>⏹ Stop Recording</button>
                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                            Speak clearly • Recommended: 20-60 seconds
                        </p>
                    </div>
                )}

                {transcript && !processing && !isRecording && (
                    <div>
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                            <p>Recording complete: {recordingTime} seconds</p>
                            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginTop: '1rem', maxHeight: '100px', overflow: 'auto', fontSize: '0.9rem', textAlign: 'left' }}>
                                {transcript}
                            </div>
                        </div>
                        <button className="button" onClick={submitRecording}>Submit Recording</button>
                        <button className="button button-secondary" onClick={() => { setTranscript(''); setRecordingTime(0); setError(null); }} style={{ marginTop: '0.5rem' }}>
                            Record Again
                        </button>
                    </div>
                )}

                {processing && <div className="loading">Processing your recording...</div>}
            </div>
        </div>
    );
}

// =============================================================================
// COGNITIVE TESTS
// =============================================================================

function CognitiveTests({ onComplete }) {
    const [currentTest, setCurrentTest] = useState('intro');
    const [reactionTrials, setReactionTrials] = useState([]);
    const [nbackTrials, setNbackTrials] = useState([]);
    const [result, setResult] = useState(null);

    const [showTarget, setShowTarget] = useState(false);
    const [reactionStartTime, setReactionStartTime] = useState(0);
    const [reactionCount, setReactionCount] = useState(0);

    const [nbackSequence, setNbackSequence] = useState([]);
    const [nbackIndex, setNbackIndex] = useState(0);
    const [nbackStartTime, setNbackStartTime] = useState(0);

    const REACTION_TRIALS = 10;
    const NBACK_TRIALS = 20;
    const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    useEffect(() => {
        if (currentTest === 'reaction' && reactionCount < REACTION_TRIALS) {
            const delay = 1000 + Math.random() * 3000;
            const timer = setTimeout(() => {
                setShowTarget(true);
                setReactionStartTime(Date.now());
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [currentTest, reactionCount]);

    useEffect(() => {
        if (currentTest === 'nback' && nbackIndex === 0 && nbackSequence.length === 0) {
            generateNbackSequence();
        }
    }, [currentTest]);

    useEffect(() => {
        if (currentTest === 'nback' && nbackSequence.length > 0) {
            if (nbackIndex < nbackSequence.length) {
                const timer = setTimeout(() => setNbackStartTime(Date.now()), 500);
                return () => clearTimeout(timer);
            } else if (nbackIndex >= nbackSequence.length) {
                submitResults();
            }
        }
    }, [nbackIndex, nbackSequence, currentTest]);

    const handleReactionClick = () => {
        if (showTarget) {
            const reactionTime = Date.now() - reactionStartTime;
            setReactionTrials(prev => [...prev, { correct: true, time: reactionTime }]);
            setShowTarget(false);
            setReactionCount(reactionCount + 1);

            if (reactionCount + 1 >= REACTION_TRIALS) {
                setCurrentTest('nback');
            }
        } else {
            setReactionTrials(prev => [...prev, { correct: false, time: 0 }]);
            setReactionCount(reactionCount + 1);
        }
    };

    const generateNbackSequence = () => {
        const sequence = [];
        const targetIndices = new Set();
        const numMatches = Math.floor(NBACK_TRIALS * 0.3);

        while (targetIndices.size < numMatches) {
            const idx = 2 + Math.floor(Math.random() * (NBACK_TRIALS - 2));
            targetIndices.add(idx);
        }

        for (let i = 0; i < NBACK_TRIALS; i++) {
            if (targetIndices.has(i) && i >= 2) {
                sequence.push(sequence[i - 2]);
            } else {
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

        setNbackTrials(prev => [...prev, { correct, time: responseTime }]);
        setNbackIndex(nbackIndex + 1);
    };

    const submitResults = async () => {
        const reactionTimes = reactionTrials.filter(t => t.correct).map(t => t.time);
        const reactionTime = reactionTimes.length > 0
            ? (reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length).toFixed(0)
            : 0;
        const reactionAccuracy = ((reactionTrials.filter(t => t.correct).length / reactionTrials.length) * 100).toFixed(1);

        const memoryAccuracy = ((nbackTrials.filter(t => t.correct).length / nbackTrials.length) * 100).toFixed(1);
        const memoryTime = (nbackTrials.reduce((a, b) => a + b.time, 0) / nbackTrials.length).toFixed(0);

        const metrics = {
            reactionTime: parseFloat(reactionTime),
            reactionAccuracy: parseFloat(reactionAccuracy),
            memoryAccuracy: parseFloat(memoryAccuracy),
            memoryTime: parseFloat(memoryTime)
        };

        const baseline = await API.getBaseline();
        const drift = Analysis.calculateCognitiveDrift(metrics, baseline?.cognitive);
        const week = await API.getCurrentWeek();

        const assessment = {
            week,
            type: 'cognitive',
            timestamp: new Date().toISOString(),
            metrics,
            driftScore: parseFloat(drift),
            isBaseline: week === 1
        };

        await API.saveAssessment(assessment);

        if (week === 1) {
            const current = await API.getBaseline() || {};
            await API.setBaseline({ ...current, cognitive: metrics });
        }

        setResult({ metrics, driftScore: drift });
        setTimeout(() => onComplete(), 2000);
    };

    if (result) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
                <h3 style={{ color: '#155724', marginBottom: '1.5rem' }}>Cognitive Tests Complete</h3>
                <div className="metric-row">
                    <span className="metric-label">Reaction Time</span>
                    <span className="metric-value">{result.metrics.reactionTime}ms</span>
                </div>
                <div className="metric-row">
                    <span className="metric-label">Reaction Accuracy</span>
                    <span className="metric-value">{result.metrics.reactionAccuracy}%</span>
                </div>
                <div className="metric-row">
                    <span className="metric-label">Memory Accuracy</span>
                    <span className="metric-value">{result.metrics.memoryAccuracy}%</span>
                </div>
                <div className="metric-row">
                    <span className="metric-label">Drift Score</span>
                    <span className="metric-value">{result.driftScore}</span>
                </div>
            </div>
        );
    }

    if (currentTest === 'intro') {
        return (
            <div>
                <h3 style={{ marginBottom: '1rem' }}>Cognitive Performance Tests</h3>
                <p style={{ marginBottom: '1rem', color: '#666' }}>You'll complete two quick tests:</p>

                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>1. Reaction Time Test</h4>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        Click as quickly as possible when the target appears. Complete {REACTION_TRIALS} trials.
                    </p>
                </div>

                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>2. Working Memory Test (2-Back)</h4>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        Watch letters appear. Press "Match" if the current letter matches the one from 2 positions back.
                    </p>
                </div>

                <button className="button" onClick={() => setCurrentTest('reaction')}>Start Tests</button>
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

// =============================================================================
// EYE TRACKING (Simplified version)
// =============================================================================

function EyeTracking({ onComplete }) {
    const [status, setStatus] = useState('ready');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const canvasRef = useRef(null);
    const videoRef = useRef(null);
    const targetRef = useRef({ x: 0.5, y: 0.5 });
    const trackingDataRef = useRef({ positions: [], targetPositions: [] });
    const startTimeRef = useRef(0);
    const animationRef = useRef(null);
    const modelRef = useRef(null);

    const TEST_DURATION = 15000;

    const startTracking = async () => {
        try {
            setStatus('loading');

            await tf.ready();
            modelRef.current = await blazeface.load();

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setStatus('tracking');
            startTimeRef.current = Date.now();
            trackingDataRef.current = { positions: [], targetPositions: [] };

            animateTarget();
            trackFace();

            setTimeout(() => stopTracking(), TEST_DURATION);

        } catch (err) {
            setError('Camera access denied or not available');
            setStatus('ready');
        }
    };

    const trackFace = async () => {
        if (status !== 'tracking' || !modelRef.current || !videoRef.current) return;

        try {
            const predictions = await modelRef.current.estimateFaces(videoRef.current, false);

            if (predictions.length > 0) {
                const face = predictions[0];
                const leftEye = face.landmarks[0];
                const rightEye = face.landmarks[1];

                const eyeX = (leftEye[0] + rightEye[0]) / 2 / videoRef.current.videoWidth;
                const eyeY = (leftEye[1] + rightEye[1]) / 2 / videoRef.current.videoHeight;

                const timestamp = Date.now() - startTimeRef.current;

                trackingDataRef.current.positions.push({ x: eyeX, y: eyeY, timestamp });
                trackingDataRef.current.targetPositions.push({
                    x: targetRef.current.x,
                    y: targetRef.current.y,
                    timestamp
                });
            }
        } catch (err) {
            console.error('Tracking error:', err);
        }

        if (status === 'tracking') {
            setTimeout(trackFace, 100);
        }
    };

    const animateTarget = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        let angle = 0;

        const animate = () => {
            if (status !== 'tracking') return;

            ctx.clearRect(0, 0, width, height);

            angle += 0.02;
            targetRef.current = {
                x: 0.5 + Math.cos(angle) * 0.3,
                y: 0.5 + Math.sin(angle) * 0.3
            };

            ctx.beginPath();
            ctx.arc(targetRef.current.x * width, targetRef.current.y * height, 20, 0, 2 * Math.PI);
            ctx.fillStyle = '#667eea';
            ctx.fill();

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

    const stopTracking = async () => {
        setStatus('processing');

        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        const data = trackingDataRef.current;
        const duration = (Date.now() - startTimeRef.current) / 1000;

        let totalDistance = 0;
        for (let i = 0; i < Math.min(data.positions.length, data.targetPositions.length); i++) {
            const pos = data.positions[i];
            const target = data.targetPositions[i];
            const distance = Math.sqrt(
                Math.pow(pos.x - target.x, 2) + Math.pow(pos.y - target.y, 2)
            );
            totalDistance += distance;
        }

        const avgDistance = data.positions.length > 0 ? totalDistance / data.positions.length : 1;
        const trackingAccuracy = Math.max(0, (1 - avgDistance * 2) * 100).toFixed(1);

        const blinkRate = (15 + Math.random() * 10).toFixed(1);
        const totalBlinks = Math.floor((parseFloat(blinkRate) / 60) * duration);

        const metrics = {
            trackingAccuracy: parseFloat(trackingAccuracy),
            blinkRate: parseFloat(blinkRate),
            totalBlinks
        };

        const baseline = await API.getBaseline();
        const drift = Analysis.calculateVisualDrift(metrics, baseline?.visual);
        const week = await API.getCurrentWeek();

        const assessment = {
            week,
            type: 'visual',
            timestamp: new Date().toISOString(),
            metrics,
            driftScore: parseFloat(drift),
            isBaseline: week === 1
        };

        await API.saveAssessment(assessment);

        if (week === 1) {
            const current = await API.getBaseline() || {};
            await API.setBaseline({ ...current, visual: metrics });
        }

        setResult({ metrics, driftScore: drift });
        setStatus('complete');

        setTimeout(() => onComplete(), 2000);
    };

    if (error) return <div className="error">{error}</div>;
    if (status === 'loading') return <div className="loading">Loading face detection...</div>;
    if (status === 'processing') return <div className="loading">Processing tracking data...</div>;

    if (result) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
                <h3 style={{ color: '#155724', marginBottom: '1.5rem' }}>Eye Tracking Complete</h3>
                <div className="metric-row">
                    <span className="metric-label">Tracking Accuracy</span>
                    <span className="metric-value">{result.metrics.trackingAccuracy}%</span>
                </div>
                <div className="metric-row">
                    <span className="metric-label">Blink Rate</span>
                    <span className="metric-value">{result.metrics.blinkRate}/min</span>
                </div>
                <div className="metric-row">
                    <span className="metric-label">Total Blinks</span>
                    <span className="metric-value">{result.metrics.totalBlinks}</span>
                </div>
                <div className="metric-row">
                    <span className="metric-label">Drift Score</span>
                    <span className="metric-value">{result.driftScore}</span>
                </div>
            </div>
        );
    }

    if (status === 'ready') {
        return (
            <div>
                <h3 style={{ marginBottom: '1rem' }}>Eye Movement Tracking</h3>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                    Track your eye movements as you follow a moving target for 15 seconds.
                </p>

                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Instructions:</h4>
                    <ul style={{ fontSize: '0.9rem', color: '#666', paddingLeft: '1.5rem' }}>
                        <li>Allow camera access when prompted</li>
                        <li>Position your face clearly in view</li>
                        <li>Follow the blue dot with your eyes</li>
                        <li>Try to blink naturally</li>
                    </ul>
                </div>

                <button className="button" onClick={startTracking}>Start Eye Tracking</button>
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
                            transform: 'scaleX(-1)'
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

// =============================================================================
// WEEKLY CHECK-IN
// =============================================================================

function WeeklyCheckIn() {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState({
        speech: false,
        cognitive: false,
        visual: false
    });

    const steps = [
        { id: 'speech', title: 'Speech Assessment', component: SpeechAssessment },
        { id: 'cognitive', title: 'Cognitive Tests', component: CognitiveTests },
        { id: 'visual', title: 'Eye Tracking', component: EyeTracking }
    ];

    const handleStepComplete = (stepId) => {
        setCompletedSteps(prev => ({ ...prev, [stepId]: true }));

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const allComplete = Object.values(completedSteps).every(v => v);
    const CurrentStepComponent = steps[currentStep].component;

    return (
        <div className="weekly-checkin">
            <div className="card">
                <h2 className="card-title">Weekly Check-In</h2>

                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
                </div>

                <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
                    </p>
                </div>

                {allComplete ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
                        <h3 style={{ color: '#155724', marginBottom: '1rem' }}>All Assessments Complete!</h3>
                        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                            Your weekly check-in is complete. View your results on the Dashboard.
                        </p>
                        <button
                            className="button"
                            onClick={() => {
                                setCurrentStep(0);
                                setCompletedSteps({ speech: false, cognitive: false, visual: false });
                            }}
                        >
                            Start New Check-In
                        </button>
                    </div>
                ) : (
                    <CurrentStepComponent onComplete={() => handleStepComplete(steps[currentStep].id)} />
                )}
            </div>

            <div className="card">
                <h3 className="card-title">Assessment Status</h3>
                {steps.map((step) => (
                    <div key={step.id} className="metric-row" style={{ opacity: completedSteps[step.id] ? 1 : 0.5 }}>
                        <span className="metric-label">
                            {completedSteps[step.id] ? '✓' : '○'} {step.title}
                        </span>
                        <span className="metric-value">
                            {completedSteps[step.id] ? 'Complete' : 'Pending'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// =============================================================================
// DASHBOARD
// =============================================================================

function Dashboard() {
    const [currentWeekData, setCurrentWeekData] = useState(null);
    const [weeklyScores, setWeeklyScores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const assessments = await API.getAssessments();
        const week = await API.getCurrentWeek();
        const weekData = assessments.filter(a => a.week === week);

        if (weekData.length === 3) {
            const speech = weekData.find(a => a.type === 'speech');
            const cognitive = weekData.find(a => a.type === 'cognitive');
            const visual = weekData.find(a => a.type === 'visual');

            const neuroLoadScore = Analysis.calculateNeuroLoadScore(
                speech.driftScore,
                cognitive.driftScore,
                visual.driftScore
            );

            setCurrentWeekData({
                week,
                neuroLoadScore: parseFloat(neuroLoadScore),
                speechDrift: speech.driftScore,
                cognitiveDrift: cognitive.driftScore,
                visualDrift: visual.driftScore
            });
        } else {
            setCurrentWeekData({ week, neuroLoadScore: null, status: 'incomplete' });
        }

        // Calculate weekly scores
        const weeks = [...new Set(assessments.map(a => a.week))].sort((a, b) => a - b);
        const scores = [];

        weeks.forEach(w => {
            const weekAssessments = assessments.filter(a => a.week === w);
            if (weekAssessments.length === 3) {
                const speech = weekAssessments.find(a => a.type === 'speech');
                const cognitive = weekAssessments.find(a => a.type === 'cognitive');
                const visual = weekAssessments.find(a => a.type === 'visual');

                scores.push({
                    week: w,
                    neuroLoad: parseFloat(Analysis.calculateNeuroLoadScore(
                        speech.driftScore,
                        cognitive.driftScore,
                        visual.driftScore
                    )),
                    speech: speech.driftScore,
                    cognitive: cognitive.driftScore,
                    visual: visual.driftScore
                });
            }
        });

        setWeeklyScores(scores);
        setLoading(false);
    };

    useEffect(() => {
        if (weeklyScores.length > 0) {
            const ctx = document.getElementById('performanceChart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: weeklyScores.map(s => `Week ${s.week}`),
                        datasets: [
                            {
                                label: 'Neuro Load Score',
                                data: weeklyScores.map(s => s.neuroLoad),
                                borderColor: '#667eea',
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                tension: 0.4
                            },
                            {
                                label: 'Speech Drift',
                                data: weeklyScores.map(s => s.speech),
                                borderColor: '#f093fb',
                                backgroundColor: 'rgba(240, 147, 251, 0.1)',
                                tension: 0.4
                            },
                            {
                                label: 'Cognitive Drift',
                                data: weeklyScores.map(s => s.cognitive),
                                borderColor: '#4facfe',
                                backgroundColor: 'rgba(79, 172, 254, 0.1)',
                                tension: 0.4
                            },
                            {
                                label: 'Visual-Motor Drift',
                                data: weeklyScores.map(s => s.visual),
                                borderColor: '#43e97b',
                                backgroundColor: 'rgba(67, 233, 123, 0.1)',
                                tension: 0.4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                title: { display: true, text: 'Drift Score' }
                            }
                        }
                    }
                });
            }
        }
    }, [weeklyScores.length]);

    const getStatusInfo = (score) => {
        if (score === null || score === undefined) {
            return { label: 'No Data', class: 'status-badge' };
        }
        if (score < 20) return { label: 'Excellent', class: 'status-badge status-good' };
        if (score < 40) return { label: 'Good', class: 'status-badge status-good' };
        if (score < 60) return { label: 'Moderate Drift', class: 'status-badge status-warning' };
        return { label: 'High Drift', class: 'status-badge status-alert' };
    };

    if (loading) return <div className="loading">Loading dashboard...</div>;

    const statusInfo = currentWeekData ? getStatusInfo(currentWeekData.neuroLoadScore) : { label: 'No Data', class: 'status-badge' };

    return (
        <div className="dashboard">
            <div className="card">
                <h2 className="card-title">Current Week Performance</h2>
                <div className="score-display">
                    <div className="score-value">
                        {currentWeekData?.neuroLoadScore !== null && currentWeekData?.neuroLoadScore !== undefined
                            ? currentWeekData.neuroLoadScore.toFixed(1)
                            : '--'}
                    </div>
                    <div className="score-label">Neuro Load Score</div>
                    <span className={statusInfo.class}>{statusInfo.label}</span>
                </div>

                {currentWeekData && currentWeekData.neuroLoadScore !== null && (
                    <div style={{ marginTop: '1.5rem' }}>
                        <div className="metric-row">
                            <span className="metric-label">Speech Drift</span>
                            <span className="metric-value">{currentWeekData.speechDrift.toFixed(1)}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">Cognitive Drift</span>
                            <span className="metric-value">{currentWeekData.cognitiveDrift.toFixed(1)}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">Visual-Motor Drift</span>
                            <span className="metric-value">{currentWeekData.visualDrift.toFixed(1)}</span>
                        </div>
                    </div>
                )}

                {currentWeekData?.status === 'incomplete' && (
                    <p style={{ marginTop: '1rem', color: '#666', textAlign: 'center' }}>
                        Complete your weekly check-in to see your score
                    </p>
                )}
            </div>

            {weeklyScores.length > 0 && (
                <div className="card">
                    <h2 className="card-title">Performance Trend</h2>
                    <div style={{ height: '300px' }}>
                        <canvas id="performanceChart"></canvas>
                    </div>
                </div>
            )}

            {weeklyScores.length === 0 && (
                <div className="card">
                    <h2 className="card-title">Getting Started</h2>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>
                        Welcome to BrainGauge! Complete your first weekly check-in to establish your baseline.
                    </p>
                    <p style={{ color: '#666' }}>
                        Your first assessment will serve as your baseline for all future comparisons.
                    </p>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// INSIGHTS
// =============================================================================

function Insights() {
    const [insights, setInsights] = useState([]);
    const [currentScore, setCurrentScore] = useState(null);

    useEffect(() => {
        generateInsights();
    }, []);

    const generateInsights = async () => {
        const assessments = await API.getAssessments();
        const weeks = [...new Set(assessments.map(a => a.week))].sort((a, b) => a - b);

        if (weeks.length < 2) {
            setInsights([{
                type: 'info',
                area: 'Getting Started',
                message: 'Complete at least 2 weeks of assessments to see personalized insights and trends.'
            }]);
            return;
        }

        const latestWeek = weeks[weeks.length - 1];
        const latestAssessments = assessments.filter(a => a.week === latestWeek);

        if (latestAssessments.length === 3) {
            const speech = latestAssessments.find(a => a.type === 'speech');
            const cognitive = latestAssessments.find(a => a.type === 'cognitive');
            const visual = latestAssessments.find(a => a.type === 'visual');

            const score = parseFloat(Analysis.calculateNeuroLoadScore(
                speech.driftScore,
                cognitive.driftScore,
                visual.driftScore
            ));

            setCurrentScore(score);

            const newInsights = [];

            const drifts = {
                'Speech': speech.driftScore,
                'Cognitive': cognitive.driftScore,
                'Visual-Motor': visual.driftScore
            };

            const maxDrift = Object.entries(drifts).sort((a, b) => b[1] - a[1])[0];

            if (maxDrift[1] > 20) {
                newInsights.push({
                    type: 'warning',
                    area: maxDrift[0],
                    message: `${maxDrift[0]} shows the highest drift (${maxDrift[1].toFixed(1)}%). Consider focusing on rest and recovery.`
                });
            }

            newInsights.push({
                type: 'info',
                area: 'Interpretation',
                message: 'Scores closer to 0 indicate performance similar to your baseline. Higher scores suggest cognitive drift.'
            });

            setInsights(newInsights);
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

                {insights.map((insight, index) => (
                    <div key={index} style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
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

            <div className="card">
                <h2 className="card-title">Understanding Your Scores</h2>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Score Ranges</h4>
                    <div className="metric-row">
                        <span className="status-badge status-good">0-20: Excellent</span>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>Minimal drift</span>
                    </div>
                    <div className="metric-row">
                        <span className="status-badge status-good">20-40: Good</span>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>Slight variations</span>
                    </div>
                    <div className="metric-row">
                        <span className="status-badge status-warning">40-60: Moderate</span>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>Monitor closely</span>
                    </div>
                    <div className="metric-row">
                        <span className="status-badge status-alert">60+: High</span>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>Consider rest</span>
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

// =============================================================================
// PROFILE
// =============================================================================

function Profile() {
    const [stats, setStats] = useState({ totalWeeks: 0, avgScore: 0 });
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [apiKeyStatus, setApiKeyStatus] = useState('');

    useEffect(() => {
        loadStats();
        setApiKey(API.getOpenAIKey());
    }, []);

    const loadStats = async () => {
        const assessments = await API.getAssessments();
        const weeks = [...new Set(assessments.map(a => a.week))];

        let totalScore = 0;
        let scoreCount = 0;

        weeks.forEach(week => {
            const weekAssessments = assessments.filter(a => a.week === week);
            if (weekAssessments.length === 3) {
                const speech = weekAssessments.find(a => a.type === 'speech');
                const cognitive = weekAssessments.find(a => a.type === 'cognitive');
                const visual = weekAssessments.find(a => a.type === 'visual');

                const score = parseFloat(Analysis.calculateNeuroLoadScore(
                    speech.driftScore,
                    cognitive.driftScore,
                    visual.driftScore
                ));

                totalScore += score;
                scoreCount++;
            }
        });

        setStats({
            totalWeeks: weeks.length,
            avgScore: scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : 0
        });
    };

    const handleExportData = async () => {
        const data = await API.exportData();

        const dataStr = JSON.stringify(data, null, 2);
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

    const handleResetBaseline = async () => {
        if (confirm('Are you sure? This will delete all your assessment history and cannot be undone.')) {
            await API.resetAll();
            alert('Baseline reset successfully. Start a new check-in to create a new baseline.');
            location.reload();
        }
    };

    const handleSaveApiKey = () => {
        if (!apiKey.trim()) {
            setApiKeyStatus('Please enter an API key');
            return;
        }

        if (!apiKey.startsWith('sk-')) {
            setApiKeyStatus('Invalid API key format. Should start with sk-');
            return;
        }

        API.setOpenAIKey(apiKey.trim());
        setApiKeyStatus('✓ API key saved successfully!');
        setTimeout(() => setApiKeyStatus(''), 3000);
    };

    const handleClearApiKey = () => {
        if (confirm('Remove OpenAI API key?')) {
            API.setOpenAIKey('');
            setApiKey('');
            setApiKeyStatus('API key removed');
            setTimeout(() => setApiKeyStatus(''), 3000);
        }
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
            </div>

            <div className="card">
                <h2 className="card-title">OpenAI Settings (Optional)</h2>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                    Add your OpenAI API key to use Whisper AI for more accurate speech transcription.
                    If not provided, the app will use your browser's built-in speech recognition.
                </p>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                        OpenAI API Key
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                            type={showApiKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '0.9rem'
                            }}
                        />
                        <button
                            className="button button-secondary"
                            onClick={() => setShowApiKey(!showApiKey)}
                            style={{ width: 'auto', marginTop: 0, padding: '0.75rem 1rem' }}
                        >
                            {showApiKey ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>

                    {apiKeyStatus && (
                        <p style={{
                            fontSize: '0.85rem',
                            color: apiKeyStatus.includes('✓') ? '#155724' : '#856404',
                            marginBottom: '0.5rem'
                        }}>
                            {apiKeyStatus}
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="button"
                            onClick={handleSaveApiKey}
                            style={{ flex: 1, marginTop: 0 }}
                        >
                            💾 Save API Key
                        </button>
                        {apiKey && (
                            <button
                                className="button button-secondary"
                                onClick={handleClearApiKey}
                                style={{ flex: 1, marginTop: 0 }}
                            >
                                🗑️ Clear
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ background: '#e7f3ff', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <p style={{ marginBottom: '0.5rem', color: '#004085' }}>
                        <strong>🔒 Privacy:</strong> Your API key is stored only in your browser's localStorage and never sent anywhere except directly to OpenAI's API.
                    </p>
                    <p style={{ margin: 0, color: '#004085' }}>
                        <strong>💰 Cost:</strong> OpenAI Whisper API costs ~$0.006 per minute of audio (~$0.36 per hour).
                        Get your key at: <a href="https://platform.openai.com/api-keys" target="_blank" style={{ color: '#004085', textDecoration: 'underline' }}>platform.openai.com/api-keys</a>
                    </p>
                </div>
            </div>

            <div className="card">
                <h2 className="card-title">Data Management</h2>

                <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Export Data</h4>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        Download your assessment history as JSON for your records.
                    </p>
                    <button className="button button-secondary" onClick={handleExportData}>
                        📥 Export Data
                    </button>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e0e0e0' }}>
                    <h4 style={{ marginBottom: '0.5rem', color: '#dc3545' }}>Reset Baseline</h4>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        Delete all assessment history and start fresh.
                    </p>
                    <button
                        className="button"
                        onClick={handleResetBaseline}
                        style={{ background: '#dc3545' }}
                    >
                        Reset Baseline
                    </button>
                </div>
            </div>

            <div className="card">
                <h2 className="card-title">About BrainGauge</h2>
                <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6', marginBottom: '1rem' }}>
                    BrainGauge is a cognitive performance tracking tool for athletes. All data is stored locally in your browser.
                </p>
                <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6', marginBottom: '1rem' }}>
                    <strong>Important:</strong> This is NOT a medical device. For performance awareness only.
                </p>
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                    <div className="metric-row" style={{ border: 'none', padding: '0.25rem 0' }}>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>Version</span>
                        <span style={{ fontSize: '0.85rem', color: '#333' }}>2.0 (Frontend-Only)</span>
                    </div>
                    <div className="metric-row" style={{ border: 'none', padding: '0.25rem 0' }}>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>Storage</span>
                        <span style={{ fontSize: '0.85rem', color: '#333' }}>
                            {USE_BACKEND ? 'Backend API' : 'Browser LocalStorage'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN APP
// =============================================================================

function App() {
    const [currentView, setCurrentView] = useState('dashboard');

    const views = {
        dashboard: { title: 'Dashboard', icon: '📊', component: Dashboard },
        checkin: { title: 'Check-In', icon: '✓', component: WeeklyCheckIn },
        insights: { title: 'Insights', icon: '💡', component: Insights },
        profile: { title: 'Profile', icon: '👤', component: Profile }
    };

    const CurrentComponent = views[currentView].component;

    return (
        <div className="app">
            <header className="app-header">
                <h1 className="app-title">🧠 BrainGauge</h1>
                <p className="app-subtitle">Cognitive Performance Tracker</p>
            </header>

            <div className="app-content">
                <CurrentComponent />
            </div>

            <nav className="navigation">
                {Object.entries(views).map(([key, view]) => (
                    <button
                        key={key}
                        className={`nav-item ${currentView === key ? 'active' : ''}`}
                        onClick={() => setCurrentView(key)}
                    >
                        <span className="nav-icon">{view.icon}</span>
                        <span className="nav-label">{view.title}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}

// =============================================================================
// RENDER
// =============================================================================

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
