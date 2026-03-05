
const https = require('https');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";
// March 4th
const url = "https://api.sportsrc.org/v2/?type=matches&sport=football&status=finished&date=2026-03-04";

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
                console.log("ALL_LEAGUES_YESTERDAY:");
                json.data.forEach(l => {
                    console.log(` - ${l.league?.name} (${l.league?.country})`);
                });
            }
        } catch (e) {
            console.error("Parse error.");
        }
    });
});
