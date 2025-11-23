# Chrome Extension Installation Guide

## Quick Start

### 1. Generate Icons (First Time Only)

The extension needs icon files to work properly. Generate them using one of these methods:

#### Option A: Using the HTML Generator (Easiest)
1. Open `chrome-extension/icons/generate-icons.html` in your browser
2. Three PNG files will automatically download (icon16.png, icon48.png, icon128.png)
3. Move the downloaded files to the `chrome-extension/icons/` directory

#### Option B: Create Placeholder Icons Manually
If you just want to test quickly, create simple colored PNG files:
- Create three PNG files (16x16, 48x48, 128x128 pixels)
- Fill them with any color (purple #667eea recommended)
- Name them icon16.png, icon48.png, icon128.png
- Place them in `chrome-extension/icons/`

### 2. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top right
3. Click "Load unpacked"
4. Select the `chrome-extension` directory from your project
5. The extension should now appear in your extensions list

### 3. Configure the Extension

1. Click the extension icon in your Chrome toolbar (you may need to pin it first)
2. Click "Configure API URL"
3. Enter your backend API URL:
   - Development: `http://localhost:3000`
   - Production: Your production API URL
4. Click "Save"

### 4. Authenticate

1. Click the extension icon again
2. Click "Log In"
3. You'll be redirected to your recruiting platform login page
4. Log in with your credentials
5. After successful login, you'll be redirected back

### 5. Start Using

1. Navigate to any LinkedIn profile (e.g., `https://www.linkedin.com/in/someone`)
2. You'll see a floating "Save to ATS" button in the bottom right
3. Click it to save the candidate to your recruiting platform

## Troubleshooting

### Extension Won't Load

**Error: "Manifest file is missing or unreadable"**
- Make sure you selected the `chrome-extension` directory, not a parent directory
- Verify `manifest.json` exists in the directory

**Error: "Could not load icon"**
- Generate the icon files using the steps above
- Make sure icon files are in `chrome-extension/icons/`

### Extension Loads But Doesn't Work

**Floating button doesn't appear on LinkedIn**
- Refresh the LinkedIn page after installing the extension
- Make sure you're on a profile page (`/in/` in the URL)
- Check the browser console for errors (F12)

**Can't save candidates**
- Verify you're logged in (click the extension icon to check)
- Verify the API URL is correct in settings
- Make sure your backend is running
- Check the browser console for API errors

### Authentication Issues

**Login page doesn't open**
- Check that the API URL is correct
- Verify your backend is running and accessible

**Login succeeds but extension still shows "Please log in"**
- The backend needs to redirect to a URL with the token parameter
- Check that your auth flow returns: `?token=<jwt_token>`

### Data Extraction Issues

**No data extracted from LinkedIn profile**
- LinkedIn frequently changes their HTML structure
- Check the browser console for errors
- The content script may need updates to match LinkedIn's current structure

## Backend Requirements

Your backend must support these features for the extension to work:

### 1. CORS Configuration

Allow requests from Chrome extensions:

```javascript
// Express.js example
const cors = require('cors');

app.use(cors({
  origin: [
    'chrome-extension://*',
    /^chrome-extension:\/\//,
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### 2. Authentication Endpoint

The login flow should redirect back with a token:

```
GET /auth/login?extension=true
→ User logs in
→ Redirect to: chrome-extension://<extension-id>/popup.html?token=<jwt_token>
```

Or use a simpler approach with a callback page:

```javascript
// After successful login
if (req.query.extension === 'true') {
  res.send(`
    <script>
      window.opener.postMessage({ 
        type: 'auth_success', 
        token: '${token}' 
      }, '*');
      window.close();
    </script>
  `);
}
```

### 3. Required API Endpoints

Implement these endpoints:

```
POST /api/v1/candidates
POST /api/v1/applications
POST /api/v1/talent-pools/:id/candidates
GET  /api/v1/jobs?status=open
GET  /api/v1/talent-pools
```

See the main README for detailed endpoint specifications.

## Development Tips

### Debugging

**Popup Script:**
- Right-click extension icon → "Inspect popup"
- Console logs will appear in the popup DevTools

**Content Script:**
- Open DevTools on any LinkedIn page (F12)
- Console logs from content.js will appear here

**Background Script:**
- Go to `chrome://extensions/`
- Find your extension
- Click "Inspect views: service worker"

### Hot Reload

Chrome doesn't automatically reload extensions when you make changes:

1. Make your code changes
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Reload any LinkedIn pages you have open

### Testing

1. Test on various LinkedIn profiles (different layouts, languages)
2. Test with and without authentication
3. Test adding to jobs and talent pools
4. Test error scenarios (network failures, invalid data)

## Security Notes

### Data Privacy

- All data goes directly to your backend
- No third-party services are used
- Tokens are stored in Chrome's secure local storage
- Extension only runs on LinkedIn.com

### Permissions

The extension requests minimal permissions:
- `activeTab`: Read current tab (only when clicked)
- `storage`: Store API URL and auth token
- `scripting`: Inject floating button
- `host_permissions`: Access LinkedIn and your API

### Best Practices

1. Always use HTTPS in production
2. Implement proper CORS restrictions
3. Use short-lived JWT tokens
4. Validate all data on the backend
5. Implement rate limiting on API endpoints

## Next Steps

After installation:

1. Test the extension on a few LinkedIn profiles
2. Verify candidates are being created correctly
3. Check that job applications are working
4. Test talent pool additions
5. Review the data quality and adjust as needed

## Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Review the browser console for errors
3. Check the backend logs
4. Verify API endpoints are working (use Postman/curl)
5. Review the main README.md for API specifications

## Updating the Extension

When you make changes:

1. Edit the code files
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Test your changes

For version updates:
1. Update the `version` in `manifest.json`
2. Reload the extension
3. Chrome will show the new version number
