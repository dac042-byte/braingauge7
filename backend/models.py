from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, JSON
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)  # Single user for now
    week_number = Column(Integer)
    is_baseline = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Speech metrics
    speech_wpm = Column(Float, nullable=True)
    speech_filler_count = Column(Integer, nullable=True)
    speech_avg_pause = Column(Float, nullable=True)
    speech_drift_score = Column(Float, nullable=True)

    # Cognitive metrics
    reaction_time_avg = Column(Float, nullable=True)
    reaction_time_accuracy = Column(Float, nullable=True)
    working_memory_accuracy = Column(Float, nullable=True)
    working_memory_avg_time = Column(Float, nullable=True)
    cognitive_drift_score = Column(Float, nullable=True)

    # Visual metrics
    tracking_accuracy = Column(Float, nullable=True)
    blink_rate = Column(Float, nullable=True)
    visual_drift_score = Column(Float, nullable=True)

    # Combined score
    neuro_load_score = Column(Float, nullable=True)

    # Raw data storage
    raw_data = Column(JSON, nullable=True)

class Baseline(Base):
    __tablename__ = "baselines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)

    # Baseline metrics
    speech_wpm_baseline = Column(Float)
    speech_filler_baseline = Column(Float)
    speech_pause_baseline = Column(Float)

    reaction_time_baseline = Column(Float)
    reaction_accuracy_baseline = Column(Float)
    memory_accuracy_baseline = Column(Float)
    memory_time_baseline = Column(Float)

    tracking_accuracy_baseline = Column(Float)
    blink_rate_baseline = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)
