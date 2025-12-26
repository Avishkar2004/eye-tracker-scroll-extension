// Popup script - opens camera window for tracking
let sensitivity = 5;
let scrollSpeed = 3;

const startBtn = document.getElementById('startBtn');
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

// Start tracking - opens camera in separate window
startBtn.addEventListener('click', async () => {
    // Save current settings
    chrome.storage.sync.set({
        sensitivity: sensitivity,
        scrollSpeed: scrollSpeed
    });
    
    // Open camera window
    const cameraUrl = chrome.runtime.getURL('camera.html');
    chrome.windows.create({
        url: cameraUrl,
        type: 'popup',
        width: 700,
        height: 600,
        focused: true
    });
    
    status.textContent = 'Opening camera window...';
    updateDebug('Camera window should open. Allow camera access when prompted.');
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

// Update sensitivity
sensitivitySlider.addEventListener('input', (e) => {
    sensitivity = parseInt(e.target.value);
    sensitivityValue.textContent = sensitivity;
});

// Update scroll speed
scrollSpeedSlider.addEventListener('input', (e) => {
    scrollSpeed = parseInt(e.target.value);
    speedValue.textContent = scrollSpeed;
});

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    status.textContent = 'Ready to start tracking. Click "Start Tracking" to begin.';
    updateDebug('Extension loaded. No external libraries required.');
});
