import {db} from "./firebase";
import {doc, setDoc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove, query, collection, orderBy, limit, startAfter, endBefore, where} from "firebase/firestore";
import {EqPreset} from "../data/playerPreset";

const baseURL = process.env.NODE_ENV === "production" ? process.env.REACT_APP_API_PATH : "http://localhost:3000/iRadio";

let lastVisible: any = null; // Store last document for pagination

export const getStationMetaData = async (streamUrl: string) => {
    try{
        const res = await fetch(`${baseURL}/station-data`, {
            method: "POST",
             headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({streamUrl})
        });
        const data = await res.json()
        return data
    }
    catch(error) {
        console.error(error);
        throw new Error("Could not fetch station data");
    }
}

export const getAllStationsPaginated = async (pageSize: number, pageNo: number) => {
    try {
        const res = await fetch(`${baseURL}/stations?limit=${pageSize}&page=${pageNo}`);
        const data = await res.json()
        return data
    } catch (error) {
        console.error(error);
        throw new Error("Could not fetch paginated data");
    }
};


export const getStationsByName = async (name: string, pageLimit: number, offset: number) => {
    if(offset === 0)lastVisible = null;
    try {
        const data: any[] = [];
        let q = null;
        if(lastVisible){
            q = query(collection(db, "radioStations"),
                orderBy("name"),
                where("name", ">", name),
                startAfter(lastVisible),
                limit(pageLimit));
        }
        else {
            //@ts-ignore
            q = query(collection(db, "radioStations"), orderBy("name"), where("name", ">", name), limit(pageLimit));

        }
        // @ts-ignore
        const docSnap = await getDocs(q);

        // Get the last visible document
        lastVisible = docSnap.docs[docSnap.docs.length-1];

        //@ts-ignore
        docSnap.forEach(snapshot => {
            data.push(snapshot.data())
        });
        return data
    } catch (error) {
        console.log(error)
        throw new Error("Could not read data from db")
    }
}

export const getStationsByTag = async (tag: string, pageLimit: number, offset: number) => {
    if(offset === 0)lastVisible = null;
    try {
        const data: any[] = [];
        let q = null;
        if(lastVisible){
            q = query(collection(db, "radioStations"),
                where("tags", "array-contains-any", [tag]),
                startAfter(lastVisible),
                limit(pageLimit));
        }
        else {
            //@ts-ignore
            q = query(collection(db, "radioStations"), where("tags", "array-contains-any", [tag]), limit(pageLimit));

        }
        // @ts-ignore
        const docSnap = await getDocs(q);

        // Get the last visible document
        lastVisible = docSnap.docs[docSnap.docs.length-1];

        //@ts-ignore
        docSnap.forEach(snapshot => {
            data.push(snapshot.data())
        });
        return data
    } catch (error) {
        console.log(error)
        throw new Error("Could not read data from db")
    }
}

export const getStationsByCountry = async (countrycode: string, pageLimit: number, offset: number) => {
    if(offset === 0)lastVisible = null;
    try {
        const data: any[] = [];
        let q = null;
        if(lastVisible){
            q = query(collection(db, "radioStations"),
                orderBy("name"),
                where("countrycode", "==", countrycode),
                startAfter(lastVisible),
                limit(pageLimit));
        }
        else {
            //@ts-ignore
            q = query(collection(db, "radioStations"), orderBy("name"), where("countrycode", "==", countrycode), limit(pageLimit));

        }
        // @ts-ignore
        const docSnap = await getDocs(q);

        // Get the last visible document
        lastVisible = docSnap.docs[docSnap.docs.length-1];

        //@ts-ignore
        docSnap.forEach(snapshot => {
            data.push(snapshot.data())
        });
        return data
    } catch (error) {
        console.log(error)
        throw new Error("Could not read data from db")
    }
}


export const addFavoriteStationToDB = async (userId: string, stationId: string) => {
    if (userId) {
        try {
            const id = new Date().getTime();
            const docsRef = doc(db, 'wimapp', userId);
            const docsSnap = await getDoc(docsRef);
            if (docsSnap.exists()) {
                await updateDoc(docsRef, {favorites: arrayUnion(stationId)});
            } else {
                // docSnap.data() will be undefined in this case
                await setDoc(docsRef, {favorites: arrayUnion(stationId)});
            }

        } catch (error) {
            console.log(error)
            throw new Error("Could not write data to db")
        }
    }
}

export const removeFavoriteStationFromDB = async (userId: string, stationId: string) => {
    if (userId) {
        try {
            const id = new Date().getTime();
            const docsRef = doc(db, 'wimapp', userId);
            await updateDoc(docsRef, {favorites: arrayRemove(stationId)});
        } catch (error) {
            console.log(error)
            throw new Error("Could not write data to db")
        }
    }
}

export const getFavoriteStationsToDB = async (userId: string) => {
    if (userId) {
        try {
            const docsRef = doc(db, 'wimapp', userId);
            const docSnap = await getDoc(docsRef);
            return docSnap.get("favorites")
        } catch (error) {
            throw new Error("Could not read data from db")
        }
    }
}

export const getEqPresetsFromDB = async (userId: string) => {
    if (userId) {
        try {
            const docsRef = doc(db, 'wimapp', userId);
            const docSnap = await getDoc(docsRef);
            const res = docSnap.get("equalizer");
            if (res) return Object.values(res);
            return [];
        } catch (error) {
            throw new Error("Could not read data from db")
        }
    }
}

const arrayToMap = (arr: any[]) => {
    const obj = {}
    // @ts-ignore
    arr.forEach((item: any, index: number) => obj[index] = item)
    return obj
}

export const saveEqPresetsToDB = async (userId: string, eqPresetsData: EqPreset[]) => {
    if (userId) {
        try {
            const docsRef = doc(db, 'wimapp', userId);
            await setDoc(docsRef, {equalizer: arrayToMap(eqPresetsData)}, {merge: true});
        } catch (error) {
            console.log(error)
            throw new Error("Could not write data to db")
        }
    }
}