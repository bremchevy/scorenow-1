
const https = require('https');

const API_KEY = "8ef1239a6e2834839f41081a29140cda";
// Fetching all statuses for today to see what we get
const url = "https://api.sportsrc.org/v2/?type=matches&sport=football&status=all&date=2026-03-05";

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
            const matches = json.data || json.matches || [];
            console.log("TOTAL_MATCHES:", matches.length);

            if (matches.length > 0) {
                // Find the one that might be the AFC Women's Asian Cup
                const afcMatch = matches.find(m =>
                    (m.league_name && m.league_name.includes("ASIAN CUP")) ||
                    (m.league && m.league.name && m.league.name.includes("ASIAN CUP"))
                );

                if (afcMatch) {
                    console.log("AFC_MATCH_FOUND:");
                    console.log(JSON.stringify(afcMatch, null, 2));
                } else {
                    console.log("AFC_MATCH_NOT_FOUND_IN_TOP_RESULTS");
                    console.log("FIRST_MATCH_SAMPLE:");
                    console.log(JSON.stringify(matches[0], null, 2));
                }
            }

            // Also check for Premier League in the whole list
            const plMatches = matches.filter(m =>
                (m.league_name && m.league_name.includes("Premier League")) ||
                (m.league && m.league.name && m.league.name.includes("Premier League"))
            );
            console.log("PREMIER_LEAGUE_MATCHES_TODAY:", plMatches.length);

        } catch (e) {
            console.error("Parse error:", e.message);
        }
    });
}).on('error', (err) => {
    console.error("Request error:", err.message);
});
