
const https = require('https');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";
// Check tomorrow (March 6th) and Saturday (March 7th)
const dates = ["2026-03-06", "2026-03-07"];

async function checkDate(date) {
    return new Promise((resolve) => {
        const url = `https://api.sportsrc.org/v2/?type=matches&sport=football&status=upcoming&date=${date}`;
        const options = {
            headers: {
                'X-API-KEY': API_KEY,
                'User-Agent': 'Mozilla/5.0'
            }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log(`DATE ${date}: success=${json.success}, matches=${json.total_matches}`);
                    resolve(json);
                } catch (e) {
                    console.log(`DATE ${date}: Parse error`);
                    resolve(null);
                }
            });
        }).on('error', (e) => {
            console.log(`DATE ${date}: Request error ${e.message}`);
            resolve(null);
        });
    });
}

async function run() {
    for (const d of dates) {
        await checkDate(d);
    }
}

run();
