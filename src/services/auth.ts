import { auth } from "./firebase";
import {
    browserLocalPersistence,
    createUserWithEmailAndPassword, onAuthStateChanged,
    setPersistence,
    signInWithEmailAndPassword,
    signOut,
    getIdToken
} from "firebase/auth";

const registerUser = async (email: string, password: string) => {
    try {
        return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.log(error);
        throw new Error("Cannot create user");
    }
}

const login = async (email: string, password: string, rememberMe: boolean) => {
    try{
        if(rememberMe)await setPersistence(auth, browserLocalPersistence);
        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.log(error);
        throw new Error("Something went wrong");
    }
}

const logout = async () => {
    try{
        await signOut(auth);
    } catch (error) {
        console.log(error);
        throw new Error("Cannot logout");
    }
}

const getTokenId = (user: any) => {
    getIdToken(user).then(function(idToken) {
        // Send token to your backend via HTTPS
        // ...
        console.log(idToken);
    }).catch(function(error) {
        // Handle error
    });
}

const onAuthChange = (cb: any) => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/auth.user
            cb(user);
            getTokenId(user);
            // ...
        } else {
            // User is signed out
            // ...
            cb();
        }
    })
}

export { registerUser, login, logout, onAuthChange }