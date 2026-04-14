/**
 * Integration test: POST /api/licenses/scan
 * Uses a synthetically generated FL Registered Nurse license image.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'http://localhost:3000';
const b64Path = path.join(__dirname, '..', 'test-license.b64');

if (!fs.existsSync(b64Path)) {
  console.error('Run `node generate-test-image.js` first to create test-license.b64');
  process.exit(1);
}

const image = fs.readFileSync(b64Path, 'utf8').trim();

const body = JSON.stringify({ image, mimeType: 'image/png' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/licenses/scan',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};

console.log('Sending POST /api/licenses/scan ...\n');

const req = require('http').request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch {
      console.log(data);
    }
  });
});

req.on('error', (e) => console.error('Request error:', e.message));
req.write(body);
req.end();
