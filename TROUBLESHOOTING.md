# Troubleshooting CSP Issues

If you're still getting Content Security Policy errors, here are alternative solutions:

## Option 1: Use a Different CDN (Unpkg)

The CSP might work better with unpkg.com. Update `popup.js` to use:
- `https://unpkg.com/@mediapipe/camera_utils/camera_utils.js`
- `https://unpkg.com/@mediapipe/control_utils/control_utils.js`
- `https://unpkg.com/@mediapipe/drawing_utils/drawing_utils.js`
- `https://unpkg.com/@mediapipe/face_mesh/face_mesh.js`

And update manifest.json CSP to include:
```json
"content_security_policy": {
  "extension_pages": "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' https://unpkg.com; script-src-elem 'self' https://unpkg.com; object-src 'self'"
}
```

## Option 2: Download Libraries Locally

1. Download the MediaPipe files and place them in the extension folder
2. Update popup.js to load from local files instead of CDN
3. This avoids CSP issues entirely

## Option 3: Use TensorFlow.js Instead

TensorFlow.js might have better extension compatibility. This would require rewriting the face detection code.

## Current Status

The manifest.json has been updated with a CSP that should allow jsdelivr.net. Make sure to:
1. Reload the extension completely
2. Close and reopen the popup
3. Check the browser console for any remaining errors

