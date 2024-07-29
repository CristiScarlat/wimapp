import {useRef, useState} from "react";
import "./progressBar.css";

const ProgressBar = ({position=50}) => {

    const trackRef = useRef();

    return(
        <div className="slider-wrapper">
            <div className="slider-track">
                <div className="slider-thumb"></div>
            </div>
        </div>
    )
}
export default ProgressBar;