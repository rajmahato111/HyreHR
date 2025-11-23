// Background service worker for the Chrome extension

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openPopup') {
    chrome.action.openPopup();
  }
  
  if (request.action === 'authenticate') {
    handleAuthentication(request.apiUrl);
  }
  
  return true;
});

// Handle authentication flow
async function handleAuthentication(apiUrl) {
  try {
    // Open login page in new tab
    const tab = await chrome.tabs.create({
      url: `${apiUrl}/auth/login?extension=true`
    });

    // Listen for auth completion
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, updatedTab) {
      if (tabId === tab.id && changeInfo.url) {
        // Check if URL contains auth token
        const url = new URL(changeInfo.url);
        const token = url.searchParams.get('token');
        
        if (token) {
          // Save token
          chrome.storage.local.set({ authToken: token });
          
          // Notify popup
          chrome.runtime.sendMessage({
            action: 'authTokenReceived',
            token: token
          });
          
          // Close auth tab
          chrome.tabs.remove(tabId);
          
          // Remove listener
          chrome.tabs.onUpdated.removeListener(listener);
        }
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default API URL
    chrome.storage.local.set({
      apiUrl: 'http://localhost:3000'
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }
});

// Context menu for quick actions
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveToATS',
    title: 'Save to Recruiting Platform',
    contexts: ['page'],
    documentUrlPatterns: ['https://www.linkedin.com/in/*']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'saveToATS') {
    chrome.action.openPopup();
  }
});

// Badge to show extension status
async function updateBadge() {
  const { authToken } = await chrome.storage.local.get(['authToken']);
  
  if (authToken) {
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
  } else {
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  }
}

// Update badge on startup and when storage changes
chrome.runtime.onStartup.addListener(updateBadge);
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.authToken) {
    updateBadge();
  }
});

// Initialize badge
updateBadge();

// Email enrichment service integration (placeholder)
async function enrichEmail(firstName, lastName, company) {
  // This would integrate with services like Hunter.io, Clearbit, etc.
  // For now, return common email patterns
  const patterns = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase()}.com`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${company.toLowerCase()}.com`,
    `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}@${company.toLowerCase()}.com`
  ];
  
  return patterns;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { enrichEmail };
}
