// API Abstraction Layer
// Switch between localStorage (frontend-only) and backend API

// =============================================================================
// CONFIGURATION - Change this to switch between localStorage and backend
// =============================================================================

const USE_BACKEND = false; // Set to true when you add a backend
const BACKEND_URL = 'http://localhost:8000/api'; // Your backend URL

// AI Configuration (Frontend-only mode)
const USE_OPENAI_WHISPER = false; // Set to true to use OpenAI Whisper for speech
// Note: Requires user to provide API key in settings (stored in localStorage)

// =============================================================================
// DATA STORAGE INTERFACE
// =============================================================================

class DataAPI {
    constructor() {
        this.storage = USE_BACKEND ? new BackendStorage() : new LocalStorage();
    }

    // Assessment methods
    async saveAssessment(assessment) {
        return await this.storage.saveAssessment(assessment);
    }

    async getAssessments() {
        return await this.storage.getAssessments();
    }

    async getCurrentWeek() {
        const assessments = await this.getAssessments();
        return Math.floor(assessments.length / 3) + 1;
    }

    async getCurrentWeekData() {
        const week = await this.getCurrentWeek();
        const assessments = await this.getAssessments();
        return assessments.filter(a => a.week === week);
    }

    // Baseline methods
    async getBaseline() {
        return await this.storage.getBaseline();
    }

    async setBaseline(baseline) {
        return await this.storage.setBaseline(baseline);
    }

    // Utility methods
    async resetAll() {
        return await this.storage.resetAll();
    }

    async exportData() {
        return await this.storage.exportData();
    }

    // Speech-specific
    async getPassage() {
        return await this.storage.getPassage();
    }

    // OpenAI integration (Frontend-only)
    getOpenAIKey() {
        return this.storage.getOpenAIKey ? this.storage.getOpenAIKey() : '';
    }

    setOpenAIKey(key) {
        if (this.storage.setOpenAIKey) {
            this.storage.setOpenAIKey(key);
        }
    }

    async transcribeAudio(audioBlob) {
        if (this.storage.transcribeAudio) {
            return await this.storage.transcribeAudio(audioBlob);
        }
        throw new Error('Transcription not available');
    }
}

// =============================================================================
// LOCAL STORAGE IMPLEMENTATION (Frontend-Only)
// =============================================================================

class LocalStorage {
    constructor() {
        this.KEYS = {
            ASSESSMENTS: 'braingauge_assessments',
            BASELINE: 'braingauge_baseline',
            OPENAI_API_KEY: 'braingauge_openai_key'
        };

        this.PASSAGES = [
            "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet. Scientists often use this phrase to test keyboards and fonts. It has been used since the late nineteenth century.",
            "Climate change affects ecosystems worldwide. Rising temperatures impact wildlife habitats and migration patterns. Conservation efforts require global cooperation and sustainable practices. Every individual action contributes to environmental protection.",
            "Technology advances at an unprecedented pace. Artificial intelligence transforms industries and daily life. Innovation drives progress while raising ethical questions. Society must adapt to rapid technological change."
        ];
    }

    // OpenAI API Key management
    getOpenAIKey() {
        return localStorage.getItem(this.KEYS.OPENAI_API_KEY) || '';
    }

    setOpenAIKey(key) {
        localStorage.setItem(this.KEYS.OPENAI_API_KEY, key);
    }

    // Transcribe audio using OpenAI Whisper API
    async transcribeAudio(audioBlob) {
        const apiKey = this.getOpenAIKey();

        if (!apiKey) {
            throw new Error('OpenAI API key not set. Please add it in Settings.');
        }

        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', 'whisper-1');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Transcription failed');
        }

        const result = await response.json();
        return result.text;
    }

    async saveAssessment(assessment) {
        const assessments = await this.getAssessments();
        assessments.push(assessment);
        localStorage.setItem(this.KEYS.ASSESSMENTS, JSON.stringify(assessments));
        return assessment;
    }

    async getAssessments() {
        const data = localStorage.getItem(this.KEYS.ASSESSMENTS);
        return data ? JSON.parse(data) : [];
    }

    async getBaseline() {
        const data = localStorage.getItem(this.KEYS.BASELINE);
        return data ? JSON.parse(data) : null;
    }

    async setBaseline(baseline) {
        localStorage.setItem(this.KEYS.BASELINE, JSON.stringify(baseline));
        return baseline;
    }

    async resetAll() {
        localStorage.removeItem(this.KEYS.ASSESSMENTS);
        localStorage.removeItem(this.KEYS.BASELINE);
        return { success: true };
    }

    async exportData() {
        return {
            assessments: await this.getAssessments(),
            baseline: await this.getBaseline(),
            exportDate: new Date().toISOString()
        };
    }

    async getPassage() {
        const randomIndex = Math.floor(Math.random() * this.PASSAGES.length);
        return this.PASSAGES[randomIndex];
    }
}

// =============================================================================
// BACKEND API IMPLEMENTATION (For future use)
// =============================================================================

