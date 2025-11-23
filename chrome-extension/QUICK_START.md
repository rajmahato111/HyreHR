# Quick Start Guide

## 5-Minute Setup

### Step 1: Install Extension (2 minutes)

1. Open Chrome and go to `chrome://extensions/`
2. Toggle "Developer mode" ON (top right)
3. Click "Load unpacked"
4. Navigate to and select the `chrome-extension` folder
5. Extension icon appears in toolbar ✓

### Step 2: Generate Icons (1 minute)

**Option A - Automatic:**
1. Open `chrome-extension/icons/generate-icons.html` in browser
2. Three PNG files download automatically
3. Move them to `chrome-extension/icons/` folder
4. Refresh extension at `chrome://extensions/`

**Option B - Skip for now:**
- Extension works without icons (just looks plain)
- Add icons later when needed

### Step 3: Configure (1 minute)

1. Click extension icon in toolbar
2. Click "Configure API URL"
3. Enter: `http://localhost:3000` (or your API URL)
4. Click "Save"

### Step 4: Login (1 minute)

1. Click extension icon
2. Click "Log In"
3. Log in to your recruiting platform
4. You're redirected back automatically

### Step 5: Use It! (30 seconds)

1. Go to any LinkedIn profile
2. Click the purple "Save to ATS" button (bottom right)
3. Review extracted data
4. (Optional) Select a job or talent pool
5. Click "Save Candidate"
6. Done! ✓

## Common Use Cases

### Save a Candidate
```
LinkedIn Profile → Click "Save to ATS" → Save Candidate
```

### Add to Job
```
LinkedIn Profile → Click "Save to ATS" → Select Job → Save Candidate
```

### Add to Talent Pool
```
LinkedIn Profile → Click "Save to ATS" → Select Pool → Save Candidate
```

### Add to Both
```
LinkedIn Profile → Click "Save to ATS" → Select Job + Pool → Save Candidate
```

## Troubleshooting

### "Please log in" message
→ Click "Log In" button and authenticate

### No floating button on LinkedIn
→ Refresh the page after installing extension

### "Could not extract profile data"
→ Make sure you're on a profile page (URL has `/in/`)

### API connection error
→ Check that backend is running at configured URL

## Tips

- **Pin the extension**: Right-click icon → "Pin" for easy access
- **Keyboard shortcut**: Set one at `chrome://extensions/shortcuts`
- **Bulk sourcing**: Open profiles in tabs, save each quickly
- **Check badge**: Green ✓ = logged in, Red ! = need to log in

## Need Help?

- Full docs: See `README.md`
- Installation: See `INSTALLATION.md`
- Backend setup: See main project docs

## What Gets Extracted?

✓ Name (first & last)
✓ Current title
✓ Current company
✓ Location
✓ Skills (all listed)
✓ Experience (5 most recent)
✓ Education (3 most recent)
✓ LinkedIn URL
✓ Email (if visible)
✓ Phone (if visible)

## Privacy

- Data goes directly to YOUR recruiting platform
- No third-party services
- GDPR consent checkbox included
- Source tracking for audit trail

---

**That's it!** You're ready to start sourcing candidates from LinkedIn. Happy recruiting! 🎉
