# 🤖 Adding AI to BrainGauge Frontend

You can add OpenAI Whisper AI directly to the frontend - **no backend required!**

---

## ✨ What You Get

### Without OpenAI (Default - FREE):
- ✅ Uses browser's Web Speech API
- ✅ Works in Chrome, Edge, Safari
- ✅ Free, no API key needed
- ⚠️ Less accurate than Whisper
- ⚠️ Requires internet connection

### With OpenAI Whisper (Optional - ~$0.36/hour):
- ✅ More accurate transcription
- ✅ Works with any audio quality
- ✅ Better handling of accents
- ✅ No browser limitations
- 💰 Costs ~$0.006 per minute of audio

---

## 🚀 How to Enable OpenAI Whisper

### Step 1: Get Your API Key

1. Go to: https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### Step 2: Add Key to BrainGauge

1. Open BrainGauge in your browser
2. Go to **Profile** tab (bottom navigation)
3. Scroll to **"OpenAI Settings (Optional)"**
4. Paste your API key
5. Click **"💾 Save API Key"**

### Step 3: Enable Whisper in Code

Open `braingauge/api.js` and change line 12:

```javascript
const USE_OPENAI_WHISPER = true; // Change from false to true
```

That's it! Now speech assessments will use OpenAI Whisper.

---

## 🔒 Security & Privacy

### Your API Key:
- ✅ Stored only in browser localStorage
- ✅ Never sent to any server (except OpenAI directly)
- ✅ You control it completely
- ✅ Can clear it anytime

### Audio Data:
- Sent directly from your browser to OpenAI API
- OpenAI processes and returns text
- OpenAI doesn't store your audio (per their policy)
- You control when recordings are made

---

## 💰 Cost Breakdown

OpenAI Whisper API pricing:
- **$0.006 per minute** of audio
- ~**$0.36 per hour** of audio

Typical BrainGauge usage:
- Speech assessment: 30-60 seconds
- Cost per assessment: **~$0.003 - $0.006**
- Weekly check-in: **~$0.006**
- Monthly (4 weeks): **~$0.024** (~2.4 cents)

**Very affordable for personal use!**

---

## 🎯 When to Use Each Option

### Use Web Speech API (default) if:
- ✅ You want it completely free
- ✅ You speak clearly in quiet environment
- ✅ You use Chrome/Edge/Safari
- ✅ You don't mind occasional errors

### Use OpenAI Whisper if:
- ✅ You want maximum accuracy
- ✅ You have background noise
- ✅ You have an accent
- ✅ Cost isn't a concern (~$0.006 per assessment)

---

## 🔧 Technical Details

### How It Works:

1. **Recording**: App records audio in browser (MediaRecorder API)
2. **Upload**: Audio sent directly to `https://api.openai.com/v1/audio/transcriptions`
3. **Process**: OpenAI Whisper transcribes audio
4. **Return**: Transcript sent back to browser
5. **Analysis**: App analyzes text locally (WPM, filler words, etc.)

### API Call:
```javascript
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
```

---

## ⚠️ Important Notes

### API Key Exposure:
- Your API key is visible in browser localStorage
- Anyone with access to your device can see it
- Use a separate key just for this app
- Set spending limits in OpenAI dashboard

### Browser Security:
- API calls go directly from browser to OpenAI
- CORS is enabled by OpenAI for browser requests
- Your key is NOT exposed in source code
- Each user provides their own key

### Rate Limits:
- OpenAI has rate limits per API key
- Default: 50 requests per minute
- BrainGauge uses 1 request per speech assessment
- More than enough for normal use

---

## 🔄 Switching Back

Want to go back to Web Speech API?

Change line 12 in `braingauge/api.js`:
```javascript
const USE_OPENAI_WHISPER = false; // Back to Web Speech API
```

Your saved API key stays in localStorage - you can switch back anytime!

---

## 📊 Comparison

| Feature | Web Speech API | OpenAI Whisper |
|---------|----------------|----------------|
| Cost | Free | ~$0.006/min |
| Accuracy | Good | Excellent |
| Setup | None | API key needed |
| Browser Support | Chrome/Edge/Safari | All browsers |
| Offline | No | No |
| Speed | Real-time | ~2-5 seconds |
| Background Noise | Struggles | Handles well |
| Accents | Can struggle | Handles well |

---

## 🐛 Troubleshooting

### "OpenAI API key not set"
- Go to Profile → OpenAI Settings
- Add your API key
- Click Save

### "Transcription failed"
- Check API key is correct (starts with `sk-`)
- Verify internet connection
- Check OpenAI dashboard for usage/limits
- Make sure audio is under 25MB

### "Invalid API key format"
- Key must start with `sk-`
- No spaces before/after key
- Copy complete key from OpenAI

### High costs
- Set spending limits in OpenAI dashboard
- Each assessment costs ~$0.006
- Monitor usage at platform.openai.com/usage

---

## ✅ Quick Setup Checklist

- [ ] Get OpenAI API key from platform.openai.com/api-keys
- [ ] Open BrainGauge Profile tab
- [ ] Paste API key in OpenAI Settings
- [ ] Click Save API Key
- [ ] Edit `braingauge/api.js` line 12: `USE_OPENAI_WHISPER = true`
- [ ] Refresh browser
- [ ] Test speech assessment
- [ ] Verify transcription works
- [ ] Set spending limit in OpenAI dashboard

---

## 💡 Best Practices

1. **Separate Key**: Create a dedicated API key just for BrainGauge
2. **Spending Limits**: Set $5-10/month limit in OpenAI dashboard
3. **Monitor Usage**: Check platform.openai.com/usage regularly
4. **Test First**: Try one assessment before committing
5. **Backup Key**: Save your key somewhere secure

---

## 🎯 Summary

**Frontend-only AI is possible!**

✅ No backend server needed
✅ User provides their own API key
✅ Secure (stored in browser only)
✅ Affordable (~$0.024/month for weekly checks)
✅ Easy to enable/disable

**Perfect for personal use!**

---

**Questions?** Check `braingauge/README.md` or the code in `api.js` lines 87-123.
