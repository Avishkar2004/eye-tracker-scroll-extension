# Commit Message

```
feat: Add eye tracker browser extension for hands-free scrolling

- Implement browser extension for Brave/Chrome that tracks head movement
- Use face detection to detect vertical head position (up/down)
- Automatically scroll web pages based on head movement direction
- Add separate camera window to handle permission prompts properly
- Include adjustable sensitivity and scroll speed controls
- Support smooth scrolling animation on target web pages
- Add comprehensive error handling and debug information
- Create extension icons and setup documentation

Features:
- Real-time face detection using canvas-based image processing
- Baseline calibration for neutral head position
- Throttled scroll commands to prevent excessive scrolling
- Settings persistence using Chrome storage API
- Works offline without external dependencies

Technical details:
- Manifest V3 compatible
- Content Security Policy compliant (no external scripts)
- Separate camera window to bypass popup permission limitations
- Content script injection for page scrolling
- Background service worker for extension coordination
```

