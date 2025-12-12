import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    DATABASE_URL = "sqlite:///./data/braingauge.db"
    UPLOAD_DIR = "./data/uploads"

    # Scoring weights
    SPEECH_WEIGHT = 0.35
    COGNITIVE_WEIGHT = 0.35
    VISUAL_WEIGHT = 0.30

config = Config()
