
const https = require('https');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";
const url = "https://api.sportsrc.org/v2/?sport=football&status=inprogress";

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
            // Log the first match to see structure
            const matches = Array.isArray(json) ? json : json.matches || json.data || [];
            console.log("MATCH_STRUCTURE_START");
            console.log(JSON.stringify(matches[0] || json, null, 2));
            console.log("MATCH_STRUCTURE_END");
        } catch (e) {
            console.log("RAW_RESPONSE_START");
            console.log(data);
            console.log("RAW_RESPONSE_END");
            console.error("Parse error:", e.message);
        }
    });
}).on('error', (err) => {
    console.error("Request error:", err.message);
});
