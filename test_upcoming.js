
const https = require('https');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";
// Test upcoming without date
const url = "https://api.sportsrc.org/v2/?type=matches&sport=football&status=upcoming";

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
            console.log("UPCOMING_WITHOUT_DATE_SUCCESS:", json.success);
            console.log("TOTAL_MATCHES:", json.total_matches);
            if (json.data && json.data.length > 0) {
                console.log("FIRST_LEAGUE:", json.data[0].league?.name);
                console.log("FIRST_MATCH:", json.data[0].matches?.[0]?.title);
            }
        } catch (e) {
            console.error("Parse error:", e.message);
        }
    });
}).on('error', (err) => {
    console.error("Request error:", err.message);
});
