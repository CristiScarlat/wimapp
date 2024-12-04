import {addEqPresetsToDB} from "../services/db";

export const eqFrequencyList: number[] = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

export interface EqPreset {
    name: string
    eq: {[freq: number]: number}
}

export const eqPresetsList: EqPreset[] = [
    {
        name: "Flat",
        eq: {
            60: 0,
            170: 0,
            310: 0,
            600: 0,
            1000: 0,
            3000: 0,
            6000: 0,
            12000: 0,
            14000: 0,
            16000: 0
        }
    },
    {
        name: "Loudness",
        eq: {
            60: 5,
            170: 4,
            310: 3,
            600: 2,
            1000: 0,
            3000: 2,
            6000: 3,
            12000: 4,
            14000: 5,
            16000: 6
        }
    }
]

export const saveEqPreset = async (userId: string, data: EqPreset[]) => {
    console.log(userId, data)
    // try{
    //     await addEqPresetsToDB(userId, data);
    // }
    // catch(err){
    //     throw err;
    // }
}

//TODO get eq presets form firestore and merge with eqPresetsList
export const getEqPreset = async (userId: string) => {
    console.log(">>>>>>>>>>>", userId)
    return eqPresetsList;
}

