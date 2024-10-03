const { writeFileSync } = require("fs");
const stations = require("./stations.json");

async function main() {
    const list = await Promise.allSettled(stations.map(station => {
        if(station?.url && station?.url.includes("http")){
            return fetch(station?.url, {method: "HEAD"})
        }
        else return new Promise((resolve) => resolve())
    }))
    const data = list.map(obj => ({genre: obj.value?.headers.get('Icy-Genre')}));
    const completeData = stations.map((station, index) => {
        return {
            ...station,
            ...data[index]
        }
    })
    writeFileSync("./stations-new.json", JSON.stringify(completeData.filter(obj => obj.genre)))
}

main()