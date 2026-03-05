
const http = require('http');

async function checkLocalApi(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:3000${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function verify() {
    console.log("Checking LIVE matches through local proxy...");
    try {
        const live = await checkLocalApi('/api/matches?status=inprogress');
        console.log("LIVE_RESPONSE_TYPE:", typeof live);
        console.log("LIVE_IS_ARRAY:", Array.isArray(live));

        // Since we are now flattening in the frontend utility, we should check if the PROXY returns what we expect.
        // Wait, the flattening happens in lib/sportsrc.ts (frontend) NOT in the proxy.
        // So the proxy will still return the grouping. We need to check if it's returning DATA at all.

        if (live && live.data) {
            console.log("PROXY_RETURNED_DATA: SUCCESS");
            console.log("LEAGUE_COUNT:", live.data.length);
            if (live.data.length > 0) {
                const firstLeague = live.data[0];
                console.log("FIRST_LEAGUE_NAME:", firstLeague.league?.name);
                console.log("MATCH_COUNT_IN_LEAGUE:", firstLeague.matches?.length);
            }
        } else {
            console.log("PROXY_RETURNED_NO_DATA or WRONG_FORMAT");
            console.log("RAW_LIVE:", JSON.stringify(live).substring(0, 500));
        }
    } catch (e) {
        console.error("FAILED to check local API:", e.message);
    }
}

verify();
