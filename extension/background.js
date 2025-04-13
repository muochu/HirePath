// Background script for HirePath Saver Extension
const API_URL = 'https://hirepath.onrender.com/api';

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveJobToHirePath') {
    // Save job data to HirePath API
    saveJob(message.jobData)
      .then(result => {
        sendResponse({ success: true, result });
      })
      .catch(error => {
        console.error('Error saving job:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // Required for async response
    return true;
  }
  
  if (message.action === 'checkAuth') {
    checkAuthentication()
      .then(isAuthenticated => {
        sendResponse({ isAuthenticated });
      })
      .catch(error => {
        console.error('Auth check error:', error);
        sendResponse({ isAuthenticated: false, error: error.message });
      });
    
    // Required for async response
    return true;
  }

  if (message.action === 'saveAuthToken') {
    // Save auth token from the HirePath website
    saveAuthToken(message.token)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error('Error saving auth token:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // Required for async response
    return true;
  }
});

// Save job data to HirePath API
async function saveJob(jobData) {
  try {
    // Get auth token
    const { authToken } = await chrome.storage.local.get(['authToken']);
    
    if (!authToken) {
      throw new Error('Not authenticated. Please log in to HirePath.');
    }
    
    // Post to the API
    const response = await fetch(`${API_URL}/applications/extension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        companyName: jobData.companyName,
        roleTitle: jobData.jobTitle,
        status: 'To Apply',
        jobPostUrl: jobData.jobUrl,
        location: jobData.location,
        isDreamCompany: false,
        source: jobData.source,
        notes: `Job scraped from ${jobData.source}:\n\n${jobData.description.substring(0, 500)}...`
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save job');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
}

// Save auth token to extension storage
async function saveAuthToken(token) {
  try {
    // Save token to storage
    await chrome.storage.local.set({ authToken: token });
    
    // Verify the token with the API
    await verifyToken(token);
    
    console.log('Auth token saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving auth token:', error);
    throw error;
  }
}

// Verify a token with the API
async function verifyToken(token) {
  try {
    const response = await fetch(`${API_URL}/users/extension/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    
    if (!response.ok) {
      throw new Error('Invalid token');
    }
    
    const data = await response.json();
    
    if (!data.authenticated) {
      throw new Error('Token verification failed');
    }
    
    // Update user info in storage
    await chrome.storage.local.set({ user: data.user });
    
    return data;
  } catch (error) {
    console.error('Token verification error:', error);
    // Remove invalid token
    await chrome.storage.local.remove(['authToken', 'user']);
    throw error;
  }
}

// Check if user is authenticated
async function checkAuthentication() {
  try {
    // Get auth token
    const { authToken } = await chrome.storage.local.get(['authToken']);
    
    if (!authToken) {
      return false;
    }
    
    // Verify token with API
    const response = await fetch(`${API_URL}/users/extension/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: authToken })
    });
    
    return response.ok && (await response.json()).authenticated;
  } catch (error) {
    console.error('Authentication check error:', error);
    return false;
  }
}

// Listen for install event
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Show onboarding page
    chrome.tabs.create({
      url: 'onboarding.html'
    });
  }
}); 