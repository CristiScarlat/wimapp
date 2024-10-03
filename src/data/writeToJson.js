const fs = require("fs");
const path = require("path");
const json = require("./stations.json");

function main(){
    const extractedList = [];
    const txtFile = process.argv[2];
    const txt = fs.readFileSync(path.resolve(__dirname, txtFile), {encoding: "utf-8"});
    const lines = txt.split('\n');
    let genId = 0;
    lines.forEach((line, index) => {
        if(!line.includes("#")){
            const [name, link] = line.split("]");
            const formatedName = name.trim().slice(1);
            const obj = {
                id: genId,
                name: formatedName,
                url: link
            };
            if(name && name !== "" && !extractedList.find(a => a.url === obj.url)){
                extractedList.push(obj);
                genId++;
            }
        }
    })
    console.log(extractedList.length)
    fs.writeFileSync("./stations.json", JSON.stringify(extractedList));
}

main();