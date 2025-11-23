# Recruiting Platform Chrome Extension

A Chrome extension for sourcing candidates from LinkedIn and saving them directly to your recruiting platform.

## Features

- **One-Click Save**: Save LinkedIn profiles to your ATS with a single click
- **Auto-Extract Data**: Automatically extract candidate information including:
  - Name, title, and company
  - Location and contact information
  - Skills and experience
  - Education history
- **Add to Jobs**: Instantly create applications for open positions
- **Add to Talent Pools**: Build your talent pipeline for future opportunities
- **GDPR Compliant**: Built-in consent management

## Installation

### Development Installation

1. Clone the repository and navigate to the chrome-extension directory:
   ```bash
   cd chrome-extension
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the `chrome-extension` directory

5. The extension icon should appear in your Chrome toolbar

### Production Installation

The extension will be available on the Chrome Web Store once published.

## Setup

### 1. Configure API URL

1. Click the extension icon in your Chrome toolbar
2. Click "Configure API URL"
3. Enter your API URL (default: `http://localhost:3000`)
4. Click "Save"

### 2. Authenticate

1. Click the extension icon
2. Click "Log In"
3. You'll be redirected to your recruiting platform login page
4. Log in with your credentials
5. You'll be automatically redirected back

## Usage

### Saving a Candidate from LinkedIn

1. Navigate to any LinkedIn profile page
2. Click the floating "Save to ATS" button (bottom right) or click the extension icon
3. Review the extracted candidate information
4. (Optional) Select a job to create an application
5. (Optional) Select a talent pool to add the candidate
6. Ensure GDPR consent checkbox is checked if applicable
7. Click "Save Candidate"

### Extracted Data

The extension automatically extracts:

- **Basic Information**: First name, last name, location
- **Professional Details**: Current title, current company
- **Contact Information**: Email (if visible), phone (if visible)
- **Skills**: All listed skills from the profile
- **Experience**: Up to 5 most recent positions
- **Education**: Up to 3 most recent education entries
- **LinkedIn URL**: Direct link to the profile

### Adding to Jobs

When saving a candidate, you can optionally select an open job position. This will:
- Create a candidate record
- Create an application for the selected job
- Place the candidate in the first stage of the job's pipeline

### Adding to Talent Pools

You can also add candidates to talent pools for future opportunities:
- Select a talent pool from the dropdown
- The candidate will be added to the pool after being saved
- Use this for building your pipeline of passive candidates

## API Integration

The extension communicates with your recruiting platform backend via REST API:

### Endpoints Used

- `POST /api/v1/candidates` - Create candidate
- `POST /api/v1/applications` - Create application
- `POST /api/v1/talent-pools/:id/candidates` - Add to talent pool
- `GET /api/v1/jobs` - List open jobs
- `GET /api/v1/talent-pools` - List talent pools

### Authentication

The extension uses JWT bearer token authentication:
```
Authorization: Bearer <token>
```

Tokens are stored securely in Chrome's local storage and automatically included in all API requests.

## Privacy & Security

### Data Handling

- All candidate data is sent directly to your recruiting platform
- No data is stored on external servers
- Authentication tokens are stored locally in Chrome's secure storage
- The extension only runs on LinkedIn.com domains

### GDPR Compliance

- Built-in consent checkbox for GDPR compliance
- Consent timestamp is recorded with each candidate
- Source tracking shows data was collected via Chrome extension

### Permissions

The extension requires the following permissions:

- `activeTab`: To read LinkedIn profile data
- `storage`: To store API URL and authentication token
- `scripting`: To inject the floating button on LinkedIn pages
- `host_permissions`: To access LinkedIn.com and your API

## Development

### Project Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
├── content.js            # LinkedIn page scraping
├── content.css           # Content script styles
├── background.js         # Background service worker
├── welcome.html          # Welcome page
├── icons/                # Extension icons
└── README.md            # This file
```

### Building

No build step is required. The extension uses vanilla JavaScript.

### Testing

1. Load the extension in Chrome (see Installation)
2. Navigate to a LinkedIn profile
3. Click the extension icon or floating button
4. Verify data extraction and saving

### Debugging

- **Popup**: Right-click the extension icon → "Inspect popup"
- **Content Script**: Open Chrome DevTools on LinkedIn page
- **Background Script**: Go to `chrome://extensions/` → Click "Inspect views: background page"

## Troubleshooting

### Extension Not Working

1. Verify you're on a LinkedIn profile page (`linkedin.com/in/...`)
2. Check that you're logged into the recruiting platform
3. Verify API URL is correct in settings
4. Check browser console for errors

### Data Not Extracting

LinkedIn frequently updates their HTML structure. If data extraction fails:
1. Check the browser console for errors
2. The extension may need updates to match LinkedIn's new structure
3. Report issues with specific profile URLs

### Authentication Issues

1. Clear extension storage: Go to `chrome://extensions/` → Click "Remove" → Reinstall
2. Log out and log back in to the recruiting platform
3. Verify API URL is accessible

### API Connection Issues

1. Verify the API URL is correct
2. Check that the backend is running
3. Verify CORS is configured to allow requests from `chrome-extension://`
4. Check network tab in DevTools for failed requests

## Backend Requirements

Your recruiting platform backend must support:

### CORS Configuration

Allow requests from Chrome extension origins:
```javascript
app.use(cors({
  origin: [
    'chrome-extension://*',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### API Endpoints

Implement the following endpoints:

1. **Create Candidate**
   ```
   POST /api/v1/candidates
   Body: { firstName, lastName, email, phone, location, currentTitle, currentCompany, linkedinUrl, tags, source, gdprConsent }
   ```

2. **Create Application**
   ```
   POST /api/v1/applications
   Body: { candidateId, jobId, source }
   ```

3. **Add to Talent Pool**
   ```
   POST /api/v1/talent-pools/:id/candidates
   Body: { candidateIds: [string] }
   ```

4. **List Jobs**
   ```
   GET /api/v1/jobs?status=open&limit=100
   ```

5. **List Talent Pools**
   ```
   GET /api/v1/talent-pools?limit=100
   ```

## Future Enhancements

- [ ] Email enrichment integration (Hunter.io, Clearbit)
- [ ] Support for other platforms (GitHub, Twitter, etc.)
- [ ] Bulk import from LinkedIn search results
- [ ] Custom field mapping
- [ ] Duplicate detection before saving
- [ ] Offline mode with sync queue
- [ ] Chrome sync for settings across devices

## License

This extension is part of the Recruiting Platform project.

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review backend API documentation
3. Check browser console for errors
4. Contact your platform administrator
