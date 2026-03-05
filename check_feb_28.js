
const https = require('https');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";
// Saturday Feb 28th, 2026
const url = "https://api.sportsrc.org/v2/?type=matches&sport=football&status=finished&date=2026-02-28";

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
            if (json.data && json.data.length > 0) {
                const names = json.data.map(l => l.league?.name || "Unknown");
                console.log(`TOTAL_LEAGUES_ON_FEB_28: ${names.length}`);
                const pl = names.some(n => n.toLowerCase().includes("premier league"));
                console.log("Premier League found on Feb 28:", pl);
                if (!pl) {
                    console.log("LEAGUE_SAMPLES:", names.slice(0, 10));
                }
            } else {
                console.log("No data found for Feb 28.");
            }
        } catch (e) {
            console.error("Parse error.");
        }
    });
});
