
const https = require('https');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";
// Yesterday (March 4th) had 65 matches. See if PL is there.
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
            console.log("SUCCESS:", json.success);
            if (json.data && json.data.length > 0) {
                const leagues = json.data.map(l => l.league?.name);
                console.log("LEAGUES_FOUND:", leagues);
                const pl = json.data.find(l => l.league?.name && l.league?.name.includes("Premier League"));
                if (pl) {
                    console.log("PREMIER_LEAGUE_FOUND!");
                    console.log(JSON.stringify(pl.league, null, 2));
                } else {
                    console.log("PREMIER_LEAGUE_NOT_FOUND_YESTERDAY");
                }
            }
        } catch (e) {
            console.error("Parse error:", e.message);
        }
    });
});
