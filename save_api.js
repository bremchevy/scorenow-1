
const https = require('https');
const fs = require('fs');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";
// Fetch inprogress WITHOUT date to see what fields match
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
            fs.writeFileSync('api_response.json', JSON.stringify(json, null, 2));
            console.log("SUCCESS: Written to api_response.json");
        } catch (e) {
            console.error("Parse error:", e.message);
            fs.writeFileSync('api_response_raw.txt', data);
        }
    });
}).on('error', (err) => {
    console.error("Request error:", err.message);
});
