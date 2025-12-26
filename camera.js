// Camera window script - handles camera access and face detection
let isTracking = false;
let baselineY = null;
let sensitivity = 5;
let scrollSpeed = 3;
let lastScrollTime = 0;
const SCROLL_THROTTLE_MS = 100;

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');

// Get settings from storage
chrome.storage.sync.get(['sensitivity', 'scrollSpeed'], (items) => {
    if (items.sensitivity) sensitivity = items.sensitivity;
    if (items.scrollSpeed) scrollSpeed = items.scrollSpeed;
});

// Simple face detection
function detectFacePosition() {
    if (!video.videoWidth || !video.videoHeight) return null;
    
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
    
    const centerX = (minX + maxX) / 2;
    const eyeY = minY + (maxY - minY) * 0.35;
    
    return {
        x: centerX,
        y: eyeY,
        normalizedY: eyeY / canvas.height
    };
}

// Process video frame
function processFrame() {
    if (!isTracking) return;
    
    const facePos = detectFacePosition();
    
    if (facePos) {
        if (baselineY === null) {
            baselineY = facePos.normalizedY;
            status.textContent = 'Baseline set! Look up/down to scroll.';
            status.className = 'status success';
            requestAnimationFrame(processFrame);
            return;
        }
        
        const deltaY = facePos.normalizedY - baselineY;
        const threshold = sensitivity / 200;
        
        const now = Date.now();
        if (Math.abs(deltaY) > threshold && (now - lastScrollTime) > SCROLL_THROTTLE_MS) {
            const scrollAmount = Math.round(Math.abs(deltaY) * scrollSpeed * 20);
            
            if (deltaY > 0) {
                sendScrollCommand('down', scrollAmount);
            } else {
                sendScrollCommand('up', scrollAmount);
            }
            
            lastScrollTime = now;
        }
    } else {
        if (baselineY !== null) {
            status.textContent = 'Face not detected. Position yourself in front of camera.';
            status.className = 'status error';
        }
    }
    
    requestAnimationFrame(processFrame);
}

// Send scroll command to content script
function sendScrollCommand(direction, amount) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'scroll',
                direction: direction,
                amount: amount
            }).catch(err => {
                console.log('Could not send message to tab:', err);
            });
        }
    });
}

// Initialize camera
async function initCamera() {
    try {
        status.textContent = 'Requesting camera access...';
        status.className = 'status info';
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('getUserMedia is not supported');
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            }
        });
        
        video.srcObject = stream;
        
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Video timeout'));
            }, 5000);
            
            video.onloadedmetadata = () => {
                clearTimeout(timeout);
                video.play().then(() => {
                    canvas.width = video.videoWidth || 640;
                    canvas.height = video.videoHeight || 480;
                    resolve();
                }).catch(reject);
            };
            
            video.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Video playback error'));
            };
        });
        
        status.textContent = 'Camera ready! Setting baseline...';
        status.className = 'status success';
        
        isTracking = true;
        baselineY = null;
        stopBtn.style.display = 'inline-block';
        
        processFrame();
        
    } catch (error) {
        console.error('Camera error:', error);
        let errorMsg = 'Error: Could not access camera. ';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            errorMsg = 'Camera permission denied.\n\n';
            errorMsg += 'Please:\n';
            errorMsg += '1. Click the camera icon in the address bar\n';
            errorMsg += '2. Select "Allow" for camera access\n';
            errorMsg += '3. Refresh this page and try again';
        } else if (error.name === 'NotFoundError') {
            errorMsg = 'No camera found. Please connect a camera.';
        } else {
            errorMsg += error.message || 'Unknown error';
        }
        
        status.textContent = errorMsg;
        status.className = 'status error';
    }
}

// Stop tracking
stopBtn.addEventListener('click', () => {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    isTracking = false;
    baselineY = null;
    
    status.textContent = 'Tracking stopped.';
    status.className = 'status info';
    stopBtn.style.display = 'none';
    
    // Close window after a moment
    setTimeout(() => {
        window.close();
    }, 1000);
});

// Handle window close
window.addEventListener('beforeunload', () => {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
});

// Start on load
window.addEventListener('load', () => {
    initCamera();
});

