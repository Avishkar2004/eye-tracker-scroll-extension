# Eye Tracker Scroll Extension

A browser extension for Brave/Chrome that tracks your eye movement using your webcam and scrolls web pages when you look up or down.

## Features

- Real-time eye tracking using MediaPipe Face Mesh
- Smooth scrolling based on vertical eye movement
- Adjustable sensitivity and scroll speed
- Works on any website

## Installation

1. **Download or clone this repository**

2. **Open Brave Browser** (or Chrome)

3. **Navigate to Extensions:**
   - Type `brave://extensions/` in the address bar (or `chrome://extensions/` for Chrome)
   - Enable "Developer mode" (toggle in the top right)

4. **Load the extension:**
   - Click "Load unpacked"
   - Select the folder containing this extension

5. **Grant camera permissions:**
   - The extension will request camera access when you first use it
   - Click "Allow" to enable eye tracking

## Usage

1. **Open any webpage** you want to scroll

2. **Click the extension icon** in your browser toolbar

3. **Click "Start Tracking"** in the popup window

4. **Position yourself** so your face is clearly visible in the camera view

5. **Look up** to scroll up, **look down** to scroll down

6. **Adjust settings:**
   - **Sensitivity**: Controls how much eye movement is needed to trigger scrolling (1-10)
   - **Scroll Speed**: Controls how fast the page scrolls (1-10)

7. **Click "Stop Tracking"** when done

## How It Works

- Uses computer vision to detect your face position
- Tracks the vertical position of your face/eyes
- Compares current position to a baseline (your neutral gaze)
- Sends scroll commands to the webpage when you look up or down
- Uses smooth scrolling animation for a better user experience

**Note:** This version uses a simpler face detection method that works entirely offline without external libraries. For more accurate tracking, you can download MediaPipe libraries locally (see Advanced Setup below).

## Requirements

- Brave Browser or Google Chrome
- Webcam/camera
- No internet connection required (works offline)

## Troubleshooting

### Camera Issues

- **Camera not working**: 
  1. Make sure you've granted camera permissions to the extension (not just to websites like Google Meet)
  2. Go to `brave://settings/content/camera` (or `chrome://settings/content/camera`) and ensure the extension has permission
  3. Click the extension icon, then click "Start Tracking" - you should see a permission prompt
  4. Check the debug info in the popup for specific error messages

- **"MediaPipe libraries not loaded" error**:
  1. Check your internet connection (MediaPipe loads from CDN)
  2. Open browser console (F12) and check for script loading errors
  3. Try reloading the extension

- **"getUserMedia not supported"**:
  - Make sure you're using a modern browser (Brave/Chrome)
  - The extension requires HTTPS or localhost (extension popups should work)

### Tracking Issues

- **Not scrolling**: 
  - Check that you're looking directly at the camera and your face is well-lit
  - Wait a moment after starting tracking for the baseline to be set
  - Try adjusting the sensitivity slider (lower = more sensitive)

- **Too sensitive/not sensitive enough**: 
  - Adjust the sensitivity slider in the popup (1-10)
  - Lower values = more sensitive (scrolls with smaller eye movements)
  - Higher values = less sensitive (requires larger eye movements)

- **Scrolling too fast/slow**: 
  - Adjust the scroll speed slider (1-10)
  - Higher values = faster scrolling

## Privacy

- All processing happens locally in your browser
- No data is sent to external servers
- Camera feed is only used for eye tracking and is not recorded or transmitted

## Notes

- The extension requires good lighting for accurate face detection
- Works best when you're facing the camera directly with good lighting
- May require calibration - the extension sets a baseline when you first start tracking
- The current version uses basic face detection. For more accurate eye tracking, consider using MediaPipe libraries locally (see Advanced Setup)

## Advanced Setup (Optional - Better Accuracy)

For more accurate eye tracking, you can download MediaPipe libraries locally:

1. Download the MediaPipe files and place them in a `libs/` folder
2. Update `popup.js` to load from local files instead of CDN
3. This provides more accurate eye landmark detection

However, the current version should work well for basic up/down scrolling based on head movement.

