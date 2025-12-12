# 🚀 Deploy BrainGauge to GitHub Pages

## Quick Setup (5 minutes)

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/dac042-byte/braingauge7
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **claude/cognitive-performance-tracker-01Xvx1GagBNAnLQXWmyFPqNU**
   - Folder: **/ (root)**
5. Click **Save**
6. Wait 1-2 minutes for deployment

### Step 2: Your App URL

Your app will be live at:
```
https://dac042-byte.github.io/braingauge7/frontend-standalone/
```

### Step 3: Link From Your Website

Add this link anywhere on your existing website:

```html
<a href="https://dac042-byte.github.io/braingauge7/frontend-standalone/">
    🧠 Launch BrainGauge
</a>
```

Or as a button:

```html
<button onclick="window.open('https://dac042-byte.github.io/braingauge7/frontend-standalone/', '_blank')">
    🧠 Open BrainGauge
</button>
```

---

## ✨ Offline Support (PWA)

The app now includes a Service Worker that:

- ✅ **Caches all resources** on first visit
- ✅ **Works offline** after loading once
- ✅ **Can be installed** as a standalone app (Add to Home Screen)
- ✅ **Faster loading** on repeat visits

### How Users Can Install It:

**On Desktop (Chrome/Edge):**
1. Visit the site
2. Look for install icon (⊕) in address bar
3. Click "Install BrainGauge"
4. App opens in its own window

**On Mobile (iOS/Android):**
1. Open in Safari (iOS) or Chrome (Android)
2. Tap Share button
3. Tap "Add to Home Screen"
4. Opens like a native app!

### What Works Offline:

- ✅ Dashboard and all navigation
- ✅ Cognitive tests (reaction time, memory)
- ✅ Eye tracking (if camera available)
- ✅ Data viewing and export
- ⚠️ Speech recognition (needs internet - uses Google's API)

---

## 🌐 Alternative: Custom Domain

Want to use your own domain?

1. Add file `CNAME` in repo root with your domain:
   ```
   braingauge.yourdomain.com
   ```

2. In your DNS provider, add CNAME record:
   ```
   braingauge  →  dac042-byte.github.io
   ```

3. Access at: `https://braingauge.yourdomain.com/frontend-standalone/`

---

## 🔧 Testing Before Deployment

Test locally first:

```bash
cd frontend-standalone
python -m http.server 8080
# Open http://localhost:8080
```

Test service worker:
1. Open Chrome DevTools (F12)
2. Go to Application → Service Workers
3. Should see "activated and running"

Test offline mode:
1. Load the app
2. DevTools → Network → Check "Offline"
3. Refresh page - should still work!

---

## 📱 Share Options

Once deployed, share via:

### Direct Link:
```
https://dac042-byte.github.io/braingauge7/frontend-standalone/
```

### QR Code:
Generate QR code pointing to your URL so people can scan with phone

### Embedded iFrame:
```html
<iframe
    src="https://dac042-byte.github.io/braingauge7/frontend-standalone/"
    width="100%"
    height="800px"
    style="border: none; border-radius: 12px;">
</iframe>
```

---

## 🐛 Troubleshooting

### "404 - Page not found"
- Wait 2-3 minutes after enabling Pages
- Check branch name is correct
- Verify folder is set to `/ (root)`

### Service Worker not working
- Must be on `https://` or `localhost`
- Check DevTools console for errors
- Clear cache and hard reload (Ctrl+Shift+R)

### Can't access camera/mic
- Only works on `https://` (GitHub Pages provides this)
- User must grant permissions
- Won't work on `http://` (except localhost)

---

## 🎯 What Your Users Need

To use the app, users only need:
- ✅ Modern browser (Chrome, Safari, Edge, Firefox)
- ✅ Internet (first visit only to load)
- ✅ Camera permission (for eye tracking)
- ✅ Microphone permission (for speech)

After first visit, works mostly offline! (except speech recognition)

---

## 🔄 Updating the App

When you make changes:

1. Edit files locally
2. Commit and push:
   ```bash
   git add frontend-standalone/
   git commit -m "Update BrainGauge"
   git push
   ```
3. GitHub Pages auto-updates in 1-2 minutes
4. Users see changes on next visit

To force update for users:
- They can hard refresh (Ctrl+Shift+R)
- Or you can change service worker version in `service-worker.js`

---

## ✅ Deployment Checklist

- [ ] Pushed all files to GitHub
- [ ] Enabled GitHub Pages in Settings
- [ ] Waited 2 minutes for deployment
- [ ] Tested URL works
- [ ] Tested camera/microphone permissions
- [ ] Tested service worker (DevTools → Application)
- [ ] Tested offline mode
- [ ] Added link to your main website
- [ ] Shared URL with users

---

**Your app is now live and accessible from anywhere!** 🎉

Users can visit the link from any device and it will work!
