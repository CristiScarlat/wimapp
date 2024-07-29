import {useRef, useState} from "react";
import "./slider.css";

const Slider = () => {
    const [grabbing, setGrabbing] = useState(false);
    const [thumbPosition, setThumbPosition] = useState<Number>(0);

    const thumbRef = useRef<any>();
    const trackPosition = useRef<number>(0);
    const handleGrab = () => {
        trackPosition.current = thumbRef.current.getBoundingClientRect().left;
        setGrabbing(true)
    }

    const handleMouseUp = () => {
        setGrabbing(false)
    }

    const handleOnMouseMove = (e: any) => {
        if(grabbing && Math.round(e.nativeEvent.x) - trackPosition.current <= 100){
            setThumbPosition(Math.round(e.nativeEvent.x) - (trackPosition.current-10))
        }
    }

    console.log("render")

    return(
        <div className="slider-wrapper">
            <style>
                {`.slider-thumb {left: ${thumbPosition.toString()}px`}
            </style>
            <div
                className="slider-track"
                style={{cursor: grabbing ? "grabbing" : "grab"}}

                onMouseUp={handleMouseUp}
            >
                <div
                    // @ts-ignore
                    ref={thumbRef}
                    className="slider-thumb"
                    onMouseDown={handleGrab}
                    onMouseMove={handleOnMouseMove}
                ></div>
            </div>
        </div>
    )
}

export default Slider;