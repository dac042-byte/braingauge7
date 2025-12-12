import numpy as np

def analyze_eye_tracking(tracking_data: dict) -> dict:
    """Analyze eye tracking data from smooth pursuit test

    tracking_data should contain:
    - positions: list of {x, y, timestamp} of eye positions
    - target_positions: list of {x, y, timestamp} of target positions
    - blinks: list of timestamps when blinks detected
    - duration: total test duration
    """

    positions = tracking_data.get("positions", [])
    target_positions = tracking_data.get("target_positions", [])
    blinks = tracking_data.get("blinks", [])
    duration = tracking_data.get("duration", 1)

    # Calculate tracking accuracy (how close eye position was to target)
    if positions and target_positions:
        # Match positions by timestamp
        accuracy_scores = []
        for pos in positions:
            # Find closest target position in time
            target = min(target_positions,
                        key=lambda t: abs(t["timestamp"] - pos["timestamp"]))

            # Calculate distance
            distance = np.sqrt(
                (pos["x"] - target["x"])**2 +
                (pos["y"] - target["y"])**2
            )

            # Convert distance to accuracy (closer = better)
            # Assuming screen coordinates 0-1, perfect tracking = 0 distance
            accuracy = max(0, 100 - (distance * 100))
            accuracy_scores.append(accuracy)

        tracking_accuracy = np.mean(accuracy_scores)
    else:
        tracking_accuracy = 0

    # Calculate blink rate (blinks per minute)
    blink_rate = (len(blinks) / duration) * 60 if duration > 0 else 0

    return {
        "tracking_accuracy": round(tracking_accuracy, 2),
        "blink_rate": round(blink_rate, 2),
        "total_blinks": len(blinks),
        "duration": duration
    }

def calculate_visual_drift(current_metrics: dict, baseline_metrics: dict) -> float:
    """Calculate visual-motor drift score"""

    if not baseline_metrics:
        return 0.0

    # Tracking accuracy component (higher is better)
    ta_current = current_metrics.get("tracking_accuracy", 0)
    ta_baseline = baseline_metrics.get("tracking_accuracy_baseline", 1)
    ta_change = abs(ta_current - ta_baseline) / max(ta_baseline, 1)

    # Blink rate component (changes in either direction indicate drift)
    br_current = current_metrics.get("blink_rate", 0)
    br_baseline = baseline_metrics.get("blink_rate_baseline", 1)
    br_change = abs(br_current - br_baseline) / max(br_baseline, 1)

    # Weighted average
    drift = (ta_change * 0.6 + br_change * 0.4) * 100

    return min(round(drift, 2), 100.0)
