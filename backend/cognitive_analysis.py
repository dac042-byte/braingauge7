import numpy as np

def calculate_cognitive_drift(current_metrics: dict, baseline_metrics: dict) -> float:
    """Calculate cognitive drift score from reaction time and working memory tests"""

    if not baseline_metrics:
        return 0.0

    # Reaction time component (lower is better, so drift is when it increases)
    rt_current = current_metrics.get("reaction_time_avg", 0)
    rt_baseline = baseline_metrics.get("reaction_time_baseline", 1)
    rt_change = abs(rt_current - rt_baseline) / max(rt_baseline, 0.1)

    # Reaction accuracy component (higher is better, so drift is when it decreases)
    ra_current = current_metrics.get("reaction_time_accuracy", 100)
    ra_baseline = baseline_metrics.get("reaction_accuracy_baseline", 100)
    ra_change = abs(ra_current - ra_baseline) / max(ra_baseline, 1)

    # Working memory accuracy component
    ma_current = current_metrics.get("working_memory_accuracy", 100)
    ma_baseline = baseline_metrics.get("memory_accuracy_baseline", 100)
    ma_change = abs(ma_current - ma_baseline) / max(ma_baseline, 1)

    # Working memory time component
    mt_current = current_metrics.get("working_memory_avg_time", 0)
    mt_baseline = baseline_metrics.get("memory_time_baseline", 1)
    mt_change = abs(mt_current - mt_baseline) / max(mt_baseline, 0.1)

    # Weighted average
    drift = (rt_change * 0.3 + ra_change * 0.2 + ma_change * 0.3 + mt_change * 0.2) * 100

    return min(round(drift, 2), 100.0)

def analyze_reaction_time(trials: list) -> dict:
    """Analyze reaction time test results
    trials: list of {"correct": bool, "time": float}
    """
    if not trials:
        return {"avg_time": 0, "accuracy": 0}

    times = [t["time"] for t in trials if t["correct"]]
    accuracy = (sum(1 for t in trials if t["correct"]) / len(trials)) * 100
    avg_time = np.mean(times) if times else 0

    return {
        "avg_time": round(avg_time, 2),
        "accuracy": round(accuracy, 2),
        "trial_count": len(trials)
    }

def analyze_working_memory(trials: list) -> dict:
    """Analyze 2-back working memory test results
    trials: list of {"correct": bool, "time": float}
    """
    if not trials:
        return {"accuracy": 0, "avg_time": 0}

    correct_count = sum(1 for t in trials if t["correct"])
    accuracy = (correct_count / len(trials)) * 100

    times = [t["time"] for t in trials]
    avg_time = np.mean(times)

    return {
        "accuracy": round(accuracy, 2),
        "avg_time": round(avg_time, 2),
        "trial_count": len(trials)
    }
