// Popup script - controls tracking on the current page
let sensitivity = 5;
let scrollSpeed = 3;
let isTracking = false;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const sensitivitySlider = document.getElementById('sensitivity');
const scrollSpeedSlider = document.getElementById('scrollSpeed');
const sensitivityValue = document.getElementById('sensitivityValue');
const speedValue = document.getElementById('speedValue');
const debugDiv = document.getElementById('debug');
const debugText = document.getElementById('debugText');

// Enable debug mode
function updateDebug(info) {
    if (debugDiv && debugText) {
        debugText.textContent = info;
        debugDiv.style.display = 'block';
    }
    console.log('Debug:', info);
}

// Update UI state
function updateUI(tracking) {
    isTracking = tracking;
    startBtn.disabled = tracking;
    stopBtn.disabled = !tracking;
    
    if (tracking) {
        status.textContent = 'Tracking active on current page';
        status.className = 'status active';
    } else {
        status.textContent = 'Ready to start tracking';
        status.className = 'status';
    }
}

// Start tracking
startBtn.addEventListener('click', async () => {
    // Save settings
    chrome.storage.sync.set({
        sensitivity: sensitivity,
        scrollSpeed: scrollSpeed
    });
    
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
        status.textContent = 'Error: No active tab found';
        return;
    }
    
    // Send start message to content script
    try {
        await chrome.tabs.sendMessage(tab.id, {
            action: 'start',
            sensitivity: sensitivity,
            scrollSpeed: scrollSpeed
        });
        
        updateUI(true);
        updateDebug('Tracking started on current page. Camera overlay should appear.');
    } catch (error) {
        console.error('Error starting tracking:', error);
        status.textContent = 'Error: Could not start tracking. Make sure you\'re on a webpage.';
        updateDebug(`Error: ${error.message}`);
    }
});

// Stop tracking
stopBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab) {
        try {
            await chrome.tabs.sendMessage(tab.id, { action: 'stop' });
        } catch (error) {
            console.error('Error stopping tracking:', error);
        }
    }
    
    updateUI(false);
    updateDebug('Tracking stopped');
});

// Update settings in real-time
function updateSettings() {
    chrome.storage.sync.set({
        sensitivity: sensitivity,
        scrollSpeed: scrollSpeed
    });
    
    // Send to content script if tracking is active
    if (isTracking) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'updateSettings',
                    sensitivity: sensitivity,
                    scrollSpeed: scrollSpeed
                }).catch(() => {});
            }
        });
    }
}

// Update sensitivity
sensitivitySlider.addEventListener('input', (e) => {
    sensitivity = parseInt(e.target.value);
    sensitivityValue.textContent = sensitivity;
    updateSettings();
});

// Update scroll speed
scrollSpeedSlider.addEventListener('input', (e) => {
    scrollSpeed = parseInt(e.target.value);
    speedValue.textContent = scrollSpeed;
    updateSettings();
});

// Load saved settings
chrome.storage.sync.get(['sensitivity', 'scrollSpeed'], (items) => {
    if (items.sensitivity) {
        sensitivity = items.sensitivity;
        sensitivitySlider.value = sensitivity;
        sensitivityValue.textContent = sensitivity;
    }
    if (items.scrollSpeed) {
        scrollSpeed = items.scrollSpeed;
        scrollSpeedSlider.value = scrollSpeed;
        speedValue.textContent = scrollSpeed;
    }
});

// Check if tracking is active on current tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'checkStatus' }).then(() => {
            updateUI(true);
        }).catch(() => {
            updateUI(false);
        });
    }
});

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    status.textContent = 'Ready to start tracking on current page';
    updateDebug('Extension loaded. Click "Start Tracking" to begin.');
    updateUI(false);
});
