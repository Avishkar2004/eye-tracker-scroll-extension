// Script to download MediaPipe libraries locally
// Run this with Node.js: node download_libraries.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const libraries = [
    {
        url: 'https://unpkg.com/@mediapipe/camera_utils/camera_utils.js',
        file: 'libs/camera_utils.js'
    },
    {
        url: 'https://unpkg.com/@mediapipe/control_utils/control_utils.js',
        file: 'libs/control_utils.js'
    },
    {
        url: 'https://unpkg.com/@mediapipe/drawing_utils/drawing_utils.js',
        file: 'libs/drawing_utils.js'
    },
    {
        url: 'https://unpkg.com/@mediapipe/face_mesh/face_mesh.js',
        file: 'libs/face_mesh.js'
    }
];

function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${filepath}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

async function downloadAll() {
    console.log('Downloading MediaPipe libraries...');
    try {
        for (const lib of libraries) {
            await downloadFile(lib.url, lib.file);
        }
        console.log('All libraries downloaded successfully!');
        console.log('Update popup.js to load from local files instead of CDN.');
    } catch (error) {
        console.error('Error downloading libraries:', error);
    }
}

downloadAll();

