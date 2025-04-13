// Global variables
let isJobPage = false;
let jobData = {
  jobTitle: '',
  companyName: '',
  jobUrl: window.location.href,
  location: '',
  description: '',
  source: getSourceName()
};

// Initialize
initializeContentScript();

// Main initialization function
function initializeContentScript() {
  // Detect if we're on a job page and extract data
  if (isLinkedInJobPage()) {
    extractLinkedInJobData();
  } else if (isIndeedJobPage()) {
    extractIndeedJobData();
  } else if (isGlassdoorJobPage()) {
    extractGlassdoorJobData();
  }
  
  // If we determined this is a job page, inject the save button
  if (isJobPage) {
    injectSaveButton();
  }
  
  // Set up message listener
  setupMessageListener();
}

// Source detection functions
function getSourceName() {
  const hostname = window.location.hostname;
  if (hostname.includes('linkedin')) return 'LinkedIn';
  if (hostname.includes('indeed')) return 'Indeed';
  if (hostname.includes('glassdoor')) return 'Glassdoor';
  return 'Unknown';
}

function isLinkedInJobPage() {
  return window.location.href.includes('linkedin.com/jobs/view/');
}

function isIndeedJobPage() {
  return window.location.href.includes('indeed.com/viewjob');
}

function isGlassdoorJobPage() {
  return window.location.href.includes('glassdoor.com/job-listing/');
}

// Data extraction functions
function extractLinkedInJobData() {
  try {
    // Wait for the page to fully load
    setTimeout(() => {
      // Job title
      const jobTitleElement = document.querySelector('.job-details-jobs-unified-top-card__job-title');
      if (jobTitleElement) {
        jobData.jobTitle = jobTitleElement.textContent.trim();
      }
      
      // Company name
      const companyElement = document.querySelector('.job-details-jobs-unified-top-card__company-name');
      if (companyElement) {
        jobData.companyName = companyElement.textContent.trim();
      }
      
      // Location
      const locationElement = document.querySelector('.job-details-jobs-unified-top-card__bullet');
      if (locationElement) {
        jobData.location = locationElement.textContent.trim();
      }
      
      // Description
      const descriptionElement = document.querySelector('.jobs-description-content__text');
      if (descriptionElement) {
        jobData.description = descriptionElement.textContent.trim();
      }
      
      isJobPage = !!(jobData.jobTitle && jobData.companyName);
    }, 1000);
  } catch (error) {
    console.error('Error extracting LinkedIn job data:', error);
  }
}

function extractIndeedJobData() {
  try {
    // Wait for the page to fully load
    setTimeout(() => {
      // Job title
      const jobTitleElement = document.querySelector('h1.jobsearch-JobInfoHeader-title');
      if (jobTitleElement) {
        jobData.jobTitle = jobTitleElement.textContent.trim();
      }
      
      // Company name
      const companyElement = document.querySelector('div[data-company-name="true"]');
      if (companyElement) {
        jobData.companyName = companyElement.textContent.trim();
      }
      
      // Location
      const locationElement = document.querySelector('div[data-testid="job-location"]');
      if (locationElement) {
        jobData.location = locationElement.textContent.trim();
      }
      
      // Description
      const descriptionElement = document.querySelector('#jobDescriptionText');
      if (descriptionElement) {
        jobData.description = descriptionElement.textContent.trim();
      }
      
      isJobPage = !!(jobData.jobTitle && jobData.companyName);
    }, 1000);
  } catch (error) {
    console.error('Error extracting Indeed job data:', error);
  }
}

function extractGlassdoorJobData() {
  try {
    // Wait for the page to fully load
    setTimeout(() => {
      // Job title
      const jobTitleElement = document.querySelector('.job-title');
      if (jobTitleElement) {
        jobData.jobTitle = jobTitleElement.textContent.trim();
      }
      
      // Company name
      const companyElement = document.querySelector('.employer-name');
      if (companyElement) {
        jobData.companyName = companyElement.textContent.trim();
      }
      
      // Location
      const locationElement = document.querySelector('.location');
      if (locationElement) {
        jobData.location = locationElement.textContent.trim();
      }
      
      // Description
      const descriptionElement = document.querySelector('.jobDescriptionContent');
      if (descriptionElement) {
        jobData.description = descriptionElement.textContent.trim();
      }
      
      isJobPage = !!(jobData.jobTitle && jobData.companyName);
    }, 1000);
  } catch (error) {
    console.error('Error extracting Glassdoor job data:', error);
  }
}

// Button injection function
function injectSaveButton() {
  // Wait for full page load
  setTimeout(() => {
    // Different injection logic based on the site
    if (jobData.source === 'LinkedIn') {
      injectLinkedInButton();
    } else if (jobData.source === 'Indeed') {
      injectIndeedButton();
    } else if (jobData.source === 'Glassdoor') {
      injectGlassdoorButton();
    }
  }, 1500);
}

function injectLinkedInButton() {
  // Find the apply button container
  const applyButtonContainer = document.querySelector('.jobs-unified-top-card__actions');
  
  if (applyButtonContainer) {
    // Create button
    const saveButton = createSaveButton();
    
    // Adjust styling for LinkedIn
    saveButton.style.marginTop = '12px';
    
    // Insert button
    applyButtonContainer.appendChild(saveButton);
  }
}

