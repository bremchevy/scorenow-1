
const https = require('https');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";
// March 4th had 65 matches
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
            if (json.data) {
                const english = json.data.filter(l => l.league?.country === "England");
                console.log("ENGLISH_LEAGUES:");
                english.forEach(e => {
                    console.log(`${e.league.name}: ID=${e.league.id}`);
                });
            }
        } catch (e) {
            console.error("Parse error");
        }
    });
});
