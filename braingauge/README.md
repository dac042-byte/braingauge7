# 🧠 BrainGauge - Cognitive Performance Tracker

Clean, simple frontend-only version with **easy backend integration** when you're ready.

---

## 🚀 Quick Start (No Setup Required!)

### Option 1: Local Server (Recommended)
```bash
cd braingauge
python -m http.server 8080
# Open: http://localhost:8080
```

### Option 2: Deploy to GitHub Pages
1. Upload files to GitHub repo
2. Enable Pages in Settings
3. Access from anywhere!

### Option 3: Double-Click (Limited)
- Just open `index.html`
- ⚠️ Camera/mic won't work (browser security)
- ✅ Can test UI and navigation

---

## 📁 Files (Only 3!)

```
braingauge/
├── index.html    # Main page with styles
├── api.js        # Data layer (localStorage or backend)
└── app.js        # All React components
```

That's it! No build process, no npm, no complexity.

---

## ✨ Current Setup: Frontend-Only

**Right now it uses:**
- ✅ **Web Speech API** (browser speech recognition)
- ✅ **localStorage** (saves data in browser)
- ✅ **TensorFlow.js** (eye tracking)
- ✅ **Chart.js** (graphs)

**How to use:**
1. Open in browser
2. Allow camera/microphone
3. Complete first check-in (establishes baseline)
4. Do weekly check-ins
5. View trends on dashboard

---

## 🔄 Adding a Backend Later (Super Easy!)

When you're ready to add a Python backend with OpenAI Whisper:

### Step 1: Change ONE line in `api.js`

Find this at the top of `api.js`:
```javascript
const USE_BACKEND = false; // Change to true!
const BACKEND_URL = 'http://localhost:8000/api';
```

Change to:
```javascript
const USE_BACKEND = true; // ✓ Now using backend!
const BACKEND_URL = 'http://localhost:8000/api';
```

### Step 2: Create your backend

Your backend needs these endpoints:

```python
# FastAPI example
POST /api/audio/upload        # Upload audio for Whisper transcription
POST /api/cognitive/submit     # Save cognitive test results
POST /api/visual/submit        # Save eye tracking results
GET  /api/history              # Get all assessments
GET  /api/baseline             # Get baseline data
POST /api/baseline             # Set baseline
POST /api/baseline/reset       # Reset all data
GET  /api/passage              # Get reading passage
```

### Step 3: That's it!

The frontend automatically switches to using the backend. No other code changes needed!

---

## 🎯 Why This Architecture?

### Benefits:
✅ **Develop frontend first** without backend complexity
✅ **Test everything** before adding server
✅ **Easy to switch** between localStorage and backend
✅ **No refactoring** - same components work with both
✅ **Clean separation** - API layer abstracts storage

### The `api.js` abstraction layer:
```javascript
// Works the same way regardless of storage:
await API.saveAssessment(data);
await API.getAssessments();
await API.getBaseline();

// Internally routes to:
// - LocalStorage (if USE_BACKEND = false)
// - Backend API (if USE_BACKEND = true)
```

---

## 🔧 Customization

### Change Reading Passages

Edit `api.js` around line 82:
```javascript
this.PASSAGES = [
    "Your custom passage here...",
    "Another passage..."
];
```

### Adjust Test Parameters

Edit `app.js`:
```javascript
const REACTION_TRIALS = 10;    // Line ~377
const NBACK_TRIALS = 20;       // Line ~378
const TEST_DURATION = 15000;   // Line ~543 (eye tracking, in ms)
```

### Modify Drift Scoring Weights

Edit `api.js` around line 236:
```javascript
calculateNeuroLoadScore: (speechDrift, cognitiveDrift, visualDrift) => {
    return (
        parseFloat(speechDrift) * 0.35 +      // Speech weight
        parseFloat(cognitiveDrift) * 0.35 +   // Cognitive weight
        parseFloat(visualDrift) * 0.30        // Visual weight
    ).toFixed(1);
}
```

---

## 📊 Features

### Speech Assessment
- Web Speech API (built into Chrome/Edge/Safari)
- Words per minute tracking
- Filler word detection
- Pause estimation
- Drift scoring from baseline

### Cognitive Tests
- Reaction time test (10 trials)
- 2-back working memory test (20 trials)
- Speed and accuracy tracking
- Combined cognitive drift score

### Eye Tracking
- TensorFlow.js + BlazeFace face detection
- Smooth pursuit tracking
- Blink rate estimation
- Visual-motor drift score

