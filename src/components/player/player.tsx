import {useEffect, useState, useRef, useCallback, useContext, FormEvent, SyntheticEvent} from "react";
import {FaRegFolderOpen, FaAngleDoubleRight, FaAngleDoubleLeft} from "react-icons/fa";
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

import {
    getAllStations,
    getStationsById,
    formatStationData,
    getAllTags,
    getStationsByTagName, getStationsByStationName
} from "../../services/RBApi";
import InputWithText from "../inputWithButton/inputWithButton";
import DropdownMenu from "../dropdownMenu/dropdownMenu";

interface AudioFile {
    urlObject: string
    fileName: string
}

interface RadioStation {
    id: number
    name: string
    url: string
    genre: string
    country: string
    homepage: string
    bitrate: number
    favicon: string
}


const Player = () => {
    const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
    const [radiosStationsList, setRadiosStationsList] = useState<RadioStation[]>([]);
    const [selectedTrack, setSelectedTrack] = useState<AudioFile | { urlObject: string } | undefined>();
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [radioActive, setRadioActive] = useState<boolean>(true);
    const [playStatus, setPlayStatus] = useState<boolean>(false);
    const [playProgress, setPlayProgress] = useState<number>(0);
    const [stationLoading, setStationLoading] = useState(false);
    const [playlistLoading, setPlaylistLoading] = useState<boolean>(false);
    const [favoriteStations, setFavoriteStations] = useState<number[]>([]);
    const [filterStationsBy, setFilterStationsBy] = useState<'all' | 'favorites'>('all');
    const [stationsPage, setStationsPage] = useState<number>(0);
    //@ts-ignore
    const {state: {user, globalSpinner}, dispatch} = useContext(Ctx);

    const playerRef = useRef(new Audio());
    const stationInfoRef = useRef<RadioStation & { page: number, index: number } | undefined>();
    const searchByTerm = useRef("name")
    const searchInputRef = useRef<HTMLInputElement>(null);

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
        setPlaylistLoading(true);
        if (filterStationsBy === 'all' && (searchInputRef.current?.value === "" || searchInputRef.current?.value === null)) {
            getAllStations(100, stationsPage * 100)
                .then((data: any) => {
                    setPlaylistLoading(false);
                    const formatData: RadioStation[] = data.map((obj: any): RadioStation => formatStationData(obj))
                    setRadiosStationsList(formatData);
                })
                .catch((error: any) => {
                    setPlaylistLoading(false);
                    console.log(error)
                })
        }
        else if(filterStationsBy === 'all' && searchInputRef.current?.value && searchInputRef.current?.value !== "" && radiosStationsList.length <= 100) {
            console.log({stationsPage, searchTerm: searchInputRef.current.value, searchBy: searchByTerm.current})
            switch(searchByTerm.current){
                // @ts-ignore
                case "name":
                    searchByName();
                    break;
                // @ts-ignore
                case "tag":
                    searchByTag();
                    break;
            }
        }
        else if (user && filterStationsBy === 'favorites') {
            if (favoriteStations.length === 0) {
                getFavoriteStationsToDB(user.uid)
                    .then(data => {
                        console.log(data);
                        setPlaylistLoading(false);
                    })
                    .catch((error: any) => {
                        setPlaylistLoading(false);
                        console.log(error)
                    })
            }
            else {
                // @ts-ignore
                Promise.all(favoriteStations.map((stationId: string) => getStationsById(stationId)))
                    .then(fetchedFavorites => {
                        const list = fetchedFavorites.map(arr => formatStationData(arr[0]))
                        setRadiosStationsList(list);
                        setPlaylistLoading(false);
                    })
                    .catch((error: any) => {
                        setPlaylistLoading(false);
                        console.log(error)
                    })
            }
        }
        else {
            setPlaylistLoading(false);
        }
    }, [stationsPage, filterStationsBy, user]);

    useEffect(() => {
        console.log({user})
        if(!user && filterStationsBy === 'favorites')setFilterStationsBy("all")
    }, [user]);

    const handleNextStationsPage = () => {
        setStationsPage(page => page + 1)
    }

    const handlePrevStationsPage = () => {
        if (stationsPage > 0) setStationsPage(page => page - 1)
    }

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

            playerRef.current.onloadstart = () => setStationLoading(true);
            playerRef.current.onplaying = () => setStationLoading(false);
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
        stationInfoRef.current = {...radiosStationsList[currentIndex], page: stationsPage, index: currentIndex}
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
        setSelectedTrack({urlObject: radiosStationsList[index].url})
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
        if (favoriteStations.length >= 10) {
            alert("You reached maximum of 10 favorite stations.")
        }
        dispatch({type: 'LOADING_TRUE'})
        //@ts-ignore
        if (!favoriteStations?.includes(String(stationId))) {
            addFavoriteStationToDB(user.uid, stationId.toString())
                .then(() => {
                    dispatch({type: 'LOADING_FALSE'})
                    setFavoriteStations((state: number[]) => {
                        if (state === undefined) return [stationId.toString()]
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

    const searchByName = () =>{
        const inputSearchValue = searchInputRef.current?.value;
        if(inputSearchValue && inputSearchValue !== ""){
            getStationsByStationName(inputSearchValue, 100, stationsPage*100)
                .then((data: any) => {
                    setPlaylistLoading(false);
                    const formatData: RadioStation[] = data.map((obj: any): RadioStation => formatStationData(obj))
                    setRadiosStationsList(formatData);
                })
                .catch((error: any) => {
                    setPlaylistLoading(false);
                    console.log(error)
                })
        }
    }

    const searchByTag = () =>{
        const inputSearchValue = searchInputRef.current?.value;
        if(inputSearchValue && inputSearchValue !== "") {
            getStationsByTagName(inputSearchValue, 100, stationsPage*100)
                .then((data: any) => {
                    setPlaylistLoading(false);
                    const formatData: RadioStation[] = data.map((obj: any): RadioStation => formatStationData(obj))
                    setRadiosStationsList(formatData);
                })
                .catch((error: any) => {
                    setPlaylistLoading(false);
                    console.log(error)
                })
        }
    }

    const handleSearch = () => {
        setPlaylistLoading(true);
        setStationsPage(0);
        switch(searchByTerm.current){
            // @ts-ignore
            case "name":
                searchByName();
                break;
            // @ts-ignore
            case "tag":
                searchByTag();
                break;
        }

    }

    // @ts-ignore
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
                    <a href={stationInfoRef.current?.homepage} target="_blank" className="text-overflow">
                        {stationInfoRef.current?.homepage}
                    </a>
                    <p>Bitrate:<span style={{marginLeft: "0.5rem"}}>{stationInfoRef.current?.bitrate}</span>
                    </p>
                    <p>Country:<span style={{marginLeft: "0.5rem"}}>{stationInfoRef.current?.country}</span>
                    </p>
                    <p title={stationInfoRef.current?.genre}>Genre:<span
                        className="text-overflow player-info-tags-container">{stationInfoRef.current?.genre?.split(",").map(tag => (
                        <div className="tag">{tag}</div>
                    ))}</span>
                    </p>
                    {stationInfoRef.current?.favicon &&
                        <p><img src={stationInfoRef.current?.favicon}/></p>}
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
                    <div className="playlist-filterBy-dropdown">
                        <label>Filter by:</label>
                        <DropdownMenu
                            items={["name", "tag"]}
                            className="eq-preset-dropdown"
                            onSelectItem={(e: SyntheticEvent<HTMLSelectElement, Event>) => searchByTerm.current = e.currentTarget.value}
                        />
                    </div>

                    <InputWithText buttonOnClick={handleSearch} inputRef={searchInputRef}/>
                    {(radioActive && user) && <button className="icon-btn" onClick={toggleFilterByFavorites}
                                                      style={{background: "transparent", marginRight: "1rem"}}>
                        {filterStationsBy === "favorites" ? <FaHeart color="#8907e4" size="2rem"/> :
                            <FaRegHeart color="#8907e4" size="2rem"/>}
                    </button>}
                </div>
                {radioActive && <div className="player-playlist-pagination">
                    <button className="btn icon-btn" onClick={handlePrevStationsPage}>
                        <FaAngleDoubleLeft/>
                        prev 100 stations
                    </button>
                    <div style={{width: 16}}>{playlistLoading && <Spinner radius={10} stroke={3}/>}</div>
                    <button className="btn icon-btn" onClick={handleNextStationsPage}>
                        next 100 stations
                        <FaAngleDoubleRight/>
                    </button>
                </div>}
                <ul className="player-playlist">
                    {!radioActive ? (audioFiles && audioFiles.length > 0) ? audioFiles.map((fileObj: AudioFile, index: number) => (
                            <li
                                key={fileObj.fileName + index}
                                className={`${selectedTrack?.urlObject === fileObj.urlObject && "selected"}`}
                                onClick={() => handleSelectTrack(index)}>
                                <p>{fileObj.fileName}</p>
                            </li>
                        )) : "select audio files from your device"
                        : radiosStationsList.map((radioData: any, index: number) => (
                            !radioData?.disabled && <li key={radioData.id}
                                                        className={`${selectedTrack?.urlObject === radioData.url && "selected"}`}>
                                <div className="player-playlist-radio">
                                    <div>
                                        {(stationLoading && selectedTrack?.urlObject === radioData.url) &&
                                            <span><Spinner radius={10} stroke={3}/></span>}
                                        <button className="link-btn" style={{width: "85%"}}
                                                onClick={() => handleSelectStation(index)}>{radioData.name}</button>
                                    </div>
                                    <span>{user &&
                                        <button className="icon-btn" onClick={() => handleFavorites(radioData.id)}
                                                style={{background: "transparent"}}>
                                            {isFavorite(radioData.id) ? <FaHeart color="red" size="1.2rem"/> :
                                                <FaRegHeart color="red" size="1.2rem"/>}
                                        </button>}
                                </span>
                                </div>
                            </li>))
                    }
                </ul>
            </div>
            {globalSpinner && <Spinner radius={30} stroke={5} fixed={true}/>}
        </div>
    );
}

export default Player;