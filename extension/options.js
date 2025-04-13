// DOM elements
const accountStatusEl = document.getElementById('account-status');
const loginActionsEl = document.getElementById('login-actions');
const logoutActionsEl = document.getElementById('logout-actions');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const saveSettingsBtn = document.getElementById('save-settings');
const statusMessageEl = document.getElementById('status-message');
const soundEnabledCheckbox = document.getElementById('sound-enabled');

// Default settings
const DEFAULT_SETTINGS = {
  feedbackStyle: 'check',
  soundEnabled: true
};

// API URL
const API_URL = 'https://hirepath.onrender.com/api';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings
  loadSettings();
  
  // Check login status
  checkLoginStatus();
  
  // Set up event listeners
  setupEventListeners();
});

// Functions
async function loadSettings() {
  try {
    // Get saved settings
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || DEFAULT_SETTINGS;
    
    // Apply settings to form
    document.querySelector(`input[name="feedback-style"][value="${settings.feedbackStyle}"]`).checked = true;
    soundEnabledCheckbox.checked = settings.soundEnabled;
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('Error loading settings. Please try again.', false);
  }
}

async function saveSettings() {
  try {
    // Get settings from form
    const feedbackStyle = document.querySelector('input[name="feedback-style"]:checked').value;
    const soundEnabled = soundEnabledCheckbox.checked;
    
    // Save settings
    await chrome.storage.local.set({
      settings: {
        feedbackStyle,
        soundEnabled
      }
    });
    
    showStatus('Settings saved successfully!', true);
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings. Please try again.', false);
  }
}

async function checkLoginStatus() {
  try {
    // Send message to background script to check authentication
    chrome.runtime.sendMessage({ action: 'checkAuth' }, (response) => {
      if (response && response.isAuthenticated) {
        // User is authenticated
        accountStatusEl.textContent = 'You are logged in to HirePath.';
        accountStatusEl.style.color = '#4CAF50';
        loginActionsEl.style.display = 'none';
        logoutActionsEl.style.display = 'block';
      } else {
        // User is not authenticated
        accountStatusEl.textContent = 'You are not logged in to HirePath.';
        accountStatusEl.style.color = '#F44336';
        loginActionsEl.style.display = 'block';
        logoutActionsEl.style.display = 'none';
      }
    });
  } catch (error) {
    console.error('Error checking login status:', error);
    accountStatusEl.textContent = 'Error checking login status.';
    accountStatusEl.style.color = '#F44336';
  }
}

async function login() {
  // Open login page
  chrome.tabs.create({ url: `${API_URL.replace('/api', '')}/login` });
}

async function logout() {
  try {
    // Clear auth token
    await chrome.storage.local.remove(['authToken']);
    
    // Update status
    accountStatusEl.textContent = 'You are not logged in to HirePath.';
    accountStatusEl.style.color = '#F44336';
    loginActionsEl.style.display = 'block';
    logoutActionsEl.style.display = 'none';
    
    showStatus('Logged out successfully!', true);
  } catch (error) {
    console.error('Error logging out:', error);
    showStatus('Error logging out. Please try again.', false);
  }
}

function showStatus(message, isSuccess) {
  statusMessageEl.textContent = message;
  statusMessageEl.className = 'status';
  statusMessageEl.classList.add(isSuccess ? 'success' : 'error');
  
  // Hide after 3 seconds
  setTimeout(() => {
    statusMessageEl.className = 'status';
  }, 3000);
}

function setupEventListeners() {
  // Login button
  loginBtn.addEventListener('click', login);
  
  // Logout button
  logoutBtn.addEventListener('click', logout);
  
  // Save settings button
  saveSettingsBtn.addEventListener('click', saveSettings);
} 