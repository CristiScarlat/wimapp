import {useEffect, useState, useRef, useCallback, useContext, FormEvent} from "react";
import {FaRegFolderOpen} from "react-icons/fa";
import {IoPlaySkipBack, IoPlay, IoPause, IoStop, IoPlaySkipForward} from "react-icons/io5";
import radioStations from "../../data/stations-new.json"
import Range from "../range/range";
import "./player.css";
import Spinner from "../spinner/spinner";
import EqualizerWithAnalyser from "../equalizerWithAnalyser/equalizerWithAnalyser";
import {formatTime} from "../../utils/utils";
import {FaRegHeart, FaHeart} from "react-icons/fa";
import {Ctx} from "../../context/context";
import {
    addFavoriteStationToDB,
    removeFavoriteStationFromDB,
    getFavoriteStationsToDB
} from "../../services/db";

import {EqPreset, getEqPreset, saveEqPreset} from "../../data/playerPreset";

interface AudioFile {
    urlObject: string
    fileName: string
}

interface RadioStation {
    id: number
    name: string
    url: string
    genre: string
}


const Player = () => {
    const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
    const [radiosStationsList, setRadiosStationsList] = useState<RadioStation[]>(radioStations);
    const [selectedTrack, setSelectedTrack] = useState<AudioFile | { urlObject: string } | undefined>();
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [radioActive, setRadioActive] = useState<boolean>(true);
    const [playStatus, setPlayStatus] = useState<boolean>(false);
    const [playProgress, setPlayProgress] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [favoriteStations, setFavoriteStations] = useState<number[]>([]);
    const [filterStationsBy, setFilterStationsBy] = useState<'all' | 'favorites'>('all');
    //@ts-ignore
    const {state: {user, globalSpinner}, dispatch} = useContext(Ctx);

    const playerRef = useRef(new Audio());

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const urlObjects: { urlObject: string, fileName: string }[] = []
            for (let i: number = 0; i < e.target.files.length; i++) {
                const urlObject: string = URL.createObjectURL(e.target.files[i]);
                urlObjects.push({urlObject, fileName: e.target.files[i].name});
            }
            setAudioFiles([...audioFiles, ...urlObjects]);
            setSelectedTrack(urlObjects[0]);
        }
    }, [])

    useEffect(() => {
        switch(filterStationsBy){
            case 'all':
                setRadiosStationsList(radioStations)
                break;
            case "favorites":
                setRadiosStationsList(radioStations.filter(radioData => isFavorite(radioData.id)))
                break;
        }

    }, [filterStationsBy])

    useEffect(() => {
        if (user) {
            getFavoriteStationsToDB(user.uid)
                .then(data => {
                    setFavoriteStations(data)
                })
                .catch(err => console.log(err))
        }
    }, [user])

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
            playerRef.current.onplaying = () => {
                setLoading(false);
                if(selectedTrack?.urlObject){
                    fetch(selectedTrack.urlObject, {method: 'HEAD'})
                        .then(res => {
                            console.log(res.headers.forEach((val: string, key: string) => console.log({[key]: val})))
                        })
                        .catch(err => console.log(err))
                }
            }
            playerRef.current.onerror = () => {
                if (radioActive) alert("Station offline, please pick another radios station.")
            }
        }

        return () => {
            clearInterval(tick);
            if (audioFiles && audioFiles.length > 0) {
                audioFiles.forEach(fileObject => URL.revokeObjectURL(fileObject.urlObject));
            }
        }
    }, [selectedTrack])

    useEffect(() => {
        if (selectedTrack?.urlObject) playerRef.current.src = selectedTrack.urlObject;
    }, [selectedTrack])

    const handleSelectTrack = useCallback((index: number) => {
        if (audioFiles) {
            setCurrentIndex(index)
            // @ts-ignore
            const fileObj = audioFiles[index];
            setSelectedTrack(fileObj)
        }
    }, [audioFiles])

    const handleSelectStation = useCallback((index: number) => {
        setCurrentIndex(index)
        const formatUrl = radiosStationsList[index].url;
        setSelectedTrack({urlObject: formatUrl})
    }, [filterStationsBy, radiosStationsList])

    const handlePrevTrack = useCallback(() => {
        // @ts-ignore
        if (currentIndex > 0) {
            setCurrentIndex((state: number) => {
                const prev = state - 1;
                radioActive ? handleSelectStation(prev) : handleSelectTrack(prev)
                return prev
            })
        }
    }, [radioActive, currentIndex, filterStationsBy, radiosStationsList])

    const handleNextTrack = useCallback(() => {
        // @ts-ignore
        if ((radioActive && currentIndex < radiosStationsList.length - 1) || (!radioActive && currentIndex < audioFiles.length - 1)) {
            setCurrentIndex((state: number) => {
                const next = state + 1;
                radioActive ? handleSelectStation(next) : handleSelectTrack(next)
                return next
            })
        }
    }, [radioActive, filterStationsBy, radiosStationsList, currentIndex])

    const handlePlay = useCallback(() => {
        playerRef.current.play();
    }, [])

    const handlePause = useCallback(() => {
        playerRef.current.pause();
        setPlayStatus(false);
    }, [])

    const handleStop = useCallback(() => {
        if (playerRef) {
            playerRef.current.pause();
            playerRef.current.currentTime = 0;
            setPlayStatus(false);
        }
    }, [])

    const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (playerRef) {
            playerRef.current.volume = Number(e.target.value);
        }
    }, [])

    const handleSeek = useCallback((e: any) => {
        setPlayProgress(e.target.value);
        // @ts-ignore
        playerRef.current.currentTime = e.target.value;
    }, [playProgress])

    const handleFavorites = useCallback((stationId: any) => {
        dispatch({type: 'LOADING_TRUE'})
        //@ts-ignore
        if (!favoriteStations?.includes(String(stationId))) {
            addFavoriteStationToDB(user.uid, stationId.toString())
                .then(() => {
                    dispatch({type: 'LOADING_FALSE'})
                    setFavoriteStations((state: number[]) => {
                        if(state === undefined)return [stationId.toString()]
                        return [...state, stationId.toString()]
                    })
                })
                .catch(err => {
                    console.log(err)
                    dispatch({type: 'LOADING_FALSE'})
                });
        } else {
            removeFavoriteStationFromDB(user.uid, stationId.toString())
                .then(data => {
                    dispatch({type: 'LOADING_FALSE'})
                    setFavoriteStations(data => [...data.filter(station => station !== stationId.toString())])
                })
                .catch(err => {
                    console.log(err)
                    dispatch({type: 'LOADING_FALSE'})
                });
        }

    }, [user, favoriteStations])

    const isFavorite = (stationId: number) => {
        //@ts-ignore
        return favoriteStations?.includes(String(stationId))
    }

    const toggleFilterByFavorites = () => {
        setFilterStationsBy(filter => filter === "favorites" ? "all" : "favorites")
    }



    return (
        <div className="player-container">
            <div className="player">
                <div className="player-info">
                    <div className="scroll-container">
                        <div className="scroll-text">
                            Wimapp is a player full of features still in development,
                            so please forward any suggestions or bug findings to cristiscarlat1978@gmail.com, enjoy !
                        </div>
                    </div>
                </div>
                <EqualizerWithAnalyser audioSource={playerRef}/>
                <div className="player-header">
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
                        <button className="player-control-btn" onClick={handlePrevTrack}>
                            <IoPlaySkipBack size="1.2rem" color="white"/>
                        </button>
                        <div className="vr"/>
                        <button className={`player-control-btn ${playStatus ? "pressed" : ""}`} onClick={handlePlay}>
                            <IoPlay
                                size="1.2rem" color="white"/></button>
                        <div className="vr"/>
                        {!radioActive && <>
                            <button className="player-control-btn" onClick={handlePause}><IoPause size="1.2rem"
                                                                                                  color="white"/>
                            </button>
                            <div className="vr"/>
                        </>}
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
            <div className="player-playlist-wrapper">
                <div className="player-playlist-header">
                    {(radioActive && user) && <button className="icon-btn btn" onClick={toggleFilterByFavorites}>
                        {filterStationsBy === "favorites" ? <FaHeart color="white" size="1.2rem"/> : <FaRegHeart color="white" size="1.2rem"/>}
                        <span>Favorites</span>
                    </button>}
                </div>
                <ol className="player-playlist">
                    {!radioActive ? (audioFiles && audioFiles.length > 0) ? audioFiles.map((fileObj: AudioFile, index: number) => (
                            <li
                                key={fileObj.fileName + index}
                                className={`${selectedTrack?.urlObject === fileObj.urlObject && "selected scroll-anim"}`}
                                onClick={() => handleSelectTrack(index)}>
                                <p>{fileObj.fileName}</p>
                            </li>
                        )) : "select audio files from your device"
                        : radiosStationsList.sort((a, b) => a.name.localeCompare(b.name)).map((radioData: any, index: number) => (
                            !radioData?.disabled && <li key={radioData.id}
                                                        className={`${selectedTrack?.urlObject === radioData.url ? "selected scroll-anim" : ""}`}>
                                <div className="player-playlist-radio">
                                    <div style={{display: "flex", gap: "0.5rem"}}>
                                        {(loading && selectedTrack?.urlObject === radioData.url) &&
                                            <span><Spinner radius={10} stroke={3}/></span>}
                                        <button className="link-btn"
                                                onClick={() => handleSelectStation(index)}>{radioData.name}</button>
                                    </div>
                                    <span>{user &&
                                        <button className="icon-btn" onClick={() => handleFavorites(radioData.id)} style={{background: "transparent"}}>
                                            {isFavorite(radioData.id) ? <FaHeart color="red" size="1.2rem"/> :
                                                <FaRegHeart color="red" size="1.2rem"/>}
                                        </button>}
                                </span>
                                </div>
                            </li>))
                    }
                </ol>
            </div>
            {globalSpinner && <Spinner  radius={30} stroke={5} fixed={true}/>}
        </div>
    );
}

export default Player;