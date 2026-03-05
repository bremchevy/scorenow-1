
const https = require('https');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";
// Test leagues endpoint
const url = "https://api.sportsrc.org/v2/?type=leagues&sport=football";

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
            console.log("LEAGUES_FETCH_SUCCESS:", json.success);
            const leagues = json.data || json.leagues || [];
            console.log("TOTAL_LEAGUES_FOUND:", leagues.length);

            const pl = leagues.find(l => l.name && l.name.includes("Premier League"));
            if (pl) {
                console.log("PREMIER_LEAGUE_FOUND:");
                console.log(JSON.stringify(pl, null, 2));
            } else {
                console.log("PREMIER_LEAGUE_NOT_FOUND_IN_LIST");
                if (leagues.length > 0) {
                    console.log("SAMPLE_LEAGUES:", leagues.slice(0, 5).map(l => l.name));
                }
            }
        } catch (e) {
            console.error("Parse error:", e.message);
            console.log("RAW_DATA_START:", data.substring(0, 200));
        }
    });
}).on('error', (err) => {
    console.error("Request error:", err.message);
});
