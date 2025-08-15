import {ReactNode, useContext, useEffect, useState, useRef} from "react";
import {Ctx} from '../../context/context';
import {getStationMetaData} from "../../services/db";
import {toast} from 'react-toastify';
import "./playerControls.css";

const PlayerControls = ({children}: { children: ReactNode }) => {

    const [stationData, setStationData] = useState<{ StreamTitle: string }>();
    //@ts-expect-error fix later
    const {state: {selectedStation, playerStatus}, dispatch} = useContext(Ctx);

    const audioRef = useRef<HTMLAudioElement>(new Audio());

    useEffect(() => {
        const tick = setInterval(() => {
            if (selectedStation?.url_resolved) {
                getStationMetaData(selectedStation.url_resolved)
                    .then(responseData => {
                        if(responseData?.error)clearInterval((tick))
                        setStationData(responseData.metadata)
                    })
                    .catch(error => {
                        console.log(">>>", error)
                        clearInterval(tick)
                    })
            }
        }, 10000)

        if (selectedStation?.url_resolved) {
            setStationData({ StreamTitle: ""})
            audioRef.current.src = selectedStation.url_resolved;
            getStationMetaData(selectedStation.url_resolved)
                .then(data => setStationData(data?.metadata || ""))
                .catch(error => console.log(error))
        }
        audioRef.current.play().catch(error => console.log(error))
        audioRef.current.onplaying = () => dispatch({type: "PLAYER_STATUS", payload: true});
        audioRef.current.onpause = () => dispatch({type: "PLAYER_STATUS", payload: false});

        return () => clearInterval(tick)
    }, [selectedStation?.url_resolved])

    useEffect(() => {
        if(playerStatus){
            if(selectedStation?.url_resolved === undefined || selectedStation?.url_resolved === null){
                toast("Please select station to play.", {
                    type: "error",
                })
                return
            }
            audioRef.current.play().catch(error => console.log(error))
        }
        else {
            audioRef.current.pause()
        }
    }, [playerStatus]);

    return (
        <div className="playerControls">
            <div style={{minHeight: 18}}>
                <h3 className="overflow-paragraph">{selectedStation && selectedStation.name}</h3>
            </div>
            <div style={{minHeight: 18}}>
                <p className="overflow-paragraph">{stationData && stationData.StreamTitle}</p>
            </div>
            <div>{children}</div>
        </div>
    )
}

export default PlayerControls;