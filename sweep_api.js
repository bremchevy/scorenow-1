
const https = require('https');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";

async function fetchDate(date, status = "upcoming") {
    return new Promise((resolve) => {
        const url = `https://api.sportsrc.org/v2/?type=matches&sport=football&status=${status}&date=${date}`;
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
                    resolve(JSON.parse(data));
                } catch {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

async function sweep() {
    console.log("Checking last 2 days...");
    for (let i = -2; i < 0; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const ds = d.toISOString().split('T')[0];
        const res = await fetchDate(ds, "finished");
        console.log(`FINISHED ${ds}: ${res?.total_matches ?? 0} matches`);
    }

    console.log("Checking next 7 days...");
    for (let i = 1; i <= 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const ds = d.toISOString().split('T')[0];
        const res = await fetchDate(ds, "upcoming");
        console.log(`UPCOMING ${ds}: ${res?.total_matches ?? 0} matches`);
        if (res?.data?.length > 0) {
            console.log(`   Sample League: ${res.data[0].league?.name}`);
        }
    }
}

sweep();
