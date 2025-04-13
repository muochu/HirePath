// Global variables
const API_URL = 'https://hirepath.onrender.com/api';

// DOM elements
const loggedInSection = document.getElementById('logged-in');
const loggedOutSection = document.getElementById('logged-out');
const jobActionSection = document.getElementById('job-action');
const jobTitleElement = document.getElementById('job-title');
const companyNameElement = document.getElementById('company-name');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const dashboardBtn = document.getElementById('dashboard-btn');
const saveJobBtn = document.getElementById('save-job-btn');
const settingsLink = document.getElementById('settings-link');

// Initial setup
document.addEventListener('DOMContentLoaded', async () => {
  // Check login status
  const token = await getAuthToken();
  updateLoginStatus(!!token);
  
  // Check if on a job page
  checkIfOnJobPage();
  
  // Event listeners
  setupEventListeners();
});

// Functions
async function getAuthToken() {
  const result = await chrome.storage.local.get(['authToken']);
  return result.authToken;
}

async function saveAuthToken(token) {
  await chrome.storage.local.set({ authToken: token });
}

async function removeAuthToken() {
  await chrome.storage.local.remove(['authToken']);
}

function updateLoginStatus(isLoggedIn) {
  if (isLoggedIn) {
    loggedInSection.classList.remove('hidden');
    loggedOutSection.classList.add('hidden');
  } else {
    loggedInSection.classList.add('hidden');
    loggedOutSection.classList.remove('hidden');
  }
}

async function checkIfOnJobPage() {
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Check if we're on a job page by asking the content script
  chrome.tabs.sendMessage(tab.id, { action: 'checkJobPage' }, (response) => {
    if (chrome.runtime.lastError) {
      // Content script might not be injected or not ready
      return;
    }
    
    if (response && response.isJobPage) {
      // We're on a job page, show the job action section
      jobActionSection.classList.remove('hidden');
      jobTitleElement.textContent = response.jobTitle || 'Job Title';
      companyNameElement.textContent = response.companyName || 'Company';
    } else {
      jobActionSection.classList.add('hidden');
    }
  });
}

function setupEventListeners() {
  // Login button
  loginBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: `${API_URL.replace('/api', '')}/login` });
  });
  
  // Logout button
  logoutBtn.addEventListener('click', async () => {
    await removeAuthToken();
    updateLoginStatus(false);
  });
  
  // Dashboard button
  dashboardBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: API_URL.replace('/api', '') });
  });
  
  // Save job button
  saveJobBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'saveJob' }, (response) => {
      if (response && response.success) {
        // Show success message
        saveJobBtn.textContent = 'Job Saved!';
        saveJobBtn.disabled = true;
        
        // Reset after 3 seconds
        setTimeout(() => {
          saveJobBtn.textContent = 'Save Job to HirePath';
          saveJobBtn.disabled = false;
        }, 3000);
      } else {
        // Show error
        saveJobBtn.textContent = 'Error saving job';
        
        // Reset after 3 seconds
        setTimeout(() => {
          saveJobBtn.textContent = 'Save Job to HirePath';
        }, 3000);
      }
    });
  });
  
  // Settings link
  settingsLink.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
} 