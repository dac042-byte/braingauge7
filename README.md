# 🧠 BrainGauge

**Cognitive Performance Tracker for Athletes**

A web-based application that tracks cognitive changes in athletes through weekly assessments. **NOT a medical device** - purely for performance monitoring and trend awareness.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![React](https://img.shields.io/badge/react-18.2-blue)

---

## 🎯 Overview

BrainGauge helps athletes monitor their cognitive performance through three weekly assessment modules:

1. **Speech Analysis** - Track speaking patterns, fluency, and articulation
2. **Cognitive Tests** - Measure reaction time and working memory
3. **Eye Movement Tracking** - Monitor visual-motor coordination

All metrics are compared to your Week 1 baseline to calculate a **Neuro Load Score** that indicates cognitive drift over time.

---

## ✨ Features

### 📊 Three Assessment Modules

**Speech Assessment (20-60 seconds)**
- Read provided passages
- Analyzes: words/min, filler words, pause length
- Uses OpenAI Whisper API for transcription
- Calculates Speech Drift Score (0-100)

**Cognitive Tests**
- Reaction time test (tap on visual cue)
- 2-back working memory test
- Measures: speed + accuracy
- Calculates Cognitive Drift Score (0-100)

**Eye Tracking**
- Tracks smooth pursuit of moving dot
- Measures blink rate and tracking accuracy
- Uses webcam and TensorFlow.js BlazeFace
- Calculates Visual-Motor Drift Score (0-100)

### 📈 Scoring System

- Combines 3 drift scores → **Neuro Load Score** (weighted average)
- Week 1 = baseline for all metrics
- Higher score = greater drift from baseline
- Score ranges: 0-20 (Excellent), 20-40 (Good), 40-60 (Moderate), 60+ (High)

### 💻 User Interface

**Screens:**
- **Dashboard** - Line graph history, color-coded status, current scores
- **Weekly Check-In** - Complete all 3 assessments
- **Insights** - Trend analysis and personalized recommendations
- **Profile** - Reset baseline, export data, view stats

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))
- Modern browser with webcam/microphone

### Installation

1. **Clone or download this repository**

2. **Setup Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file with your OpenAI API key
echo "OPENAI_API_KEY=sk-your-key-here" > .env
```

3. **Setup Frontend**
```bash
cd frontend
npm install
```

4. **Run the Application**

Terminal 1 (Backend):
```bash
cd backend
source venv/bin/activate
python app.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

5. **Open browser to http://localhost:3000**

📖 **See [STARTUP_GUIDE.md](STARTUP_GUIDE.md) for detailed setup instructions and troubleshooting.**

---

## 🏗️ Technology Stack

**Frontend:**
- React 18.2 with React Router
- Chart.js for data visualization
- TensorFlow.js + BlazeFace for eye tracking
- MediaRecorder API for audio capture
- Axios for API communication

**Backend:**
- FastAPI (Python web framework)
- SQLAlchemy + SQLite database
- OpenAI Whisper API for speech-to-text
- NumPy/SciPy for analytics

---

## 📁 Project Structure

```
braingauge7/
├── backend/
│   ├── app.py                 # FastAPI application
│   ├── speech_analysis.py     # Whisper integration
│   ├── cognitive_analysis.py  # Cognitive metrics
│   ├── visual_analysis.py     # Eye tracking analysis
│   ├── models.py              # Database models
│   ├── database.py            # DB configuration
│   ├── config.py              # Settings & API keys
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── App.jsx           # Main app component
│   │   ├── api.js            # API client
│   │   └── App.css           # Styles
│   ├── public/
│   └── package.json          # Node dependencies
├── data/                     # SQLite DB (auto-created)
├── STARTUP_GUIDE.md         # Detailed setup guide
└── README.md                # This file
```

---

## 🎮 Usage

### First Assessment (Baseline)

1. Navigate to **Check-In** tab
2. Complete all 3 assessments:
   - Read passage aloud (20-60 sec)
   - Complete reaction time test (10 trials)
   - Complete 2-back memory test (20 trials)
   - Follow dot with eyes (15 sec)
3. This establishes your baseline

### Weekly Assessments

1. Complete check-in once per week
2. View results on **Dashboard**
3. Check **Insights** for trend analysis
4. Scores show drift from your baseline

### Data Management

- **Export Data**: Profile → Export Data (JSON format)
- **Reset Baseline**: Profile → Reset Baseline
- All data stored locally in SQLite

---

## 🔧 API Endpoints

Base URL: `http://localhost:8000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/passage` | Get random reading passage |
| POST | `/audio/upload` | Upload audio, get speech analysis |
| POST | `/cognitive/submit` | Submit cognitive test results |
| POST | `/visual/submit` | Submit eye tracking data |
| GET | `/score/weekly` | Get current week's score |
| GET | `/history` | Get all assessment history |
| GET | `/insights` | Get personalized insights |
| POST | `/baseline/reset` | Reset baseline and clear data |

---

## 🎯 Success Criteria

- ✅ Complete all 3 assessments in under 5 minutes
- ✅ Immediate score updates after completion
- ✅ Clear visual trends on dashboard
- ✅ Smooth UI, no crashes
- ✅ Works on Chrome, Firefox, Safari, Edge
- ✅ Clean, minimal design
- ✅ Performance awareness tone (not medical)

---

## ⚠️ Important Disclaimers

**This is NOT a medical device.**

BrainGauge is designed for:
- Performance awareness
- Trend monitoring
- Training optimization

**NOT for:**
- Medical diagnosis
- Concussion detection
- Clinical decision-making

**Always consult healthcare professionals for any health concerns.**

---

## 🔒 Privacy & Data

- All data stored locally on your machine
- Audio files sent to OpenAI Whisper API for transcription only
- No persistent storage on external servers
- Database location: `./data/braingauge.db`
- Delete `./data/` folder to remove all data

---

## 🐛 Troubleshooting

**Backend won't start:**
- Check Python version: `python --version` (need 3.8+)
- Verify virtual environment is activated
- Ensure `.env` file has valid OpenAI API key

**Frontend won't start:**
- Delete `node_modules` and run `npm install` again
- Check Node version: `node --version` (need 16+)
- Clear npm cache: `npm cache clean --force`

**Microphone/camera not working:**
- Allow permissions in browser settings
- Check no other app is using the device
- Refresh the page after granting permissions

**Slow transcription:**
- OpenAI Whisper takes 5-15 seconds (normal)
- Shorter recordings process faster
- Check internet connection

See [STARTUP_GUIDE.md](STARTUP_GUIDE.md) for detailed troubleshooting.

---

## 🛠️ Development

### Customize Reading Passages

Edit `backend/speech_analysis.py`:
```python
READING_PASSAGES = [
    "Your custom passage here...",
]
```

### Adjust Drift Weights

Edit `backend/config.py`:
```python
SPEECH_WEIGHT = 0.35
COGNITIVE_WEIGHT = 0.35
VISUAL_WEIGHT = 0.30
```

### Change Test Parameters

Edit component files in `frontend/src/components/`

---

## 📝 License

This project is provided as-is for educational and personal use.

---

## 🙏 Acknowledgments

- OpenAI Whisper API for speech-to-text
- TensorFlow.js and BlazeFace for face detection
- Chart.js for beautiful visualizations
- FastAPI for elegant Python APIs

---

## 📧 Support

For detailed setup help, see [STARTUP_GUIDE.md](STARTUP_GUIDE.md)

---

**Built with ❤️ for athletes who want to optimize their cognitive performance** 🧠💪
