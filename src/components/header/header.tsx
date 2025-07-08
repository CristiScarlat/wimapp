import {SyntheticEvent, useEffect, useState, useContext, useRef} from 'react';
import { Ctx } from '../../context/context';
import { RiArrowLeftCircleLine, RiArrowRightCircleLine } from 'react-icons/ri';
import "./header.css";
import {login, logout, onAuthChange, registerUser, resetPassword} from "../../services/auth";
import Spinner from "../spinner/spinner";
import ToggleButton from "../toggleButton/toggleButton";
import { UserCredential } from "firebase/auth";
import MobileFooter from "../mobileFooter/mobileFooter";
import { toast } from 'react-toastify';

const Header = () => {

    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formType, setFormType] = useState(true);

    const headerSidebarRef = useRef(null);
    const emailInputRef = useRef<HTMLInputElement>(null);

    //@ts-ignore
    const { state: { user }, dispatch } = useContext(Ctx);

    const handleAuthUser = (user: string) => {
        dispatch({type: "ADD_USER", payload: user});
    }

    useEffect(() => {
        onAuthChange(handleAuthUser)
        // window.addEventListener("click", (e: MouseEvent) => {
        //     console.dir(e.target)
        //     //@ts-ignore
        //     const {x} = headerSidebarRef?.current?.getBoundingClientRect();
        //     if(e.x <= x){
        //         setShow(false)
        //     }
        // })
    }, []);

    const handleSubmitAuth = (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        setLoading(true)
        const data: any = {}
        const formData = new FormData(e.currentTarget);
        //@ts-ignore
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        const email: string = data.email;
        const psw: string = data.password;
        if(formType){
            login(email, psw, false)
                .then(() => {
                    setLoading(false)
                })
                .catch((err) => {
                    console.error(err);
                    toast("Wow so easy!")
                    setLoading(false)
                });
        } else {
            const fullName: string = data.fullName;
            registerUser(email, psw)
                .then((data: UserCredential) => {
                    setLoading(false)
                })
                .catch((err) => {
                    console.error(err);
                    setLoading(false)
                });
        }

    }

    const handleSignout = () => {
        logout();
    }

    const handleFormType = () => {
        setFormType(!formType);
    }

    const handleForgotPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if(emailInputRef.current?.value && emailInputRef.current?.value !== ""){
            console.log("handle forgot password", emailInputRef.current?.value);
            resetPassword(emailInputRef.current?.value)
                .then(() => toast("Reset Password Email sent.", {type: "success"}))
                .catch(error => toast("Email could not be sent.", {type: "error"}));
        }
        else {
            console.log("toast error")
            toast("Please enter a valid email address", {type: "warning"});
        }

    }

    return (
        <header className="header-wrapper">
            <div className="header-logo">
                <svg width="34" height="39" viewBox="0 0 43 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.63422 45.7343C-4.61566 37.7343 8.75933 31.2343 13.2592 33.9843C13.3843 27.7343 13.2608 14.6379 13.1343 12.1093C13.0093 9.60925 15.301 7.73425 16.6343 7.10925C23.3427 5.02593 37.2593 0.709278 39.2593 0.109278C41.2593 -0.490722 42.5093 1.52594 42.8843 2.60928V35.2343C41.7593 39.2343 32.8843 45.8593 26.5093 39.3593C22.0093 29.2343 34.2593 27.1926 39.2593 28.6093C39.301 23.6509 39.3593 13.6093 39.2593 13.1093C39.1593 12.6093 38.551 12.4009 38.2593 12.3593C32.301 14.1926 20.0343 17.9593 18.6343 18.3593C17.2343 18.7593 16.7177 19.9426 16.6343 20.4843C16.676 27.3593 16.7343 41.1343 16.6343 41.2343C14.0093 49.1093 4.38434 47.8593 1.63422 45.7343Z" fill="#0E5D4E"/>
                </svg>
                WIMAPP
                <span style={{fontSize: 10, color: "#808080b3"}}>V3</span>
            </div>
            {/*<MobileFooter/>*/}
            <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
                {user && <button className="btn logout-btn" onClick={handleSignout}>
                    Logout
                </button>}
                <button className="header-sidebar-btn" onClick={() => setShow(true)}>
                    <svg width="30" height="30" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="34" height="34" rx="17" stroke="#0E5D4E" strokeWidth="2"/>
                        <path d="M15.8757 9.41331L7.3335 18L15.8757 26.5866C15.9529 26.688 16.0509 26.7715 16.1631 26.8316C16.2754 26.8918 16.3992 26.9271 16.5263 26.9352C16.6534 26.9433 16.7807 26.924 16.8997 26.8786C17.0187 26.8333 17.1265 26.7628 17.2159 26.6722C17.3053 26.5815 17.3742 26.4726 17.4179 26.353C17.4615 26.2334 17.479 26.1058 17.4691 25.9789C17.4592 25.8519 17.4221 25.7286 17.3604 25.6172C17.2986 25.5058 17.2137 25.409 17.1113 25.3333L10.7202 18.8889L27.7246 18.8889C27.9604 18.8889 28.1864 18.7952 28.3531 18.6285C28.5198 18.4618 28.6135 18.2357 28.6135 18C28.6135 17.7642 28.5198 17.5381 28.3531 17.3714C28.1864 17.2047 27.9604 17.1111 27.7246 17.1111L10.7202 17.1111L17.1113 10.6666C17.2775 10.4993 17.3704 10.2727 17.3695 10.0368C17.3687 9.80096 17.2742 9.57507 17.1068 9.40887C16.9394 9.24267 16.7129 9.14976 16.477 9.1506C16.2411 9.15143 16.0153 9.24593 15.8491 9.41331L15.8757 9.41331Z" fill="#0E5D4E"/>
                    </svg>
                </button>
            </div>
            <div id="header-sidebar" style={{width: show ? "20rem" : 0}} ref={headerSidebarRef}>
                <div className="header-sidebar-head">
                    <button className="header-sidebar-btn" onClick={() => setShow(false)}>
                        <svg width="30" height="30" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="-1" y="1" width="34" height="34" rx="17" transform="matrix(-1 0 0 1 34 0)" stroke="#0E5D4E" strokeWidth="2"/>
                            <path d="M20.1243 9.41331L28.6665 18L20.1243 26.5866C20.0471 26.688 19.9491 26.7715 19.8369 26.8316C19.7246 26.8918 19.6008 26.9271 19.4737 26.9352C19.3466 26.9433 19.2193 26.924 19.1003 26.8786C18.9813 26.8333 18.8735 26.7628 18.7841 26.6722C18.6947 26.5815 18.6258 26.4726 18.5821 26.353C18.5385 26.2334 18.521 26.1058 18.5309 25.9789C18.5408 25.8519 18.5779 25.7286 18.6396 25.6172C18.7014 25.5058 18.7863 25.409 18.8887 25.3333L25.2798 18.8889L8.27539 18.8889C8.03964 18.8889 7.81355 18.7952 7.64685 18.6285C7.48015 18.4618 7.3865 18.2357 7.3865 18C7.3865 17.7642 7.48015 17.5381 7.64685 17.3714C7.81355 17.2047 8.03964 17.1111 8.27539 17.1111L25.2798 17.1111L18.8887 10.6666C18.7225 10.4993 18.6296 10.2727 18.6305 10.0368C18.6313 9.80096 18.7258 9.57507 18.8932 9.40887C19.0606 9.24267 19.2871 9.14976 19.523 9.1506C19.7589 9.15143 19.9847 9.24593 20.1509 9.41331L20.1243 9.41331Z" fill="#0E5D4E"/>
                        </svg>
                    </button>
                </div>
                <div className="header-sidebar-body">
                    {user ? <div>
                        <span>{user.displayName || user.email}</span>
                            <button className="btn header-sidebar-logout-btn" onClick={handleSignout}>Logout</button>
                        </div>
                        :
                    <form onSubmit={handleSubmitAuth}>
                        <div className="form-header">
                            <span style={{color: formType ? "#381E06" : "gray"}}>Login</span>
                            <ToggleButton onChange={handleFormType}/>
                            <span style={{color: !formType ? "#381E06" : "gray"}}>Sign up</span>
                        </div>
                        <input name="email" type="email" placeholder="Email" ref={emailInputRef}/>
                        {!formType && <input name="fullName" type="text" placeholder="Full name" />}
                        <input name="password" type="password" placeholder="Password" />
                        <div className="d-flex">
                            <button className="player-control-btn icon-btn bg-default" type="submit">
                                {loading && <Spinner radius={10} stroke={3}/>}
                                <span>{formType ? "Login" : "Sign up"}</span>
                            </button>
                            {formType && <button className="link-btn" onClick={handleForgotPassword}>Forgot your password?</button>}
                        </div>
                    </form>}
                </div>
            </div>
        </header>
    )
}

export default Header;
