import {useReducer, createContext, Context, FC, ReactElement} from "react";
// @ts-ignore
import { UserInfo } from "firebase";

interface GlobalStateTypes {
    user: UserInfo | {};
    globalSpinner: boolean
}

const initState: GlobalStateTypes = {
    user: undefined,
    globalSpinner: false
}

export const Ctx = createContext<GlobalStateTypes>(initState);

const stateReducer = (state: GlobalStateTypes, action: { type: string; payload: any; }) => {
    switch(action.type) {
        case 'ADD_USER':
            return {...state, user: action.payload}
        case 'REMOVE_USER':
            return state;
        case 'LOADING_TRUE':
            return {...state, globalSpinner: true};
        case 'LOADING_FALSE':
            return {...state, globalSpinner: false};
        default:
            return state
    }
}

const Provider = ({ children }: any) => {

    const [state, dispatch] = useReducer(stateReducer, initState);

    // @ts-ignore
    return <Ctx.Provider value={{state, dispatch}}>{children}</Ctx.Provider>
}

export default Provider;