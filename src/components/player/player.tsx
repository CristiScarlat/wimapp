import {useEffect, useState, useRef, useCallback} from "react";
import {FaRegFolderOpen} from "react-icons/fa";
import {IoPlaySkipBack, IoPlay, IoPause, IoStop, IoPlaySkipForward} from "react-icons/io5";
import radioStations from "../../data/stations-new.json"
import Range from "../range/range";
import "./player.css";
import Spinner from "../spinner/spinner";
import EqualizerWithAnalyser from "../equalizerWithAnalyser/equalizerWithAnalyser";
import {formatTime} from "../../utils/utils";

interface AudioFile {
    urlObject: string
    fileName: string
}

const Player = () => {
    const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
    const [selectedTrack, setSelectedTrack] = useState<AudioFile | { urlObject: string } | undefined>();
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [radioActive, setRadioActive] = useState<boolean>(true);
    const [playStatus, setPlayStatus] = useState<boolean>(false);
    const [playProgress, setPlayProgress] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [availableSpace, setAvailableSpace] = useState(0);

    const playerRef = useRef(new Audio());

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const urlObjects: { urlObject: string, fileName: string }[] = []
            for (let i: number = 0; i < e.target.files.length; i++) {
                const urlObject: string = URL.createObjectURL(e.target.files[i]);
                urlObjects.push({urlObject, fileName: e.target.files[i].name});
            }
            setAudioFiles([...audioFiles, ...urlObjects]);
            setSelectedTrack(urlObjects[0]);
        }
    }

    useEffect(() => {
        playerRef.current.onended = () => {
            if (!radioActive && audioFiles?.length) {
                handleNextTrack()
            }
        }
    }, [audioFiles])

    useEffect(() => {
        let tick: number = 0;
        if (playerRef) {
            playerRef.current.crossOrigin = "anonymous";
            playerRef.current.autoplay = true;
            playerRef.current.onplay = () => {
                setPlayStatus(true);
                tick = window.setInterval(() => {
                    if (!playerRef.current.paused) {
                        setPlayProgress(playerRef.current.currentTime || 0);
                    }
                }, 100)
            }



            playerRef.current.onseeking = (e) => {
                setPlayProgress(playerRef.current.currentTime || 0);
            }

            playerRef.current.onloadstart = () => setLoading(true);
            playerRef.current.onplaying = () => setLoading(false);
        }

        navigator?.storage?.estimate()
            .then(estimate => {
                if (estimate && estimate?.quota) {
                    setAvailableSpace(Math.round(estimate.quota / (1024 * 1024 * 1024)))
                }
            })
            .catch(error => {
                console.log(error)
            })

        return () => {
            clearInterval(tick);
            if (audioFiles && audioFiles.length > 0) {
                console.log("deci se executa si asta")
                audioFiles.forEach(fileObject => URL.revokeObjectURL(fileObject.urlObject));
            }
        }
    }, [])

    useEffect(() => {
        if (selectedTrack?.urlObject) playerRef.current.src = selectedTrack.urlObject;
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
        if (currentIndex > 0) {
            setCurrentIndex((state: number) => {
                const prev = state - 1;
                radioActive ? handleSelectStation(prev) : handleSelectTrack(prev)
                return prev
            })
        }
    }

    const handleNextTrack = () => {
        // @ts-ignore
        if ((radioActive && currentIndex < radioStations.length - 1) || (!radioActive && currentIndex < audioFiles.length - 1)) {
            setCurrentIndex((state: number) => {
                const next = state + 1;
                radioActive ? handleSelectStation(next) : handleSelectTrack(next)
                return next
            })
        }
    }

    const handlePlay = () => {
        playerRef.current.play();
    }

    const handlePause = () => {
        playerRef.current.pause();
        setPlayStatus(false);
    }

    const handleStop = () => {
        if (playerRef) {
            playerRef.current.pause();
            playerRef.current.currentTime = 0;
            setPlayStatus(false);
        }
    }

    const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (playerRef) {
            playerRef.current.volume = Number(e.target.value);
        }
    }

    const handleSeek = useCallback((e: any) => {
        setPlayProgress(e.target.value);
        // @ts-ignore
        playerRef.current.currentTime = e.target.value;
    }, [playProgress])

    //console.log(radioStations.length)

    return (
        <div className="player-container">
            <div className="player">
                <div className="player-info">
                    <p>{!radioActive && `${availableSpace} Gb`}</p>
                    <div className="scroll-container">
                        <div className="scroll-text">
                            Wimapp is a player full of features still in development,
                            so please forward any suggestions or bug findings to cristiscarlat1978@gmail.com, enjoy !
                        </div>
                    </div>
                </div>
                <EqualizerWithAnalyser audioSource={playerRef}/>
                <div className="player-header">
                    {/*{!radioActive && <div className="player-menu progress-bar" style={{position: "relative"}}>*/}
                    {/*    {availableSpace}Gb*/}
                    {/*</div>}*/}
                    {!radioActive && <div className="player-menu progress-bar" style={{position: "relative"}}>
                      <input type="range" min={0} max={playerRef.current.duration || 0} value={playProgress}
                             onChange={handleSeek}/>
                      <div>
                        <span>{formatTime(playerRef.current.currentTime)}</span>
                        <span>{formatTime(playerRef.current.duration || 0)}</span>
                      </div>
                    </div>}
                    <div className="player-menu">
                        <label htmlFor="file-upload" className="custom-file-upload">
                            <FaRegFolderOpen size="1.2rem" color={radioActive ? "#484747" : "white"}/>
                        </label>
                        <input id="file-upload" type="file" multiple={true} onChange={handleFileInput}
                               style={{color: "transparent"}} disabled={radioActive}/>
                        <div className="vr"/>
                        <button onClick={() => setRadioActive(true)} className={`${radioActive ? "active" : ""}`}
                                style={{marginRight: "0.5rem"}}>
                            Radio
                        </button>
                        <button onClick={() => setRadioActive(false)} className={`${!radioActive ? "active" : ""}`}>
                            MP3
                        </button>
                        <div className="vr"/>
                        <Range min={0} max={1} step={0.01} width="5rem" onChange={handleVolume}/>
                    </div>
                    <div className="player-control-container">
                        <button className="player-control-btn" onClick={handlePrevTrack}><IoPlaySkipBack size="1.2rem"
                                                                                                         color="white"/>
                        </button>
                        <div className="vr"/>
                        <button className={`player-control-btn ${playStatus ? "pressed" : ""}`} onClick={handlePlay}>
                            <IoPlay
                                size="1.2rem" color="white"/></button>
                        <div className="vr"/>
                        <button className="player-control-btn" onClick={handlePause}><IoPause size="1.2rem"
                                                                                              color="white"/>
                        </button>
                        <div className="vr"/>
                        <button className="player-control-btn" onClick={handleStop}><IoStop size="1.2rem"
                                                                                            color="white"/>
                        </button>
                        <div className="vr"/>
                        <button className="player-control-btn" onClick={handleNextTrack}><IoPlaySkipForward
                            size="1.2rem"
                            color="white"/>
                        </button>
                    </div>
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
                    : radioStations.sort((a, b) => a.name.localeCompare(b.name)).map((radioData: any, index: number) => (
                        !radioData?.disabled && <li key={radioData.id}
                                                    className={`${selectedTrack?.urlObject === radioData.url && "selected scroll-anim"}`}
                                                    style={{cursor: "pointer"}}
                                                    onClick={() => handleSelectStation(index)}>
                      <div style={{display: "inline-flex", gap: "0.5rem", marginBottom: "0.5rem"}}>
                          {(loading && selectedTrack?.urlObject === radioData.url) &&
                            <span><Spinner radius={10} stroke={3}/></span>}
                        <span>{radioData.name}</span></div>
                    </li>))
                }
            </ol>
        </div>
    );
}

export default Player;