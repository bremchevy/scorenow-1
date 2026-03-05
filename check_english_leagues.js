
const https = require('https');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";
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
                const names = json.data.map(l => l.league?.name || "Unknown");
                console.log("LEAGUE_LIST:");
                names.forEach(n => console.log(` - ${n}`));

                const pl = names.some(n => n.toLowerCase().includes("premier league"));
                const efl = names.some(n => n.toLowerCase().includes("championship") || n.toLowerCase().includes("efl"));
                const fa = names.some(n => n.toLowerCase().includes("fa cup"));

                console.log("\nVERDICT:");
                console.log("Premier League found:", pl);
                console.log("EFL/Championship found:", efl);
                console.log("FA Cup found:", fa);
            } else {
                console.log("No data found for yesterday.");
            }
        } catch (e) {
            console.error("Parse error.");
        }
    });
});
