const apiPath = 'https://fi1.api.radio-browser.info/json';

export const getAllStations = async (limit: number, offset: number) => {
    console.log(process.env)
    try{
        const res = await fetch(`${apiPath}/stations?limit=${limit}&offset=${offset}`, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}

export const getStationsByTagName = async (tagName: string, limit: number, offset: number) => {
    try{
        const res = await fetch(`${apiPath}/stations/bytag/${tagName}?limit=${limit}&offset=${offset}`,{
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}

export const getStationsByStationName = async (stationName: string, limit: number, offset: number) => {
    try{
        const res = await fetch(`${apiPath}/stations/byname/${stationName}?limit=${limit}&offset=${offset}`, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}

export const getStationsById = async (id: string) => {
    try{
        const res = await fetch(`${apiPath}/stations/byuuid/${id}`,{
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}

export const getAllTags = async () => {
    try{
        const res = await fetch(`https://fi1.api.radio-browser.info/json/tags`,{
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}

export const getListOfCountries = async () => {
    try{
        const res = await fetch(`https://fi1.api.radio-browser.info/json/countries`,{
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}

export const getStationsByCountry = async(countryCode: string, limit: number, offset: number) => {
    try{
        const res = await fetch(`${apiPath}/stations/bycountrycodeexact/${countryCode}?limit=${limit}&offset=${offset}`,{
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return await res.json();
    }
    catch(error: any){
        console.error(error)
    }
}

export const getStationData = async(streamUrl: string) => {
    try{
        const res = await fetch(`${apiPath}/iradiodata?streamUrl=${streamUrl}`,{
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
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
