# HirePath Saver Chrome Extension

A browser extension for Chrome that allows you to save job listings directly to your HirePath dashboard with a single click.

## Features

- **One-Click Save**: Save job postings from LinkedIn, Indeed, and Glassdoor directly to your HirePath account.
- **Smart Job Detection**: Automatically detects when you're viewing a job listing.
- **Visual Feedback**: Customizable animations confirm when a job has been successfully saved.
- **Audio Feedback**: Optional sound effects for successful saves.
- **Settings**: Customize your experience through the extension settings.

## Supported Job Sites

- LinkedIn
- Indeed
- Glassdoor

## Setup for Development

1. Clone this repository
2. Navigate to `chrome://extensions/` in Chrome
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the `extension` directory

## Building for Production

To package the extension for distribution:

1. Make sure all files are up-to-date
2. Zip the contents of the `extension` directory
3. Submit to the Chrome Web Store

## Directory Structure

```
extension/
├── manifest.json       # Extension configuration
├── popup.html          # Popup UI
├── popup.js            # Popup functionality
├── background.js       # Background service worker
├── content.js          # Content script for job sites
├── options.html        # Settings page
├── options.js          # Settings functionality
├── styles/             # CSS files
│   └── popup.css       # Styles for popup
└── assets/             # Images and sounds
    ├── icon16.png      # Small icon
    ├── icon48.png      # Medium icon
    └── icon128.png     # Large icon
```

## API Integration

The extension connects to the HirePath backend API at `https://hirepath.onrender.com/api` to store saved jobs in your account.

## Authentication

Users must be logged into their HirePath account for the extension to work. The extension handles authentication via secure tokens.

## Privacy

The extension only collects the data necessary to save job listings (job title, company name, description, URL, etc.) and does not track your browsing history or other activities.

## Support

For issues, feature requests, or questions, please [file an issue](https://github.com/your-username/hirepath-extension/issues). 