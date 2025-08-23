import {ReactNode, useContext, useEffect, useState, useRef} from "react";
import {Ctx} from '../../context/context';
import {getStationMetaData} from "../../services/db";
import Spinner from "../spinner/spinner";
import {toast} from 'react-toastify';
import "./playerControls.css";

const PlayerControls = ({children}: { children: ReactNode }) => {

    const [stationData, setStationData] = useState<{ StreamTitle: string }>();
    const [loading, setLoading] = useState<boolean>(true);
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
        audioRef.current.play().catch(error => setLoading(false))
        audioRef.current.onplaying = () => dispatch({type: "PLAYER_STATUS", payload: true});
        audioRef.current.onpause = () => dispatch({type: "PLAYER_STATUS", payload: false});
        audioRef.current.onloadstart = () => setLoading(true);
        audioRef.current.onerror = error => setLoading(false);
        audioRef.current.oncanplay = () => setLoading(false);

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

    const getWikiInfo = async () => {
        if(stationData?.StreamTitle){
            const artist = stationData?.StreamTitle.split("-")[0]
            const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(artist)}`;
            window.open(wikiUrl, "_blank");
        }
    }

    const youTubeSearch = async () => {
        if(stationData?.StreamTitle){
            const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(stationData.StreamTitle)}`;
            window.open(url, "_blank");
        }
    }

    return (
        <div className="playerControls">
            <div style={{minHeight: 18, display: "flex", alignItems: "center", gap: "1rem"}}>
                <h3 className="overflow-paragraph">{selectedStation && selectedStation.name}</h3>
                {loading && <Spinner radius={20}/>}
            </div>
            <div style={{minHeight: 18}}>
                <p className="overflow-paragraph">{stationData && stationData.StreamTitle}</p>
                {(stationData?.StreamTitle && stationData.StreamTitle !== "") && <div className="buttons-container">
                    <button onClick={getWikiInfo} className="simple-btn">Get Wiki info</button>
                    <button onClick={youTubeSearch} className="simple-btn">Find Artist on Youtube</button>
                </div>}
            </div>
            <div>{children}</div>
        </div>
    )
}

export default PlayerControls;