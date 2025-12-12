# 🧠 BrainGauge - Frontend Only Version

**No backend, no API keys, no installation required!**

A completely self-contained, browser-based cognitive performance tracker. All data stored in your browser's localStorage.

---

## 🚀 Quick Start

### Option 1: Open Directly (Easiest)

1. Double-click `index.html` to open in your browser
2. Allow microphone and camera access when prompted
3. Start your first assessment!

### Option 2: Use a Local Server (Recommended for best performance)

```bash
# Using Python
cd frontend-standalone
python -m http.server 8080

# Using Node.js
npx serve

# Then open http://localhost:8080 in your browser
```

### Option 3: Deploy to GitHub Pages (Free hosting!)

1. Create a new GitHub repository
2. Upload `index.html` and `app.js`
3. Enable GitHub Pages in repository settings
4. Access your app from anywhere!

---

## ✨ What's Different from Full Version?

### ✅ Advantages
- **No backend server** - just open and use
- **No API keys needed** - uses browser's Web Speech API
- **No installation** - pure HTML/JavaScript
- **Completely free** - no API costs
- **100% private** - all data stays in your browser

### ⚠️ Limitations
- Uses Web Speech API instead of OpenAI Whisper
  - Works in Chrome, Edge, Safari
  - Requires internet connection for speech recognition
  - Slightly less accurate than Whisper
- Data stored in browser localStorage (not a database)
- No backend API for external integrations

---

## 🎯 Features

All core features included:

✅ **Speech Assessment**
- Browser-based speech recognition
- Words per minute tracking
- Filler word detection
- Speech drift scoring

✅ **Cognitive Tests**
- Reaction time test (10 trials)
- 2-back working memory test (20 trials)
- Accuracy and speed tracking
- Cognitive drift scoring

✅ **Eye Tracking**
- Webcam-based face detection
- Smooth pursuit tracking
- Blink rate estimation
- Visual-motor drift scoring

✅ **Dashboard**
- Real-time score display
- Historical trend graphs (Chart.js)
- Color-coded status indicators

✅ **Insights**
- Automated trend analysis
- Personalized recommendations
- Performance explanations

✅ **Profile**
- Export data to JSON
- Reset baseline
- Statistics tracking

---

## 🌐 Browser Compatibility

### Fully Supported:
- ✅ Chrome (desktop & mobile)
- ✅ Edge (desktop & mobile)
- ✅ Safari (desktop & iOS)

### Requirements:
- **Microphone** for speech assessment
- **Webcam** for eye tracking
- **JavaScript enabled**
- **LocalStorage enabled**

---

## 🔒 Privacy & Data

- **All data stored locally** in your browser's localStorage
- **No external servers** except:
  - Web Speech API (Google) for speech recognition
  - CDN for React/Chart.js libraries
- **Clear data anytime** with Reset Baseline button
- **Export your data** as JSON file

### To completely clear all data:
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Delete items starting with "braingauge_"

Or click **Reset Baseline** in the Profile tab.

---

## 📖 How to Use

### First Assessment (Baseline)

1. Click **Check-In** tab
2. Complete all 3 assessments:
   - **Speech**: Read passage aloud (20-60 sec)
   - **Cognitive**: Complete reaction + memory tests
   - **Eye Tracking**: Follow the moving dot (15 sec)
3. This establishes your baseline

### Weekly Assessments

- Complete check-in once per week
- View results on Dashboard
- Check Insights for trends
- Scores show drift from baseline

---

## 🐛 Troubleshooting

### Speech Recognition Not Working

**"Speech recognition not supported"**
- Use Chrome, Edge, or Safari
- Firefox doesn't support Web Speech API

**"No speech detected"**
- Speak clearly and loudly
- Check microphone permissions in browser
- Try chrome://settings/content/microphone

**Recognition stops too soon**
- Browser may have timeout
- Speak continuously without long pauses
- Keep recording under 60 seconds

### Camera Not Working

