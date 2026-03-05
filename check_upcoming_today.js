
const https = require('https');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";
// Today
const url = "https://api.sportsrc.org/v2/?type=matches&sport=football&status=upcoming&date=2026-03-05";

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
            console.log("UPCOMING_TODAY_SUCCESS:", json.success);
            console.log("TOTAL_MATCHES:", json.total_matches);
            if (json.data && json.data.length > 0) {
                console.log("LEAGUES:", json.data.map(l => l.league?.name));
            }
        } catch (e) {
            console.error("Parse error.");
        }
    });
});