function injectIndeedButton() {
  // Find the apply button container
  const applyButtonContainer = document.querySelector('.jobsearch-ViewJobButtons-container');
  
  if (applyButtonContainer) {
    // Create button
    const saveButton = createSaveButton();
    
    // Adjust styling for Indeed
    saveButton.style.marginTop = '10px';
    
    // Insert button
    applyButtonContainer.appendChild(saveButton);
  }
}

function injectGlassdoorButton() {
  // Find the apply button container
  const applyButtonContainer = document.querySelector('.applyButtonsContainer');
  
  if (applyButtonContainer) {
    // Create button
    const saveButton = createSaveButton();
    
    // Adjust styling for Glassdoor
    saveButton.style.marginTop = '8px';
    
    // Insert button
    applyButtonContainer.appendChild(saveButton);
  }
}

function createSaveButton() {
  // Create button element
  const button = document.createElement('button');
  
  // Set content and styling
  button.textContent = 'Save to HirePath';
  button.id = 'hirepath-save-button';
  
  // Style the button (common to all sites)
  button.style.width = '100%';
  button.style.padding = '10px 16px';
  button.style.backgroundColor = '#2c7af8';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.fontWeight = 'bold';
  button.style.cursor = 'pointer';
  button.style.fontSize = '14px';
  button.style.transition = 'background-color 0.2s';
  
  // Hover effect
  button.addEventListener('mouseover', () => {
    button.style.backgroundColor = '#1c69e8';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = '#2c7af8';
  });
  
  // Click handler
  button.addEventListener('click', saveJobToHirePath);
  
  return button;
}

// Save job function
function saveJobToHirePath() {
  // Get the button
  const button = document.getElementById('hirepath-save-button');
  
  // Update button to show loading state
  button.textContent = 'Saving...';
  button.disabled = true;
  
  // Send message to background script
  chrome.runtime.sendMessage({
    action: 'saveJobToHirePath',
    jobData: jobData
  }, (response) => {
    if (response && response.success) {
      // Show success
      showSaveSuccess(button);
    } else {
      // Show error
      showSaveError(button, response.error);
    }
  });
}

function showSaveSuccess(button) {
  // Show success state
  button.textContent = '✓ Saved to HirePath';
  button.style.backgroundColor = '#4CAF50';
  
  // Add confetti animation (simplified version)
  showConfetti();
  
  // Reset button after 3 seconds
  setTimeout(() => {
    button.textContent = 'Save to HirePath';
    button.style.backgroundColor = '#2c7af8';
    button.disabled = false;
  }, 3000);
}

function showSaveError(button, errorMsg) {
  // Show error state
  button.textContent = '❌ Error';
  button.style.backgroundColor = '#F44336';
  
  // Log error message
  console.error('Save error:', errorMsg);
  
  // Reset button after 3 seconds
  setTimeout(() => {
    button.textContent = 'Try Again';
    button.style.backgroundColor = '#2c7af8';
    button.disabled = false;
  }, 3000);
}

// Simple confetti animation
function showConfetti() {
  // Create a container for the confetti
  const confettiContainer = document.createElement('div');
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.top = '0';
  confettiContainer.style.left = '0';
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.pointerEvents = 'none';
  confettiContainer.style.zIndex = '9999';
  
  // Add to body
  document.body.appendChild(confettiContainer);
  
  // Create 50 confetti pieces
  for (let i = 0; i < 50; i++) {
    createConfettiPiece(confettiContainer);
  }
  
  // Remove container after animation
  setTimeout(() => {
    confettiContainer.remove();
  }, 3000);
}

function createConfettiPiece(container) {
  // Create a confetti piece
  const piece = document.createElement('div');
  
  // Random size
  const size = Math.random() * 10 + 5;
  
  // Random color
  const colors = ['#2c7af8', '#4CAF50', '#FFC107', '#F44336', '#9C27B0'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  // Random position
  const left = Math.random() * 100;
  
  // Style
  piece.style.position = 'absolute';
  piece.style.width = `${size}px`;
  piece.style.height = `${size}px`;
  piece.style.backgroundColor = color;
  piece.style.left = `${left}%`;
  piece.style.top = '-20px';
  piece.style.borderRadius = '50%';
  
  // Add to container
  container.appendChild(piece);
  
  // Animate
  const duration = Math.random() * 3 + 2;
  const delay = Math.random();
  
  piece.animate([
    { transform: 'translateY(0) rotate(0)', opacity: 1 },
    { transform: `translateY(${window.innerHeight}px) rotate(360deg)`, opacity: 0 }
  ], {
    duration: duration * 1000,
    delay: delay * 1000,
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
  });
  
  // Remove after animation
  setTimeout(() => {
    piece.remove();
  }, (duration + delay) * 1000);
}

// Message listener setup
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'checkJobPage') {
      sendResponse({
        isJobPage: isJobPage,
        jobTitle: jobData.jobTitle,
        companyName: jobData.companyName
      });
    }
    
    if (message.action === 'saveJob') {
      saveJobToHirePath();
      sendResponse({ success: true });
    }
  });
} 