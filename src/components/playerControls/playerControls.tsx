import {ReactNode, useContext, useEffect, useState, useRef} from "react";
import {Ctx} from '../../context/context';
import {getStationMetaData} from "../../services/db";
import "./playerControls.css"

const PlayerControls = ({children}: { children: ReactNode }) => {

    const [stationData, setStationData] = useState<{ StreamTitle: string }>();
    //@ts-expect-error fix later
    const {state: {selectedUrlToPlay}} = useContext(Ctx);

    const audioRef = useRef<HTMLAudioElement>(new Audio());

    useEffect(() => {
        const tick = setInterval(() => {
            if (selectedUrlToPlay) {
                getStationMetaData(selectedUrlToPlay)
                    .then(data => setStationData(data.metadata))
                    .catch(error => console.log(error))
            }
        }, 10000)

        getStationMetaData(selectedUrlToPlay)
            .then(data => setStationData(data.metadata))
            .catch(error => console.log(error))
        audioRef.current.src = selectedUrlToPlay;
        audioRef.current.play()
        return () => clearInterval(tick)
    }, [selectedUrlToPlay])

    return (
        <div className="playerControls">
            <div>
                <div>
                    <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M25.7664 55.3867V24.6167H22.4331V55.3834L25.7664 55.3867ZM57.5664 55.3867V24.6167L34.4831 40L57.5664 55.3867Z"
                            fill="#0E5D4E"/>
                    </svg>
                </div>
                <div>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="47" height="47" rx="23.5" fill="#F9F2E9"/>
                        <rect x="0.5" y="0.5" width="47" height="47" rx="23.5" stroke="#0E5D4E"/>
                        <path d="M16 10.28V38.28L38 24.28L16 10.28Z" fill="#0E5D4E"/>
                    </svg>
                </div>
                <div>
                    <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M54.2336 55.3867V24.6167H57.5669V55.3834L54.2336 55.3867ZM22.4336 55.3867V24.6167L45.5169 40L22.4336 55.3867Z"
                            fill="#0E5D4E"/>
                    </svg>
                </div>
            </div>
            <div style={{minHeight: 18}}>
                <p className="overflow-paragraph">{stationData && stationData.StreamTitle}</p>
            </div>
            <div>{children}</div>
        </div>
    )
}

export default PlayerControls;