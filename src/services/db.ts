import {db} from "./firebase";
import {doc, setDoc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove, query, collection, orderBy, limit, startAfter, endBefore, where} from "firebase/firestore";
import {EqPreset} from "../data/playerPreset";

let lastVisible: any = null; // Store last document for pagination

export const getAllStations = async () => {
    try{
        const data: any[] = [];
        const q = query(collection(db, "radioStations"), orderBy("name"));
        // @ts-ignore
        const docSnap = await getDocs(q);

        //@ts-ignore
        docSnap.forEach(snapshot => {
            data.push(snapshot.data())
        });
        return data
    }
    catch(e){
        throw e;
    }
}

export const getAllStationsPaginated = async ({
                                                  pageLimit,
                                                  direction,
                                                  cursorDoc,
                                              }: {
    pageLimit: number;
    direction: "next" | "prev" | "initial";
    cursorDoc: any | null; // Firestore document snapshot for pagination
}) => {
    try {
        const data: any[] = [];
        const baseRef = collection(db, "radioStations");
        let q;

        if (direction === "initial") {
            // First page
            q = query(baseRef, orderBy("name"), limit(pageLimit));
        } else if (direction === "next" && cursorDoc) {
            // Next page
            q = query(baseRef, orderBy("name"), startAfter(cursorDoc), limit(pageLimit));
        } else if (direction === "prev" && cursorDoc) {
            // Previous page (read backwards, then reverse)
            q = query(baseRef, orderBy("name"), endBefore(cursorDoc), limit(pageLimit));
        } else {
            throw new Error("Invalid pagination parameters");
        }

        const docSnap = await getDocs(q);

        if (direction === "prev") {
            // Reverse the order for previous page
            docSnap.docs.reverse();
        }

        docSnap.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));

        const firstVisible = docSnap.docs[0] || null;
        const lastVisible = docSnap.docs[docSnap.docs.length - 1] || null;

        return {
            data,
            firstVisible, // For "prev" calls
            lastVisible,  // For "next" calls
            hasData: docSnap.size > 0,
        };
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