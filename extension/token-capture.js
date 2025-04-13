/**
 * Token Capture Script
 * 
 * This script will be injected into the HirePath website to capture
 * authentication tokens and save them to the extension's storage.
 */

(function() {
  // Check if we're on the HirePath website
  if (!window.location.href.includes('hirepath.onrender.com')) {
    return;
  }

  console.log('🔑 HirePath token capture script initialized');

  // Function to listen for authentication events
  function listenForAuthEvents() {
    // Listen for storage events (when token is saved to localStorage)
    window.addEventListener('storage', function(event) {
      if (event.key === 'token' && event.newValue) {
        saveTokenToExtension(event.newValue);
      }
    });

    // Check if token already exists in localStorage
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      saveTokenToExtension(existingToken);
    }

    // Monitor localStorage.setItem for token setting
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      if (key === 'token') {
        saveTokenToExtension(value);
      }
      originalSetItem.apply(this, arguments);
    };
  }

  // Save token to extension storage
  function saveTokenToExtension(token) {
    console.log('🔒 Authentication token detected, saving to extension...');
    
    // Communicate with extension's background script
    chrome.runtime.sendMessage({
      action: 'saveAuthToken',
      token: token
    }, function(response) {
      if (response && response.success) {
        console.log('✅ Token saved to extension successfully');
        
        // Notify user
        showNotification('Successfully connected to HirePath', 'You can now use the HirePath Saver extension!');
      } else {
        console.error('❌ Error saving token to extension:', response?.error || 'Unknown error');
      }
    });
  }

  // Show a notification to the user
  function showNotification(title, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '300px';
    notification.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
    
    // Notification content
    notification.innerHTML = `
      <div style="margin-bottom: 5px; font-weight: bold">${title}</div>
      <div>${message}</div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 5000);
  }

  // Start listening for auth events
  listenForAuthEvents();
})(); 