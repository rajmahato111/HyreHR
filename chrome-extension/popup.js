// Popup script for the Chrome extension
let candidateData = null;
let authToken = null;
let apiUrl = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Load settings
  const settings = await chrome.storage.local.get(['apiUrl', 'authToken']);
  apiUrl = settings.apiUrl || 'http://localhost:3000';
  authToken = settings.authToken;

  // Check if user is logged in
  if (!authToken) {
    showSection('loginSection');
    return;
  }

  // Check if we're on LinkedIn
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.url.includes('linkedin.com')) {
    showStatus('Please navigate to a LinkedIn profile page', 'info');
    showSection('loginSection');
    return;
  }

  // Load candidate data from content script
  showSection('loadingSection');
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractProfile' });
    if (response && response.success) {
      candidateData = response.data;
      await loadJobsAndPools();
      displayCandidateInfo();
      showSection('mainSection');
    } else {
      showStatus('Could not extract profile data. Please make sure you are on a LinkedIn profile page.', 'error');
      showSection('loginSection');
    }
  } catch (error) {
    console.error('Error extracting profile:', error);
    showStatus('Error extracting profile data', 'error');
    showSection('loginSection');
  }
});

// Event listeners
document.getElementById('loginBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: `${apiUrl}/auth/login` });
});

document.getElementById('settingsLink').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('apiUrlInput').value = apiUrl;
  showSection('settingsSection');
});

document.getElementById('backBtn').addEventListener('click', () => {
  showSection('loginSection');
});

document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
  const newApiUrl = document.getElementById('apiUrlInput').value.trim();
  if (newApiUrl) {
    await chrome.storage.local.set({ apiUrl: newApiUrl });
    apiUrl = newApiUrl;
    showStatus('Settings saved', 'success');
    showSection('loginSection');
  }
});

document.getElementById('cancelBtn').addEventListener('click', () => {
  window.close();
});

document.getElementById('saveBtn').addEventListener('click', async () => {
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const jobId = document.getElementById('jobSelect').value;
    const poolId = document.getElementById('poolSelect').value;
    const gdprConsent = document.getElementById('gdprConsent').checked;

    // Create candidate
    const candidatePayload = {
      firstName: candidateData.firstName,
      lastName: candidateData.lastName,
      email: candidateData.email,
      phone: candidateData.phone,
      location: candidateData.location,
      currentCompany: candidateData.currentCompany,
      currentTitle: candidateData.currentTitle,
      linkedinUrl: candidateData.linkedinUrl,
      tags: candidateData.skills || [],
      source: {
        type: 'linkedin',
        details: {
          profileUrl: candidateData.linkedinUrl,
          scrapedAt: new Date().toISOString()
        }
      },
      gdprConsent,
      gdprConsentDate: gdprConsent ? new Date().toISOString() : null
    };

    const response = await fetch(`${apiUrl}/api/v1/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(candidatePayload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save candidate');
    }

    const candidate = await response.json();

    // Add to job if selected
    if (jobId) {
      await fetch(`${apiUrl}/api/v1/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          candidateId: candidate.id,
          jobId,
          source: {
            type: 'sourced',
            details: { sourcedVia: 'chrome_extension' }
          }
        })
      });
    }

    // Add to talent pool if selected
    if (poolId) {
      await fetch(`${apiUrl}/api/v1/talent-pools/${poolId}/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          candidateIds: [candidate.id]
        })
      });
    }

    showStatus('Candidate saved successfully!', 'success');
    setTimeout(() => window.close(), 1500);
  } catch (error) {
    console.error('Error saving candidate:', error);
    showStatus(error.message || 'Failed to save candidate', 'error');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Candidate';
  }
});

// Helper functions
function showSection(sectionId) {
  const sections = ['loginSection', 'loadingSection', 'mainSection', 'settingsSection'];
  sections.forEach(id => {
    document.getElementById(id).style.display = id === sectionId ? 'block' : 'none';
  });
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('statusMessage');
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };
  
  statusDiv.innerHTML = `
    <div class="status ${type}">
      <span class="status-icon">${icons[type]}</span>
      <span>${message}</span>
    </div>
  `;
}

function displayCandidateInfo() {
  const infoDiv = document.getElementById('candidateInfo');
  const { firstName, lastName, currentTitle, currentCompany, location, email } = candidateData;
  
  infoDiv.innerHTML = `
    <h3>${firstName} ${lastName}</h3>
    ${currentTitle ? `<p><strong>Title:</strong> ${currentTitle}</p>` : ''}
    ${currentCompany ? `<p><strong>Company:</strong> ${currentCompany}</p>` : ''}
    ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
    ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
  `;
}

async function loadJobsAndPools() {
  try {
    // Load jobs
    const jobsResponse = await fetch(`${apiUrl}/api/v1/jobs?status=open&limit=100`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      const jobs = jobsData.data || jobsData;
      const jobSelect = document.getElementById('jobSelect');
      jobs.forEach(job => {
        const option = document.createElement('option');
        option.value = job.id;
        option.textContent = job.title;
        jobSelect.appendChild(option);
      });
    }

    // Load talent pools
    const poolsResponse = await fetch(`${apiUrl}/api/v1/talent-pools?limit=100`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (poolsResponse.ok) {
      const poolsData = await poolsResponse.json();
      const pools = poolsData.data || poolsData;
      const poolSelect = document.getElementById('poolSelect');
      pools.forEach(pool => {
        const option = document.createElement('option');
        option.value = pool.id;
        option.textContent = pool.name;
        poolSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading jobs and pools:', error);
  }
}

// Listen for auth token from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'authTokenReceived') {
    authToken = message.token;
    chrome.storage.local.set({ authToken });
    location.reload();
  }
});