- Allow camera permissions when prompted
- Check no other app is using camera
- Try chrome://settings/content/camera
- Ensure good lighting for face detection

### Data Not Saving

- Check localStorage is enabled
- Don't use incognito/private mode
- Check browser storage quota

### Charts Not Showing

- Ensure Chart.js CDN is accessible
- Check internet connection
- Refresh the page

---

## 🔧 Customization

### Change Reading Passages

Edit `app.js` line 27:

```javascript
const READING_PASSAGES = [
    "Your custom passage here...",
    "Another passage...",
];
```

### Adjust Test Parameters

```javascript
// Reaction test trials (line ~517)
const REACTION_TRIALS = 10;

// Memory test trials (line ~518)
const NBACK_TRIALS = 20;

// Eye tracking duration (line ~677)
const TEST_DURATION = 15000; // milliseconds
```

### Change Drift Score Weights

In `AnalysisEngine.calculateNeuroLoadScore` (line ~155):

```javascript
return (
    parseFloat(speechDrift) * 0.35 +      // 35% weight
    parseFloat(cognitiveDrift) * 0.35 +   // 35% weight
    parseFloat(visualDrift) * 0.3         // 30% weight
).toFixed(1);
```

---

## 📱 Mobile Support

Works on mobile browsers with some limitations:

- **iOS Safari**: Full support (speech, camera, all features)
- **Android Chrome**: Full support
- **Mobile Firefox**: No speech recognition support

For best experience, use Chrome or Safari on mobile.

---

## 🚀 Deployment Options

### GitHub Pages (Free)

1. Create repository
2. Upload files
3. Settings → Pages → Deploy from main branch
4. Access at `https://yourusername.github.io/repo-name`

### Netlify Drop

1. Go to https://app.netlify.com/drop
2. Drag and drop the `frontend-standalone` folder
3. Get instant URL

### Vercel

```bash
npx vercel deploy
```

---

## 📊 Data Format

Export data is saved as JSON:

```json
{
  "assessments": [
    {
      "week": 1,
      "type": "speech",
      "timestamp": "2024-01-15T10:30:00Z",
      "metrics": {
        "wpm": 145.5,
        "fillerCount": 3,
        "avgPause": 1.2
      },
      "driftScore": 0,
      "isBaseline": true
    }
  ],
  "baseline": {
    "speech": { "wpm": 145.5, "fillerCount": 3, "avgPause": 1.2 },
    "cognitive": { "reactionTime": 350, "reactionAccuracy": 95 },
    "visual": { "trackingAccuracy": 85, "blinkRate": 18 }
  },
  "exportDate": "2024-01-15T10:35:00Z"
}
```

---

## ⚠️ Important Notes

1. **Not a medical device** - for performance tracking only
2. **Speech recognition requires internet** - Web Speech API uses Google servers
3. **Data persists in browser** - clearing browser data deletes assessments
4. **Backup your data** - export regularly
5. **Works offline** for cognitive and visual tests (not speech)

---

## 🎓 Adding Backend Later

Want to add the Python backend later?

The full-stack version with OpenAI Whisper and database is in:
- `backend/` folder - Python FastAPI server
- `frontend/` folder - React with npm

See main `README.md` and `STARTUP_GUIDE.md` for setup instructions.

---

## 💡 Tips for Best Results

### Speech Assessment
- Speak at normal pace
- Read clearly and naturally
- Avoid excessive pauses
- Record in quiet environment

### Cognitive Tests
- Complete when well-rested
- Minimize distractions
- React as quickly as possible
- Stay focused on memory test

### Eye Tracking
- Good lighting on face
- Keep head still
- Follow dot smoothly
- Blink naturally

---

## 📞 Support

Having issues?

1. Check this README's troubleshooting section
2. Open browser DevTools console (F12) for error messages
3. Ensure all browser permissions granted
4. Try different browser (Chrome recommended)

---

**Enjoy tracking your cognitive performance! 🧠💪**

*No servers, no costs, no complexity - just pure performance tracking.*
