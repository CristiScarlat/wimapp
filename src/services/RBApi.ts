export const getAllStations = async (limit: number, offset: number) => {
    try{
        const res = await fetch(`http://de1.api.radio-browser.info/json/stations?limit=${limit}&offset=${offset}&hidebroken=true`);
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}

export const getStationsByTagName = async (tagName: string, limit: number, offset: number) => {
    try{
        const res = await fetch(`http://de1.api.radio-browser.info/json/stations/bytag/${tagName}?limit=${limit}&offset=${offset}`);
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}
