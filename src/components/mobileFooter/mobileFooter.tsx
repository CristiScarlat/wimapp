import { useContext } from "react";
import { Ctx } from "../../context/context";
import { MdPlayArrow, MdOutlinePlaylistPlay } from "react-icons/md";
import "./mobileFooter.css";

const MobileFooter = () => {
    //@ts-ignore
    const {state: { mobileShow }, dispatch} = useContext(Ctx);
    return (
        <div className="mobile-header-buttons">
            <button
                className={`icon-btn ${mobileShow!=="player" ? "btn-outline" : ""}`}
                onClick={() => dispatch({type: "MOBILE_BUTTONS", payload: "player"})}
            >
                <MdPlayArrow size="1.2rem"/>
                <span>Player</span>
            </button>
            <button
                className={`icon-btn ${mobileShow!=="playlist" ? "btn-outline" : ""}`}
                onClick={() => dispatch({type: "MOBILE_BUTTONS", payload: "playlist"})}
            >
                <MdOutlinePlaylistPlay size="1.2rem"/>
                <span>Playlist</span>
            </button>
        </div>
    )
}

export default MobileFooter;