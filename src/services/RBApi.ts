export const getAllStations = async (limit: number, offset: number) => {
    try{
        const res = await fetch(`https://de1.api.radio-browser.info/json/stations?limit=${limit}&offset=${offset}&hidebroken=true`);
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}

export const getStationsByTagName = async (tagName: string, limit: number, offset: number) => {
    try{
        const res = await fetch(`https://de1.api.radio-browser.info/json/stations/bytag/${tagName}?limit=${limit}&offset=${offset}`);
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}

export const getStationsByStationName = async (stationName: string, limit: number, offset: number) => {
    try{
        const res = await fetch(`https://de1.api.radio-browser.info/json/stations/byname/${stationName}?limit=${limit}&offset=${offset}`);
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}

export const getStationsById = async (id: string) => {
    try{
        const res = await fetch(`https://de1.api.radio-browser.info/json/stations/byuuid/${id}`);
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}

export const getAllTags = async () => {
    try{
        const res = await fetch(`https://de1.api.radio-browser.info/json/tags`);
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}

export const getListOfCountries = async () => {
    try{
        const res = await fetch(`https://at1.api.radio-browser.info/json/countries`);
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}

export const getStationsByCountry = async(country: string, limit: number, offset: number) => {
    try{
        const res = await fetch(`https://at1.api.radio-browser.info/json/stations/bycountrycodeexact/${country}?limit=${limit}&offset=${offset}`);
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}


export const formatStationData = (obj: any) => {
    return {
        id: obj.stationuuid,
        name: obj.name.trim() === "" ? "no name" : obj.name.trim(),
        url: obj.url_resolved,
        genre: obj.tags,
        country: obj.country,
        countryCode: obj.countrycode,
        homepage: obj.homepage,
        bitrate: obj.bitrate,
        favicon: obj.favicon
    }
}
