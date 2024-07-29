import {useEffect, useState, useRef} from "react";
import {FaRegFolderOpen} from "react-icons/fa";
import {IoPlaySkipBack, IoPlay, IoPause, IoStop, IoPlaySkipForward} from "react-icons/io5";
import radioStations from "../../data/radioStations.json"
import ProgressBar from "../progressBar/progressBar";
import Range from "../range/range";
import "./player.css";
import Spinner from "../spinner/spinner";

interface AudioFile {
    urlObject: string
    fileName: string
}

const Player = () => {
    const [audioFiles, setAudioFiles] = useState<AudioFile[] | undefined>([{urlObject: "", fileName: "akshjgdasdggagdgkasdjasdhjkahsdjkashdkasjhdjkasdjkashdjkashdjkashjdjkashdjkasdjkaskhjdjkashdasjkhdhjkash111"}]);
    const [selectedTrack, setSelectedTrack] = useState<AudioFile | { urlObject: string } | undefined>({urlObject: "", fileName: "akshjgdasdggagdgkasdjasdhjkahsdjkashdkasjhdjkasdjkashdjkashdjkashjdjkashdjkasdjkaskhjdjkashdasjkhdhjkash111"});
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [radioActive, setRadioActive] = useState<boolean>(true);
    const [playStatus, setPlayStatus] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    const playerRef = useRef<HTMLAudioElement>(null);
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const urlObjects: { urlObject: string, fileName: string }[] = []
            for (let i: number = 0; i < e.target.files.length; i++) {
                const urlObject: string = URL.createObjectURL(e.target.files[i]);
                urlObjects.push({urlObject, fileName: e.target.files[i].name});
            }
            setAudioFiles(urlObjects);
            setSelectedTrack(urlObjects[0]);
        }
    }

    useEffect(() => {
        //@ts-ignore
        playerRef.current.onplaying = () => {
            setPlayStatus(true);
            console.log("playing")
        }
        //@ts-ignore
        // playerRef.current.onprogress = (e) => {
        //     console.log(e)
        // }
        return () => {
            if (audioFiles && audioFiles.length > 0) {
                audioFiles.forEach(fileObject => URL.revokeObjectURL(fileObject.urlObject));
            }
        }
    }, [])

    useEffect(() => {

    }, [selectedTrack])

    const handleSelectTrack = (index: number) => {
        if (audioFiles) {
            setCurrentIndex(index)
            // @ts-ignore
            const fileObj = audioFiles[index];
            setSelectedTrack(fileObj)
        }
    }

    const handleSelectStation = (index: number) => {
        setCurrentIndex(index)
        setSelectedTrack({urlObject: radioStations[index].url})
    }

    const handlePrevTrack = () => {
        // @ts-ignore
        if(currentIndex > 0){
            setCurrentIndex((state: number) => {
                const prev = state - 1;
                radioActive ? handleSelectStation(prev) : handleSelectTrack(prev)
                return prev
            })
        }
    }

    const handleNextTrack = () => {
        // @ts-ignore
        if((radioActive && currentIndex < radioStations.length-1) || (!radioActive && currentIndex < audioFiles.length-1)){
            console.log(currentIndex, radioStations.length)
            setCurrentIndex((state: number) => {
                const next = state + 1;
                radioActive ? handleSelectStation(next) : handleSelectTrack(next)
                return next
            })
        }
    }

    const handlePlay = () => {
        playerRef?.current?.play();
    }

    const handlePause = () => {
        playerRef?.current?.pause();
        setPlayStatus(false);
    }

    const handleStop = () => {
        if (playerRef?.current) {
            playerRef.current.pause();
            playerRef.current.currentTime = 0;
            setPlayStatus(false);
        }
    }

    const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (playerRef?.current) {
            playerRef.current.volume = Number(e.target.value);
        }
    }

    return (
        <div className="player-container">
            <audio src={selectedTrack?.urlObject}
                   ref={playerRef}
                   autoPlay
                   onLoadStart={() => setLoading(true)}
                   onLoadedData={() => setLoading(false)}
            />
            <div className="player-header">
                {!radioActive && <div className="player-menu">
                    <ProgressBar/>
                </div>}
                <div className="player-menu">
                    <label htmlFor="file-upload" className="custom-file-upload">
                        <FaRegFolderOpen size="1.2rem" color={radioActive ? "#484747" : "white"}/>
                    </label>
                    <input id="file-upload" type="file" multiple={true} onChange={handleFileInput}
                           style={{color: "transparent"}} disabled={radioActive}/>
                    <div className="vr"/>
                    <button onClick={() => setRadioActive(true)} className={`${radioActive ? "active" : ""}`}
                            style={{marginRight: "0.5rem"}}>Radio
                    </button>
                    <button onClick={() => setRadioActive(false)} className={`${!radioActive ? "active" : ""}`}>MP3
                    </button>
                    <div className="vr"/>
                    <Range min={0} max={1} step={0.01} width="5rem" onChange={handleVolume}/>
                </div>
                <div className="player-control-container">
                    <button className="player-control-btn" onClick={handlePrevTrack}><IoPlaySkipBack size="1.2rem"
                                                                                                     color="white"/>
                    </button>
                    <div className="vr"/>
                    <button className={`player-control-btn ${playStatus ? "pressed" : ""}`} onClick={handlePlay}><IoPlay
                        size="1.2rem" color="white"/></button>
                    <div className="vr"/>
                    <button className="player-control-btn" onClick={handlePause}><IoPause size="1.2rem" color="white"/>
                    </button>
                    <div className="vr"/>
                    <button className="player-control-btn" onClick={handleStop}><IoStop size="1.2rem" color="white"/>
                    </button>
                    <div className="vr"/>
                    <button className="player-control-btn" onClick={handleNextTrack}><IoPlaySkipForward size="1.2rem"
                                                                                                        color="white"/>
                    </button>
                </div>
            </div>

            <ol className="player-playlist">
                {!radioActive ? (audioFiles && audioFiles.length > 0) ? audioFiles.map((fileObj: AudioFile, index: number) => (
                        <li
                            key={fileObj.fileName + index}
                            style={{cursor: "pointer"}}
                            className={`${selectedTrack?.urlObject === fileObj.urlObject && "selected scroll-anim"}`}
                            onClick={() => handleSelectTrack(index)}>
                            <p>{fileObj.fileName}</p>
                        </li>
                    )) : "select audio files from your device"
                    : radioStations.map((radioData: any, index: number) => (
                        <li key={radioData.id}
                            className={`${selectedTrack?.urlObject === radioData.url && "selected scroll-anim"}`}
                            style={{cursor: "pointer"}}
                            onClick={() => handleSelectStation(index)}>
                            <p style={{display: "inline-flex", gap: "0.5rem"}}>
                                {(loading && selectedTrack?.urlObject === radioData.url) &&
                                  <Spinner radius={10} stroke={3}/>}
                                <span>{radioData.name}</span></p>
                        </li>))
                }
            </ol>
        </div>
    );
}

export default Player;