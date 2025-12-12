import openai
import re
import numpy as np
from config import config

openai.api_key = config.OPENAI_API_KEY

# Sample reading passages for speech assessment
READING_PASSAGES = [
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet. Scientists often use this phrase to test keyboards and fonts. It has been used since the late nineteenth century.",
    "Climate change affects ecosystems worldwide. Rising temperatures impact wildlife habitats and migration patterns. Conservation efforts require global cooperation and sustainable practices. Every individual action contributes to environmental protection.",
    "Technology advances at an unprecedented pace. Artificial intelligence transforms industries and daily life. Innovation drives progress while raising ethical questions. Society must adapt to rapid technological change."
]

def transcribe_audio(audio_file_path: str) -> str:
    """Transcribe audio using OpenAI Whisper API"""
    try:
        with open(audio_file_path, "rb") as audio_file:
            transcript = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
        return transcript
    except Exception as e:
        raise Exception(f"Transcription failed: {str(e)}")

def analyze_speech(transcript: str, duration: float) -> dict:
    """Extract speech features from transcript"""

    # Word count and WPM
    words = transcript.split()
    word_count = len(words)
    wpm = (word_count / duration) * 60 if duration > 0 else 0

    # Filler words detection
    filler_words = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'sort of', 'kind of']
    filler_count = sum(transcript.lower().count(filler) for filler in filler_words)

    # Estimate pause length (simplified - based on sentence structure)
    sentences = re.split(r'[.!?]+', transcript)
    avg_sentence_length = np.mean([len(s.split()) for s in sentences if s.strip()])

    # Speech rate (syllables per second - approximated by word count * 1.5)
    estimated_syllables = word_count * 1.5
    speech_rate = estimated_syllables / duration if duration > 0 else 0

    # Pause estimation (inverse of speech fluency)
    expected_wpm = 150  # Average speaking rate
    pause_factor = max(0, (expected_wpm - wpm) / expected_wpm)
    avg_pause_length = pause_factor * 2  # Estimated in seconds

    return {
        "word_count": word_count,
        "wpm": round(wpm, 2),
        "filler_count": filler_count,
        "avg_pause_length": round(avg_pause_length, 2),
        "speech_rate": round(speech_rate, 2),
        "transcript": transcript
    }

def calculate_speech_drift(current_metrics: dict, baseline_metrics: dict) -> float:
    """Calculate speech drift score (0-100, higher = more drift)"""

    if not baseline_metrics:
        return 0.0  # No drift from baseline

    # Calculate percentage changes
    wpm_change = abs(current_metrics["wpm"] - baseline_metrics["wpm"]) / max(baseline_metrics["wpm"], 1)
    filler_change = abs(current_metrics["filler_count"] - baseline_metrics["filler_count"]) / max(baseline_metrics["filler_count"], 1)
    pause_change = abs(current_metrics["avg_pause_length"] - baseline_metrics["avg_pause_length"]) / max(baseline_metrics["avg_pause_length"], 0.5)

    # Weight the components
    drift = (wpm_change * 0.4 + filler_change * 0.3 + pause_change * 0.3) * 100

    # Cap at 100
    return min(round(drift, 2), 100.0)

def get_random_passage():
    """Get a random reading passage"""
    import random
    return random.choice(READING_PASSAGES)
