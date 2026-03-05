
const https = require('https');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";
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
                const pl = json.data.find(l => l.league?.name && l.league?.name.includes("Premier League"));
                if (pl) {
                    console.log("PREMIER_LEAGUE_INFO:");
                    console.log(JSON.stringify(pl.league, null, 2));
                }
            }
        } catch (e) {
            console.error("Parse error.");
        }
    });
});
