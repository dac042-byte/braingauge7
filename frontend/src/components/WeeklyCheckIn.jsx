import React, { useState } from 'react';
import SpeechAssessment from './SpeechAssessment';
import CognitiveTests from './CognitiveTests';
import EyeTracking from './EyeTracking';

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

    // Move to next step
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
          <div
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </p>
        </div>

        {allComplete ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
            <h3 style={{ color: '#155724', marginBottom: '1rem' }}>
              All Assessments Complete!
            </h3>
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
          <CurrentStepComponent
            onComplete={() => handleStepComplete(steps[currentStep].id)}
          />
        )}
      </div>

      <div className="card">
        <h3 className="card-title">Assessment Status</h3>
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="metric-row"
            style={{
              opacity: completedSteps[step.id] ? 1 : 0.5
            }}
          >
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

export default WeeklyCheckIn;
