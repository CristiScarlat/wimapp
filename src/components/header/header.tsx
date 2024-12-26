import {SyntheticEvent, useEffect, useState, useContext, useRef} from 'react';
import { Ctx } from '../../context/context';
import { RiArrowLeftCircleLine, RiArrowRightCircleLine } from 'react-icons/ri';
import "./header.css";
import {login, logout, onAuthChange, registerUser} from "../../services/auth";
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

    return (
        <header className="header-wrapper">
            <div className="header-logo"><img src="/logo192_white.png" alt="logo" width={25}/>
                WIMAPP
                <span style={{fontSize: 10, color: "#808080b3"}}>V2</span>
            </div>
            <MobileFooter/>
            <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
                {user && <button className="btn logout-btn" onClick={handleSignout}>
                    Logout
                </button>}
                <button className="header-sidebar-btn" onClick={() => setShow(true)}>
                    <RiArrowLeftCircleLine color="white" size="1.5rem"/>
                </button>
            </div>
            <div id="header-sidebar" style={{width: show ? "20rem" : 0}} ref={headerSidebarRef}>
                <div className="header-sidebar-head">
                    <button className="header-sidebar-btn" onClick={() => setShow(false)}>
                        <RiArrowRightCircleLine color="white" size="1.5rem"/>
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
                            <span style={{color: formType ? "white" : "gray"}}>Login</span>
                            <ToggleButton onChange={handleFormType}/>
                            <span style={{color: !formType ? "white" : "gray"}}>Sign up</span>
                        </div>
                        <input name="email" type="email" placeholder="Email" />
                        {!formType && <input name="fullName" type="text" placeholder="Full name" />}
                        <input name="password" type="password" placeholder="Password" />
                        <button className="player-control-btn icon-btn bg-default" type="submit">
                            {loading && <Spinner radius={10} stroke={3}/>}
                            <span>{formType ? "Login" : "Sign up"}</span>
                        </button>
                    </form>}
                </div>
            </div>
        </header>
    )
}

export default Header;
