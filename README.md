# 🧠 BrainGauge - Cognitive Performance Tracker

**Simple frontend-only version with easy backend integration when you're ready.**

---

## 📂 What's Inside

```
braingauge7/
└── braingauge/          ← Your app is here!
    ├── index.html       ← Main page (styles included)
    ├── api.js           ← Data layer (localStorage OR backend)
    ├── app.js           ← All React components
    └── README.md        ← Detailed documentation
```

---

## 🚀 Quick Start

```bash
cd braingauge
python -m http.server 8080
# Open: http://localhost:8080
```

**That's it!** No installation, no npm, no backend required.

---

## ✨ Current Setup

**Works right now with:**
- ✅ Browser's Web Speech API (speech recognition)
- ✅ localStorage (saves data in browser)
- ✅ TensorFlow.js (eye tracking)
- ✅ Chart.js (graphs)

**All features working:**
- Speech Assessment
- Cognitive Tests (reaction + memory)
- Eye Tracking
- Dashboard with graphs
- Insights and trends
- Data export

---

## 🔄 Adding Backend Later

When you're ready, change **ONE line** in `braingauge/api.js`:

```javascript
const USE_BACKEND = false; // Change to true
const BACKEND_URL = 'http://localhost:8000/api';
```

The app automatically switches to using your backend API. No other code changes needed!

---

## 📖 Documentation

See **`braingauge/README.md`** for:
- Detailed setup instructions
- How to customize
- Backend integration guide
- Deployment options
- Troubleshooting

---

## 🎯 Architecture

The `api.js` file provides a clean abstraction:

```javascript
// Same interface, different storage:
await API.saveAssessment(data);
await API.getAssessments();
await API.getBaseline();

// Routes to:
// - LocalStorage (if USE_BACKEND = false) ← Current
// - Backend API (if USE_BACKEND = true)   ← Future
```

---

## 🌐 Deploy Now (Optional)

### GitHub Pages
1. Enable Pages in repo Settings
2. Access at: `https://username.github.io/repo/braingauge/`

### Netlify
1. Go to https://app.netlify.com/drop
2. Drag `braingauge/` folder
3. Get instant URL

---

## 💡 Why This Design?

✅ **Start simple** - Works immediately without backend
✅ **Easy development** - Just 3 files, no build process
✅ **Backend-ready** - One line change when you need it
✅ **No refactoring** - Same components work with both
✅ **Clean code** - Modular and maintainable

---

## 📝 Next Steps

**Right now:**
1. `cd braingauge`
2. `python -m http.server 8080`
3. Open http://localhost:8080
4. Complete first check-in (establishes baseline)
5. Test all features!

**When you want backend:**
1. Build Python backend with required endpoints
2. Change `USE_BACKEND = true` in `api.js`
3. Done!

---

**Start with localStorage. Scale to backend when ready.** 🚀

See `braingauge/README.md` for complete documentation.
