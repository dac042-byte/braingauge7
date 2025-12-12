from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import os
import shutil
from datetime import datetime

from database import get_db, init_db
from config import config
import models
import speech_analysis
import cognitive_analysis
import visual_analysis

app = FastAPI(title="BrainGauge API")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory
os.makedirs(config.UPLOAD_DIR, exist_ok=True)
os.makedirs("./data", exist_ok=True)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Pydantic models for requests
class CognitiveTestData(BaseModel):
    reaction_time_trials: List[dict]
    working_memory_trials: List[dict]

class EyeTrackingData(BaseModel):
    positions: List[dict]
    target_positions: List[dict]
    blinks: List[int]
    duration: float

class AssessmentResponse(BaseModel):
    week_number: int
    neuro_load_score: Optional[float]
    speech_drift: Optional[float]
    cognitive_drift: Optional[float]
    visual_drift: Optional[float]

# Helper functions
def get_or_create_baseline(db: Session) -> models.Baseline:
    """Get existing baseline or return None"""
    return db.query(models.Baseline).filter(models.Baseline.user_id == 1).first()

def get_current_week_number(db: Session) -> int:
    """Calculate current week number based on assessments"""
    count = db.query(models.Assessment).filter(models.Assessment.user_id == 1).count()
    return (count // 3) + 1  # 3 assessments per week

def calculate_neuro_load_score(speech_drift: float, cognitive_drift: float, visual_drift: float) -> float:
    """Calculate combined neuro load score"""
    score = (
        speech_drift * config.SPEECH_WEIGHT +
        cognitive_drift * config.COGNITIVE_WEIGHT +
        visual_drift * config.VISUAL_WEIGHT
    )
    return round(score, 2)

# Routes
@app.get("/")
def root():
    return {"message": "BrainGauge API is running", "version": "1.0"}

@app.get("/api/passage")
def get_passage():
    """Get a random reading passage for speech assessment"""
    return {"passage": speech_analysis.get_random_passage()}

@app.post("/api/audio/upload")
async def upload_audio(
    file: UploadFile = File(...),
    duration: float = 0,
    db: Session = Depends(get_db)
):
    """Upload audio, transcribe with Whisper, and analyze speech"""
    try:
        # Save uploaded file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = f"{config.UPLOAD_DIR}/audio_{timestamp}.wav"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Transcribe and analyze
        transcript = speech_analysis.transcribe_audio(file_path)
        metrics = speech_analysis.analyze_speech(transcript, duration)

        # Get baseline
        baseline = get_or_create_baseline(db)

        # Calculate drift if baseline exists
        if baseline:
            baseline_metrics = {
                "wpm": baseline.speech_wpm_baseline,
                "filler_count": baseline.speech_filler_baseline,
                "avg_pause_length": baseline.speech_pause_baseline
            }
            drift_score = speech_analysis.calculate_speech_drift(metrics, baseline_metrics)
        else:
            drift_score = 0.0

        # Save to database
        week_number = get_current_week_number(db)
        assessment = models.Assessment(
            user_id=1,
            week_number=week_number,
            is_baseline=(week_number == 1),
            speech_wpm=metrics["wpm"],
            speech_filler_count=metrics["filler_count"],
            speech_avg_pause=metrics["avg_pause_length"],
            speech_drift_score=drift_score
        )
        db.add(assessment)

        # Create baseline if this is week 1
        if week_number == 1 and not baseline:
            baseline = models.Baseline(
                user_id=1,
                speech_wpm_baseline=metrics["wpm"],
                speech_filler_baseline=float(metrics["filler_count"]),
                speech_pause_baseline=metrics["avg_pause_length"],
                reaction_time_baseline=0,
                reaction_accuracy_baseline=0,
                memory_accuracy_baseline=0,
                memory_time_baseline=0,
                tracking_accuracy_baseline=0,
                blink_rate_baseline=0
            )
            db.add(baseline)

        db.commit()

        return {
            "success": True,
            "metrics": metrics,
            "drift_score": drift_score,
            "week_number": week_number,
            "is_baseline": week_number == 1
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cognitive/submit")
def submit_cognitive(data: CognitiveTestData, db: Session = Depends(get_db)):
    """Process cognitive test results"""
    try:
        # Analyze results
        reaction_results = cognitive_analysis.analyze_reaction_time(data.reaction_time_trials)
        memory_results = cognitive_analysis.analyze_working_memory(data.working_memory_trials)

        # Get baseline
        baseline = get_or_create_baseline(db)
        week_number = get_current_week_number(db)

        # Calculate drift
        if baseline:
            baseline_metrics = {
                "reaction_time_baseline": baseline.reaction_time_baseline,
                "reaction_accuracy_baseline": baseline.reaction_accuracy_baseline,
                "memory_accuracy_baseline": baseline.memory_accuracy_baseline,
                "memory_time_baseline": baseline.memory_time_baseline
            }
            current_metrics = {
                "reaction_time_avg": reaction_results["avg_time"],
                "reaction_time_accuracy": reaction_results["accuracy"],
                "working_memory_accuracy": memory_results["accuracy"],
                "working_memory_avg_time": memory_results["avg_time"]
            }
            drift_score = cognitive_analysis.calculate_cognitive_drift(current_metrics, baseline_metrics)
        else:
            drift_score = 0.0

        # Find or create assessment
        assessment = db.query(models.Assessment).filter(
            models.Assessment.week_number == week_number,
            models.Assessment.user_id == 1
        ).first()

        if not assessment:
            assessment = models.Assessment(
                user_id=1,
                week_number=week_number,
                is_baseline=(week_number == 1)
            )
            db.add(assessment)

        # Update assessment
        assessment.reaction_time_avg = reaction_results["avg_time"]
        assessment.reaction_time_accuracy = reaction_results["accuracy"]
        assessment.working_memory_accuracy = memory_results["accuracy"]
        assessment.working_memory_avg_time = memory_results["avg_time"]
        assessment.cognitive_drift_score = drift_score

        # Update baseline if week 1
        if week_number == 1:
            if not baseline:
                baseline = models.Baseline(user_id=1)
                db.add(baseline)

            baseline.reaction_time_baseline = reaction_results["avg_time"]
            baseline.reaction_accuracy_baseline = reaction_results["accuracy"]
            baseline.memory_accuracy_baseline = memory_results["accuracy"]
            baseline.memory_time_baseline = memory_results["avg_time"]

        db.commit()

        return {
            "success": True,
            "drift_score": drift_score,
            "week_number": week_number,
            "reaction_results": reaction_results,
            "memory_results": memory_results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/visual/submit")
def submit_visual(data: EyeTrackingData, db: Session = Depends(get_db)):
    """Process eye tracking results"""
    try:
        # Analyze tracking data
        results = visual_analysis.analyze_eye_tracking(data.dict())

        # Get baseline
        baseline = get_or_create_baseline(db)
        week_number = get_current_week_number(db)

        # Calculate drift
        if baseline:
            baseline_metrics = {
                "tracking_accuracy_baseline": baseline.tracking_accuracy_baseline,
                "blink_rate_baseline": baseline.blink_rate_baseline
            }
            drift_score = visual_analysis.calculate_visual_drift(results, baseline_metrics)
        else:
            drift_score = 0.0

        # Find or create assessment
        assessment = db.query(models.Assessment).filter(
            models.Assessment.week_number == week_number,
            models.Assessment.user_id == 1
        ).first()

        if not assessment:
            assessment = models.Assessment(
                user_id=1,
                week_number=week_number,
                is_baseline=(week_number == 1)
            )
            db.add(assessment)

        # Update assessment
        assessment.tracking_accuracy = results["tracking_accuracy"]
        assessment.blink_rate = results["blink_rate"]
        assessment.visual_drift_score = drift_score

        # Calculate final neuro load score if all tests complete
        if assessment.speech_drift_score is not None and assessment.cognitive_drift_score is not None:
            assessment.neuro_load_score = calculate_neuro_load_score(
                assessment.speech_drift_score,
                assessment.cognitive_drift_score,
                drift_score
            )

        # Update baseline if week 1
        if week_number == 1:
            if not baseline:
                baseline = models.Baseline(user_id=1)
                db.add(baseline)

            baseline.tracking_accuracy_baseline = results["tracking_accuracy"]
            baseline.blink_rate_baseline = results["blink_rate"]

        db.commit()

        return {
            "success": True,
            "drift_score": drift_score,
            "week_number": week_number,
            "results": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/score/weekly")
def get_weekly_score(db: Session = Depends(get_db)):
    """Get current week's neuro load score"""
    week_number = get_current_week_number(db)

    assessment = db.query(models.Assessment).filter(
        models.Assessment.week_number == week_number,
        models.Assessment.user_id == 1
    ).first()

    if not assessment:
        return {
            "week_number": week_number,
            "neuro_load_score": None,
            "status": "incomplete"
        }

    return {
        "week_number": week_number,
        "neuro_load_score": assessment.neuro_load_score,
        "speech_drift": assessment.speech_drift_score,
        "cognitive_drift": assessment.cognitive_drift_score,
        "visual_drift": assessment.visual_drift_score,
        "status": "complete" if assessment.neuro_load_score else "in_progress"
    }

@app.get("/api/history")
def get_history(db: Session = Depends(get_db)):
    """Get all historical assessment data"""
    assessments = db.query(models.Assessment).filter(
        models.Assessment.user_id == 1
    ).order_by(models.Assessment.week_number).all()

    history = []
    for assessment in assessments:
        history.append({
            "week": assessment.week_number,
            "date": assessment.created_at.isoformat(),
            "neuro_load_score": assessment.neuro_load_score,
            "speech_drift": assessment.speech_drift_score,
            "cognitive_drift": assessment.cognitive_drift_score,
            "visual_drift": assessment.visual_drift_score,
            "is_baseline": assessment.is_baseline
        })

    return {"history": history}

@app.post("/api/baseline/reset")
def reset_baseline(db: Session = Depends(get_db)):
    """Reset baseline - clears all data and starts fresh"""
    try:
        db.query(models.Assessment).filter(models.Assessment.user_id == 1).delete()
        db.query(models.Baseline).filter(models.Baseline.user_id == 1).delete()
        db.commit()

        return {"success": True, "message": "Baseline reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/insights")
def get_insights(db: Session = Depends(get_db)):
    """Get insights about performance trends"""
    assessments = db.query(models.Assessment).filter(
        models.Assessment.user_id == 1,
        models.Assessment.neuro_load_score.isnot(None)
    ).order_by(models.Assessment.week_number).all()

    if len(assessments) < 2:
        return {
            "message": "Need at least 2 weeks of data for insights",
            "insights": []
        }

    latest = assessments[-1]

    insights = []

    # Identify biggest drift area
    drifts = {
        "Speech": latest.speech_drift_score or 0,
        "Cognitive": latest.cognitive_drift_score or 0,
        "Visual-Motor": latest.visual_drift_score or 0
    }

    max_drift_area = max(drifts.items(), key=lambda x: x[1])

    if max_drift_area[1] > 20:
        insights.append({
            "type": "warning",
            "area": max_drift_area[0],
            "message": f"{max_drift_area[0]} shows the highest drift ({max_drift_area[1]:.1f}%). Consider focusing on rest and recovery."
        })

    # Trend analysis
    if len(assessments) >= 3:
        recent_scores = [a.neuro_load_score for a in assessments[-3:]]
        if all(recent_scores[i] > recent_scores[i-1] for i in range(1, len(recent_scores))):
            insights.append({
                "type": "alert",
                "area": "Overall",
                "message": "Neuro Load Score has been increasing for 3 consecutive weeks. Consider reducing training intensity."
            })
        elif all(recent_scores[i] < recent_scores[i-1] for i in range(1, len(recent_scores))):
            insights.append({
                "type": "positive",
                "area": "Overall",
                "message": "Performance trending positively! Neuro Load Score decreasing consistently."
            })

    # Add explanations
    insights.append({
        "type": "info",
        "area": "Interpretation",
        "message": "Scores closer to 0 indicate performance similar to your baseline. Higher scores suggest cognitive drift."
    })

    return {"insights": insights, "current_score": latest.neuro_load_score}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
