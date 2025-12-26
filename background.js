// Background service worker for the extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('Eye Tracker Scroll extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // The popup will handle the UI
});

