// Content script - injects camera overlay and handles eye tracking
let video = null;
let canvas = null;
let ctx = null;
let isTracking = false;
let baselineY = null;
let sensitivity = 5;
let scrollSpeed = 3;
let lastScrollTime = 0;
const SCROLL_THROTTLE_MS = 50; // Reduced throttle for more responsive scrolling
let overlay = null;
let stream = null;

// Create camera overlay
function createOverlay() {
    if (overlay) return; // Already exists
    
    overlay = document.createElement('div');
    overlay.id = 'eye-tracker-overlay';
    overlay.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; width: 200px; background: rgba(0,0,0,0.8); 
                    color: white; padding: 15px; border-radius: 8px; z-index: 999999; font-family: Arial, sans-serif;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong style="font-size: 14px;">Eye Tracker</strong>
                <button id="eye-tracker-close" style="background: #f44336; color: white; border: none; 
                        border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px;">×</button>
            </div>
            <video id="eye-tracker-video" autoplay playsinline 
                   style="width: 100%; border-radius: 4px; background: #000; display: block;"></video>
            <canvas id="eye-tracker-canvas" style="display: none;"></canvas>
            <div id="eye-tracker-status" style="margin-top: 10px; font-size: 11px; color: #ccc;">
                Initializing...
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    video = document.getElementById('eye-tracker-video');
    canvas = document.getElementById('eye-tracker-canvas');
    ctx = canvas.getContext('2d');
    
    // Close button
    document.getElementById('eye-tracker-close').addEventListener('click', () => {
        stopTracking();
        removeOverlay();
    });
}

function removeOverlay() {
    if (overlay) {
        overlay.remove();
        overlay = null;
        video = null;
        canvas = null;
        ctx = null;
    }
}

// Simple face detection
function detectFacePosition() {
    if (!video || !video.videoWidth || !video.videoHeight) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let facePixels = [];
    let minX = canvas.width, maxX = 0;
    let minY = canvas.height, maxY = 0;
    
    for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
            const idx = (y * canvas.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            // Simple skin tone detection
            if (r > 95 && g > 40 && b > 20 && 
                Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
                Math.abs(r - g) > 15 && r > g && r > b) {
                facePixels.push({x, y});
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
    }
    
    if (facePixels.length < 100) return null;
    
    const eyeY = minY + (maxY - minY) * 0.35;
    return {
        normalizedY: eyeY / canvas.height
    };
}

// Process video frame
function processFrame() {
    if (!isTracking || !video) return;
    
    const facePos = detectFacePosition();
    const statusEl = document.getElementById('eye-tracker-status');
    
    if (facePos) {
        if (baselineY === null) {
            baselineY = facePos.normalizedY;
            if (statusEl) statusEl.textContent = 'Baseline set! Look up/down to scroll.';
            requestAnimationFrame(processFrame);
            return;
        }
        
        const deltaY = facePos.normalizedY - baselineY;
        const threshold = sensitivity / 200;
        
        const now = Date.now();
        if (Math.abs(deltaY) > threshold && (now - lastScrollTime) > SCROLL_THROTTLE_MS) {
            // Increased multiplier for faster scrolling (was 20, now 80)
            const scrollAmount = Math.round(Math.abs(deltaY) * scrollSpeed * 80);
            
            if (deltaY > 0) {
                smoothScrollDown(scrollAmount, 50); // Faster scroll duration (was 100ms)
                if (statusEl) statusEl.textContent = '↓ Scrolling DOWN';
            } else {
                smoothScrollUp(scrollAmount, 50); // Faster scroll duration (was 100ms)
                if (statusEl) statusEl.textContent = '↑ Scrolling UP';
            }
            
            lastScrollTime = now;
        } else {
            if (statusEl) statusEl.textContent = 'Tracking... Look up/down';
        }
    } else {
        if (statusEl) statusEl.textContent = 'No face detected. Position yourself.';
    }
    
    requestAnimationFrame(processFrame);
}

// Start tracking
async function startTracking() {
    try {
        createOverlay();
        const statusEl = document.getElementById('eye-tracker-status');
        if (statusEl) statusEl.textContent = 'Requesting camera...';
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera not supported');
        }
        
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 320 },
                height: { ideal: 240 },
                facingMode: 'user'
            }
        });
        
        video.srcObject = stream;
        
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
            video.onloadedmetadata = () => {
                clearTimeout(timeout);
                video.play().then(() => {
                    canvas.width = video.videoWidth || 320;
                    canvas.height = video.videoHeight || 240;
                    resolve();
                }).catch(reject);
            };
            video.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Video error'));
            };
        });
        
        isTracking = true;
        baselineY = null;
        if (statusEl) statusEl.textContent = 'Camera ready! Setting baseline...';
        
        processFrame();
        
    } catch (error) {
        console.error('Camera error:', error);
        const statusEl = document.getElementById('eye-tracker-status');
        if (statusEl) {
            statusEl.textContent = `Error: ${error.name === 'NotAllowedError' ? 'Camera permission denied' : error.message}`;
            statusEl.style.color = '#ff6b6b';
        }
        stopTracking();
    }
}

// Stop tracking
function stopTracking() {
    isTracking = false;
    baselineY = null;
    
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    if (video) {
        video.srcObject = null;
    }
}

// Smooth scrolling functions
function smoothScrollDown(amount, duration) {
    const start = window.pageYOffset;
    const distance = Math.min(amount, 200); // Increased max scroll per step (was 50)
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, start, distance, duration);
        window.scrollTo(0, run);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

function smoothScrollUp(amount, duration) {
    const start = window.pageYOffset;
    const distance = -Math.min(amount, 200); // Increased max scroll per step (was 50)
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, start, distance, duration);
        window.scrollTo(0, run);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'start') {
        startTracking();
        sendResponse({ success: true });
    } else if (request.action === 'stop') {
        stopTracking();
        removeOverlay();
        sendResponse({ success: true });
    } else if (request.action === 'updateSettings') {
        sensitivity = request.sensitivity || sensitivity;
        scrollSpeed = request.scrollSpeed || scrollSpeed;
        sendResponse({ success: true });
    }
    return true;
});
