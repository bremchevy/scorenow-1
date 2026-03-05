
const https = require('https');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";
// Test a known busy day (Saturday)
const url = "https://api.sportsrc.org/v2/?type=matches&sport=football&status=upcoming&date=2026-03-07";

const options = {
    headers: {
        'X-API-KEY': API_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
};

https.get(url, options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("FETCH_SUCCESS:", json.success);
            console.log("TOTAL_MATCHES:", json.total_matches);
            if (json.data && json.data.length > 0) {
                console.log("LEAGUES_FOUND:", json.data.map(l => l.league?.name));
                const pl = json.data.find(l => l.league?.name && l.league?.name.includes("Premier League"));
                if (pl) {
                    console.log("PREMIER_LEAGUE_FOUND!");
                }
            }
        } catch (e) {
            console.error("Parse error:", e.message);
        }
    });
}).on('error', (err) => {
    console.error("Request error:", err.message);
});
