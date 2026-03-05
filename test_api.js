
const API_KEY = "8ef1239a6e2834839f41081a29140cda";
const url = "https://api.sportsrc.org/v2?sport=football&status=inprogress";

async function test() {
    try {
        const res = await fetch(url, {
            headers: { "X-API-KEY": API_KEY }
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