### Dashboard
- Current week performance
- Historical trends (Chart.js)
- Color-coded status badges
- Individual drift scores

### Insights
- Automated trend analysis
- Personalized recommendations
- Score interpretation guide

### Profile
- Export data to JSON
- Reset baseline
- Statistics tracking

---

## 🌐 Browser Compatibility

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Speech Recognition | ✅ | ✅ | ✅ | ❌ |
| Eye Tracking | ✅ | ✅ | ✅ | ✅ |
| Cognitive Tests | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ✅ |

**For speech:** Use Chrome, Edge, or Safari
**Everything else:** Any modern browser

---

## 💾 Data Storage

### Current (localStorage):
- Stored in browser
- Persists after closing
- ~10MB limit
- Private (never leaves device)
- Can export to JSON

### With Backend:
- Stored in database
- Accessible from any device
- Unlimited storage
- Can integrate with other systems
- Better for multiple users

---

## 🚀 Deployment Options

### GitHub Pages (Free!)
1. Upload `braingauge/` folder to repo
2. Settings → Pages → Enable
3. Access at: `https://username.github.io/repo/braingauge/`

### Netlify Drop
1. Go to https://app.netlify.com/drop
2. Drag `braingauge/` folder
3. Get instant URL

### Your Own Server
```bash
# Copy files to web server
cp braingauge/* /var/www/html/braingauge/
# Access at: https://yourdomain.com/braingauge/
```

---

## 🔐 Privacy

**Frontend-only mode:**
- All data in browser localStorage
- Speech recognition uses Google's Web Speech API
- Eye tracking runs locally (TensorFlow.js)
- Export data to keep backups

**With backend:**
- You control the server
- You control the data
- OpenAI Whisper for speech (sent to OpenAI API)

---

## 🐛 Troubleshooting

### "Speech recognition not supported"
- Use Chrome, Edge, or Safari (not Firefox)
- Check you're on `http://localhost` or `https://`

### Camera not working
- Allow permissions in browser
- Close other apps using camera
- Try `https://` instead of `http://` (except localhost)

### Data not saving
- Check browser localStorage is enabled
- Not in incognito/private mode
- Check browser storage quota

### Charts not showing
- Check internet connection (Chart.js loads from CDN)
- Refresh page

---

## 📖 Development Workflow

### Phase 1: Frontend Development (Now)
```
✅ Open index.html
✅ Test all features with localStorage
✅ Customize as needed
✅ Deploy to GitHub Pages
```

### Phase 2: Backend Development (Later)
```
1. Build Python backend with FastAPI
2. Implement required endpoints
3. Change USE_BACKEND = true in api.js
4. Test with backend
5. Deploy both frontend and backend
```

### No refactoring needed between phases!

---

## 🎯 Example Backend Implementation

Here's what your backend needs to implement:

```python
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/audio/upload")
async def upload_audio(file: UploadFile = File(...)):
    # 1. Save audio file
    # 2. Transcribe with OpenAI Whisper
    # 3. Analyze speech (WPM, filler words, etc.)
    # 4. Calculate drift score
    # 5. Save to database
    # 6. Return results
    return {"metrics": {...}, "driftScore": 15.5}

@app.post("/api/cognitive/submit")
async def submit_cognitive(data: dict):
    # 1. Receive cognitive test results
    # 2. Calculate metrics
    # 3. Calculate drift score
    # 4. Save to database
    # 5. Return results
    return {"metrics": {...}, "driftScore": 12.3}

# ... implement other endpoints
```

Full backend implementation available in the main repo if needed!

---

## ✅ Current Status

- ✅ All 3 assessment modules working
- ✅ Dashboard with graphs
- ✅ Insights and trend analysis
- ✅ Data export
- ✅ Baseline management
- ✅ Ready for deployment
- ⏳ Backend integration (when you're ready)

---

## 📝 Next Steps

**For now:**
1. Test locally: `python -m http.server 8080`
2. Complete first check-in
3. Test all features
4. Deploy to GitHub Pages

**When ready for backend:**
1. Build backend with required endpoints
2. Change `USE_BACKEND = true` in `api.js`
3. Point `BACKEND_URL` to your server
4. Test integration
5. Deploy!

---

## 🙏 Support

Having issues?
1. Check browser console (F12) for errors
2. Verify you're using Chrome/Edge/Safari for speech
3. Check camera/microphone permissions
4. Try different browser
5. Check this README's troubleshooting section

---

**Built for simplicity. Ready for scale.** 🚀

*No backend? No problem. Need backend? One line change.*
