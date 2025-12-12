# BrainGauge - Startup Guide

Complete setup and testing guide for the BrainGauge cognitive performance tracker.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Running the Application](#running-the-application)
5. [Testing the Full Flow](#testing-the-full-flow)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

### Browser Requirements
- Modern browser with webcam and microphone support
- Chrome, Firefox, Safari, or Edge (latest versions)

---

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Python Virtual Environment
```bash
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure OpenAI API Key

Create a `.env` file in the `backend` directory:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file
# On macOS/Linux
nano .env

# On Windows
notepad .env
```

Add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important:** Replace `sk-your-actual-api-key-here` with your actual OpenAI API key.

### 5. Test Backend Installation
```bash
python app.py
```

You should see output like:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Press `Ctrl+C` to stop the server for now.

---

## Frontend Setup

### 1. Navigate to Frontend Directory

Open a **new terminal window** and navigate to the frontend:

```bash
cd frontend
```

### 2. Install Node Dependencies
```bash
npm install
```

This will install:
- React and React Router
- Chart.js for data visualization
- TensorFlow.js and BlazeFace for eye tracking
- Axios for API communication
- All other dependencies

**Note:** Installation may take 2-5 minutes depending on your internet speed.

### 3. Verify Installation
```bash
npm list react react-dom
```

You should see the installed versions of React packages.

---

## Running the Application

You need **two terminal windows** running simultaneously.

### Terminal 1: Backend Server

```bash
cd backend
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate  # On Windows

python app.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal running.**

### Terminal 2: Frontend Development Server

```bash
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view braingauge-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**Your browser should automatically open to http://localhost:3000**

If it doesn't, manually open your browser and go to: **http://localhost:3000**

---

## Testing the Full Flow

### First Time Setup - Establishing Baseline

Your first weekly check-in will establish your baseline for all future comparisons.

#### Step 1: Navigate to Check-In
1. Open http://localhost:3000 in your browser
2. Click the "Check-In" tab at the bottom navigation

#### Step 2: Complete Speech Assessment

1. **Read the passage** displayed on screen
2. Click **"Start Recording"**
3. Allow microphone access when prompted
4. **Read the passage aloud** at your normal speaking pace
5. Speak for **20-60 seconds**
6. Click **"Stop Recording"**
7. Click **"Submit Recording"**

**Expected result:**
- Processing message appears
- Results show: Words per minute, filler words, drift score
- Automatically moves to next test

**Troubleshooting:**
- If microphone doesn't work, check browser permissions
- If processing fails, check that backend is running and OpenAI API key is valid

#### Step 3: Complete Cognitive Tests

##### Reaction Time Test (10 trials)
1. Wait for the green circle to appear
2. Click as **fast as possible** when you see it
3. Don't click early (false starts count against you)
4. Complete all 10 trials

##### 2-Back Memory Test (20 trials)
1. Watch letters appear one at a time
2. Click **"Match"** if current letter matches the one from 2 positions back
3. Click **"No Match"** if it doesn't match
4. Example: A → B → A (click Match on 3rd A, because it matches the A from 2 back)

**Expected result:**
- Results show reaction time, accuracy, memory accuracy, drift score
- Automatically moves to eye tracking

#### Step 4: Complete Eye Tracking

1. Click **"Start Eye Tracking"**
2. Allow camera access when prompted
3. **Position your face clearly** in the camera view
4. **Follow the blue dot with your eyes only** (don't move your head)
5. Test runs for **15 seconds** automatically
6. Try to blink naturally

**Expected result:**
- Video shows your face with tracking overlay
- Timer counts down from 15
- Results show tracking accuracy, blink rate, drift score
- "All Assessments Complete!" message appears

**Troubleshooting:**
- If camera doesn't work, check browser permissions
- Face detection requires good lighting
- Keep face clearly visible in frame

#### Step 5: View Dashboard

1. Click **"Dashboard"** tab
2. You should see:
   - Your Neuro Load Score (should be low/0 for baseline)
   - Individual drift scores for all three tests
   - Status badge (likely "Excellent" for baseline)

### Testing Subsequent Weeks

To test the drift detection:

#### Option 1: Simulate Different Performance
1. Complete another check-in with intentionally different performance:
   - Speech: Speak much faster or slower, add more "um" and "uh"
   - Reaction: Click more slowly or make mistakes
   - Eye tracking: Don't follow the dot as precisely

2. View dashboard to see increased drift scores

#### Option 2: Reset and Start Fresh
1. Go to **Profile** tab
2. Click **"Reset Baseline"**
3. Confirm reset
4. Start a new check-in to establish a new baseline

### Testing Data Visualization

After completing 2-3 assessments:

1. **Dashboard**: View the line graph showing trends over time
2. **Insights**: Check for personalized feedback and warnings
3. **Profile**: Export your data as JSON

---

## API Endpoints Reference

All endpoints are available at `http://localhost:8000/api/`

### Test Endpoints Manually

Using `curl` or tools like Postman:

```bash
# Get reading passage
curl http://localhost:8000/api/passage

# Get weekly score
curl http://localhost:8000/api/score/weekly

# Get history
curl http://localhost:8000/api/history

# Get insights
curl http://localhost:8000/api/insights
```

---

## Troubleshooting

### Backend Issues

#### "OpenAI API key not found"
- Check `.env` file exists in `backend/` directory
- Verify API key format starts with `sk-`
- Restart backend server after adding key

#### "Module not found" errors
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again
- Check Python version: `python --version` (should be 3.8+)

#### Port 8000 already in use
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process or use different port
# Edit app.py, change last line to:
# uvicorn.run(app, host="0.0.0.0", port=8001)
```

### Frontend Issues

#### "npm install" fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

#### Port 3000 already in use
- Frontend will automatically ask to use port 3001
- Press 'Y' to accept

#### "Failed to load dashboard data"
- Verify backend is running on port 8000
- Check browser console for CORS errors
- Ensure no firewall blocking localhost connections

### Browser Permission Issues

#### Microphone not working
1. Chrome: Settings → Privacy and Security → Site Settings → Microphone
2. Allow access for `localhost:3000`
3. Refresh the page

#### Camera not working
1. Chrome: Settings → Privacy and Security → Site Settings → Camera
2. Allow access for `localhost:3000`
3. Ensure no other application is using camera
4. Refresh the page

### Performance Issues

#### Slow transcription
- OpenAI Whisper API can take 5-15 seconds
- This is normal, be patient
- Shorter recordings process faster

#### Eye tracking laggy
- TensorFlow.js model loads on first use (takes 10-20 seconds)
- Close other browser tabs using camera
- Ensure good lighting for better face detection
- Lower quality webcam may affect performance

---

## Project Structure

```
braingauge7/
├── backend/
│   ├── app.py                 # Main FastAPI application
│   ├── config.py              # Configuration and API keys
│   ├── database.py            # Database setup
│   ├── models.py              # SQLAlchemy models
│   ├── speech_analysis.py     # Whisper API integration
│   ├── cognitive_analysis.py  # Cognitive drift calculations
│   ├── visual_analysis.py     # Eye tracking analysis
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # API keys (create this)
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── WeeklyCheckIn.jsx
│   │   │   ├── SpeechAssessment.jsx
│   │   │   ├── CognitiveTests.jsx
│   │   │   ├── EyeTracking.jsx
│   │   │   ├── Insights.jsx
│   │   │   └── Profile.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── api.js
│   │   └── index.js
│   └── package.json
├── data/                      # SQLite database (auto-created)
└── STARTUP_GUIDE.md          # This file
```

---

## Features Summary

### ✅ Completed Features

**Speech Assessment**
- Audio recording with MediaRecorder API
- OpenAI Whisper transcription
- Words per minute calculation
- Filler word detection
- Pause length estimation
- Drift score from baseline

**Cognitive Tests**
- Reaction time test (10 trials)
- 2-back working memory test (20 trials)
- Accuracy and speed tracking
- Drift score calculation

**Eye Tracking**
- Webcam-based face detection
- Smooth pursuit tracking
- Blink rate measurement
- Tracking accuracy scoring
- Visual-motor drift calculation

**Dashboard**
- Current week performance summary
- Multi-line graph of all metrics over time
- Color-coded status badges
- Individual drift scores

**Insights**
- Automated trend detection
- Personalized warnings
- Performance explanations
- Score interpretation guide

**Profile**
- Assessment statistics
- Data export (JSON format)
- Baseline reset functionality

**Backend**
- RESTful API with FastAPI
- SQLite database storage
- Baseline tracking
- Drift score algorithms
- Full CORS support

---

## Success Criteria Checklist

- ✅ User completes all 3 assessments in under 5 minutes
- ✅ Score updates immediately after completion
- ✅ Dashboard shows clear visual trends
- ✅ Works on both desktop Chrome and Firefox
- ✅ Clean, minimal UI like modern fitness tracker
- ✅ Performance awareness tone (not medical)
- ✅ Data stored locally in SQLite
- ✅ Backend calculates all drift scores
- ✅ Smooth UI with no crashes in testing

---

## Development Tips

### Adding New Reading Passages

Edit `backend/speech_analysis.py`:

```python
READING_PASSAGES = [
    "Your new passage here...",
    # Add more passages
]
```

### Adjusting Drift Score Weights

Edit `backend/config.py`:

```python
SPEECH_WEIGHT = 0.35      # Default
COGNITIVE_WEIGHT = 0.35   # Default
VISUAL_WEIGHT = 0.30      # Default
```

### Changing Test Parameters

Edit `frontend/src/components/CognitiveTests.jsx`:

```javascript
const REACTION_TRIALS = 10;  // Change number of trials
const NBACK_TRIALS = 20;     // Change memory test length
```

Edit `frontend/src/components/EyeTracking.jsx`:

```javascript
const TEST_DURATION = 15000;  // Duration in milliseconds
```

---

## Data Privacy

- All data stored locally on your machine
- No data sent to external servers except:
  - Audio files to OpenAI Whisper API for transcription
  - Transcriptions are not stored by OpenAI (per their API policy)
- Database location: `./data/braingauge.db`
- Upload files: `./data/uploads/`

To completely reset all data:
```bash
rm -rf data/
```

---

## Next Steps

1. **Customize**: Adjust reading passages, test parameters, or styling
2. **Deploy**: Consider deploying to a web server for remote access
3. **Extend**: Add more assessment types or metrics
4. **Integrate**: Connect with training logs or other athlete tracking tools

---

## Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review browser console for error messages
3. Check backend terminal for API errors
4. Verify all prerequisites are installed correctly

---

**Congratulations!** You now have a fully functional cognitive performance tracker. Start monitoring your cognitive performance week by week! 🧠✨
