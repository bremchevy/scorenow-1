
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
            console.log("FULL_API_RESPONSE_START");
            console.log(JSON.stringify(json, null, 2));
            console.log("FULL_API_RESPONSE_END");
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
