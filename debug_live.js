
const https = require('https');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";
const url = "https://api.sportsrc.org/v2/?type=matches&sport=football&status=inprogress";

const options = {
    headers: {
        'X-API-KEY': API_KEY
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
            const matches = Array.isArray(json) ? json : (json.data || json.matches || []);

            console.log("MATCH_COUNT:", matches.length);
            if (matches.length > 0) {
                const m = matches[0];
                console.log("SAMPLE_MATCH_KEYS:", Object.keys(m));
                console.log("SAMPLE_MATCH_JSON:");
                console.log(JSON.stringify(m, null, 2));
            } else {
                console.log("NO_MATCHES_FOUND");
                console.log("FULL_RESPONSE:", JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error("Parse error:", e.message);
            console.log("RAW_DATA_START");
            console.log(data.substring(0, 1000));
            console.log("RAW_DATA_END");
        }
    });
}).on('error', (err) => {
    console.error("Request error:", err.message);
});
