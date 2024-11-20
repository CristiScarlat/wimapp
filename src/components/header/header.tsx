import { useState } from 'react';
import { RiArrowLeftCircleLine, RiArrowRightCircleLine } from 'react-icons/ri';
import "./header.css";

const Header = () => {

    const [show, setShow] = useState(false);

    return (
        <div className="header-wrapper">
            <div className="header-logo"><img src="/logo192_white.png" alt="logo" width={25}/>WIMAPP</div>
            <div>
                <button className="header-sidebar-btn" onClick={() => setShow(true)}>
                    <RiArrowLeftCircleLine color="white" size="1.5rem"/>
                </button>
            </div>
            <div id="header-sidebar" style={{ width: show ? "20rem" : 0}}>
                <div className="header-sidebar-head">
                    <button className="header-sidebar-btn" onClick={() => setShow(false)}>
                        <RiArrowRightCircleLine color="white" size="1.5rem"/>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Header;
