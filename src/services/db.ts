import { db } from "./firebase";
import { doc, setDoc, getDoc, updateDoc, deleteField, arrayUnion, arrayRemove } from "firebase/firestore";
import {isDocument} from "@testing-library/user-event/dist/utils";
import {EqPreset} from "../data/playerPreset";


export const addFavoriteStationToDB = async (userId: string, stationId: string) => {
    if(userId){
        try{
            const id = new Date().getTime();
            const docsRef = doc(db, 'wimapp', userId);
            const docsSnap = await getDoc(docsRef);
            if (docsSnap.exists()) {
                await updateDoc(docsRef, {favorites: arrayUnion(stationId)});
            } else {
                // docSnap.data() will be undefined in this case
                console.log("No such document!");
                await setDoc(docsRef, {favorites: arrayUnion(stationId)});
            }

        }
        catch(error){
            console.log(error)
            throw new Error("Could not write data to db")
        }
    }
}

export const removeFavoriteStationFromDB = async (userId: string, stationId: string) => {
    if(userId){
        try{
            const id = new Date().getTime();
            const docsRef = doc(db, 'wimapp', userId);
            await updateDoc(docsRef, {favorites: arrayRemove(stationId)});
        }
        catch(error){
            console.log(error)
            throw new Error("Could not write data to db")
        }
    }
}

export const getFavoriteStationsToDB = async (userId: string) => {
    if(userId){
        try{
            const docsRef = doc(db, 'wimapp', userId);
            const docSnap = await getDoc(docsRef);
            return docSnap.get("favorites")
        }
        catch(error){
            throw new Error("Could not read data from db")
        }
    }
}

export const getEqPresetsFromDB = async (userId: string) => {
    if(userId){
        try{
            const docsRef = doc(db, 'wimapp', userId);
            const docSnap = await getDoc(docsRef);
            return docSnap.get("equalizer")
        }
        catch(error){
            throw new Error("Could not read data from db")
        }
    }
}

export const addEqPresetsToDB = async (userId: string, eqPresetData: EqPreset) => {
    if(userId){
        try{
            const id = new Date().getTime();
            const docsRef = doc(db, 'wimapp', userId);
            const docsSnap = await getDoc(docsRef);
            if (docsSnap.exists()) {
                await updateDoc(docsRef, {equalizer: arrayUnion(eqPresetData)});
            } else {
                // docSnap.data() will be undefined in this case
                console.log("No such document!");
                await setDoc(docsRef, {equalizer: arrayUnion(eqPresetData)});
            }

        }
        catch(error){
            console.log(error)
            throw new Error("Could not write data to db")
        }
    }
}