class BackendStorage {
    constructor() {
        this.baseURL = BACKEND_URL;
    }

    async saveAssessment(assessment) {
        const endpoint = assessment.type === 'speech' ? '/audio/upload' :
                        assessment.type === 'cognitive' ? '/cognitive/submit' :
                        '/visual/submit';

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assessment)
        });

        if (!response.ok) throw new Error('Failed to save assessment');
        return await response.json();
    }

    async getAssessments() {
        const response = await fetch(`${this.baseURL}/history`);
        if (!response.ok) throw new Error('Failed to get assessments');
        const data = await response.json();
        return data.history || [];
    }

    async getBaseline() {
        const response = await fetch(`${this.baseURL}/baseline`);
        if (!response.ok) return null;
        return await response.json();
    }

    async setBaseline(baseline) {
        const response = await fetch(`${this.baseURL}/baseline`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(baseline)
        });

        if (!response.ok) throw new Error('Failed to set baseline');
        return await response.json();
    }

    async resetAll() {
        const response = await fetch(`${this.baseURL}/baseline/reset`, {
            method: 'POST'
        });

        if (!response.ok) throw new Error('Failed to reset');
        return await response.json();
    }

    async exportData() {
        const assessments = await this.getAssessments();
        const baseline = await this.getBaseline();
        return {
            assessments,
            baseline,
            exportDate: new Date().toISOString()
        };
    }

    async getPassage() {
        const response = await fetch(`${this.baseURL}/passage`);
        if (!response.ok) throw new Error('Failed to get passage');
        const data = await response.json();
        return data.passage;
    }
}

// =============================================================================
// ANALYSIS ENGINE - Works with any storage
// =============================================================================

const AnalysisEngine = {
    analyzeSpeech: (transcript, duration) => {
        const words = transcript.trim().split(/\s+/);
        const wordCount = words.length;
        const wpm = duration > 0 ? (wordCount / duration) * 60 : 0;

        const fillerWords = ['um', 'uh', 'er', 'ah', 'like'];
        const fillerCount = words.filter(word =>
            fillerWords.includes(word.toLowerCase().replace(/[.,!?]/g, ''))
        ).length;

        const normalWpm = 150;
        const pauseFactor = Math.max(0, (normalWpm - wpm) / normalWpm);
        const avgPause = pauseFactor * 2;

        return { wpm: wpm.toFixed(1), fillerCount, avgPause: avgPause.toFixed(2), wordCount };
    },

    calculateSpeechDrift: (current, baseline) => {
        if (!baseline) return 0;

        const wpmChange = Math.abs(current.wpm - baseline.wpm) / Math.max(baseline.wpm, 1);
        const fillerChange = Math.abs(current.fillerCount - baseline.fillerCount) / Math.max(baseline.fillerCount, 1);
        const pauseChange = Math.abs(current.avgPause - baseline.avgPause) / Math.max(baseline.avgPause, 0.5);

        const drift = (wpmChange * 0.4 + fillerChange * 0.3 + pauseChange * 0.3) * 100;
        return Math.min(drift, 100).toFixed(1);
    },

    calculateCognitiveDrift: (current, baseline) => {
        if (!baseline) return 0;

        const rtChange = Math.abs(current.reactionTime - baseline.reactionTime) / Math.max(baseline.reactionTime, 0.1);
        const raChange = Math.abs(current.reactionAccuracy - baseline.reactionAccuracy) / Math.max(baseline.reactionAccuracy, 1);
        const maChange = Math.abs(current.memoryAccuracy - baseline.memoryAccuracy) / Math.max(baseline.memoryAccuracy, 1);
        const mtChange = Math.abs(current.memoryTime - baseline.memoryTime) / Math.max(baseline.memoryTime, 0.1);

        const drift = (rtChange * 0.3 + raChange * 0.2 + maChange * 0.3 + mtChange * 0.2) * 100;
        return Math.min(drift, 100).toFixed(1);
    },

    calculateVisualDrift: (current, baseline) => {
        if (!baseline) return 0;

        const taChange = Math.abs(current.trackingAccuracy - baseline.trackingAccuracy) / Math.max(baseline.trackingAccuracy, 1);
        const brChange = Math.abs(current.blinkRate - baseline.blinkRate) / Math.max(baseline.blinkRate, 1);

        const drift = (taChange * 0.6 + brChange * 0.4) * 100;
        return Math.min(drift, 100).toFixed(1);
    },

    calculateNeuroLoadScore: (speechDrift, cognitiveDrift, visualDrift) => {
        return ((parseFloat(speechDrift) * 0.35 + parseFloat(cognitiveDrift) * 0.35 + parseFloat(visualDrift) * 0.3)).toFixed(1);
    }
};

// =============================================================================
// EXPORT GLOBAL API
// =============================================================================

window.BrainGaugeAPI = new DataAPI();
window.AnalysisEngine = AnalysisEngine;

console.log(`BrainGauge API initialized (${USE_BACKEND ? 'Backend' : 'LocalStorage'} mode)`);
