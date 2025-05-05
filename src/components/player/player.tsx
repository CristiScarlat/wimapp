import {useEffect, useState, useRef, useCallback, useContext} from "react";
import {FaChevronRight, FaChevronLeft, FaRegHeart, FaHeart} from "react-icons/fa";
import {IoPlaySkipBack, IoPlay, IoStop, IoPlaySkipForward, IoVolumeMute} from "react-icons/io5";
import Range from "../range/range";
import "./player.css";
import Spinner from "../spinner/spinner";
import EqualizerWithAnalyser from "../equalizerWithAnalyser/equalizerWithAnalyser";
import {Ctx} from "../../context/context";
import {
    getAllStations,
    addFavoriteStationToDB,
    removeFavoriteStationFromDB,
    getFavoriteStationsToDB
} from "../../services/db";

import {
    getStationsById,
    formatStationData,
    getStationsByTagName,
    getStationsByStationName,
    getStationsByCountry,
    getStationData
} from "../../services/RBApi";
import PlaylistHeader from "../playlistHeader/playlistHeader";
import Image from "../image/image";


interface RadioStation {
    id: number
    name: string
    url: string
    genre: string
    country: string
    countryCode: string
    homepage: string
    bitrate: number
    favicon: string
}

interface RadioStationMetaData {
    StreamTitle: string
}


const Player = () => {

    const [radiosStationsList, setRadiosStationsList] = useState<RadioStation[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [selectedRadioStation, setSelectedRadioStation] = useState<{ urlObject: string } | undefined>();
    const [playStatus, setPlayStatus] = useState<boolean>(false);
    const [stationLoading, setStationLoading] = useState(false);
    const [playlistLoading, setPlaylistLoading] = useState<boolean>(false);
    const [favoriteStations, setFavoriteStations] = useState<number[]>([]);
    const [filterStationsByFavorites, setFilterStationsByFavorites] = useState<'all' | 'favorites'>('all');
    const [stationsPage, setStationsPage] = useState<number>(0);
    const [searchByTerm, setSearchByTerm] = useState<string>('name');
    const [playerMute, setPlayerMute] = useState<boolean>(false);
    const [streamData, setStreamData] = useState<RadioStationMetaData>({
        StreamTitle: '',
    });
    //@ts-ignore
    const {state: {user, globalSpinner, mobileShow}, dispatch} = useContext(Ctx);

    const playerRef = useRef(new Audio());
    const stationInfoRef = useRef<RadioStation & { page: number, index: number } | undefined>();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const selectedCountryRef = useRef<string>(null);
    const savedPlayerVolume = useRef<number>(0);

    useEffect(() => {
        if (filterStationsByFavorites === 'all') {
            setPlaylistLoading(true);
            if ((searchInputRef.current?.value && searchInputRef.current?.value !== "") || selectedCountryRef.current) {

                switch (searchByTerm) {
                    // @ts-ignore
                    case "name":
                        searchByName();
                        break;
                    // @ts-ignore
                    case "tag":
                        searchByTag();
                        break;
                    case "country":
                        searchByCountry();
                        break;
                }
            }
            else {

                getAllStations(100, stationsPage * 100)
                    .then((data: any) => {
                        console.log(data);
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
    }, [stationsPage, filterStationsByFavorites])

    useEffect(() => {
        if (user && filterStationsByFavorites === 'favorites') {
            setPlaylistLoading(true);
            // @ts-ignore
            Promise.allSettled(favoriteStations.map((stationId: string) => getStationsById(stationId)))
                .then(fetchedFavorites => {
                    const list: RadioStation[] = [];
                    fetchedFavorites.forEach((obj: any) => {
                        if(obj.value.length > 0) list.push(formatStationData(obj.value[0]))
                    })
                    setRadiosStationsList(list);
                    setPlaylistLoading(false);
                })
                .catch((error: any) => {
                    setPlaylistLoading(false);
                    console.log("promise all", error)
                })
        }

    }, [filterStationsByFavorites, user]);


    const handleNextStationsPage = () => {
        if(radiosStationsList.length < 100){
            //TODO disable next page button
            return
        }
        setStationsPage(page => page + 1)
    }

    const handlePrevStationsPage = () => {
        //TODO if stationsPage === 0 disable previous page button
        if (stationsPage > 0) setStationsPage(page => page - 1)
    }

    useEffect(() => {
        if (user) {
            getFavoriteStationsToDB(user.uid)
                .then(data => {
                    setFavoriteStations(data)
                })
                .catch(err => console.log(err))
        } else setFilterStationsByFavorites("all")
    }, [user])


    useEffect(() => {
        if (playerRef) {
            playerRef.current.crossOrigin = "anonymous";
            playerRef.current.autoplay = true;
            playerRef.current.onloadstart = () => setStationLoading(true);
            playerRef.current.onplaying = () => setStationLoading(false);
            playerRef.current.onerror = () => {
                alert("Station offline, please pick another radios station.")
            }
        }
        if(selectedRadioStation?.urlObject) {
            getStationData(selectedRadioStation?.urlObject)
                .then(data => setStreamData(data.data))
                .catch(err => console.log(err))
        }
        const tickId = setInterval(() => {
            if(selectedRadioStation?.urlObject){
                getStationData(selectedRadioStation?.urlObject)
                    .then(data => setStreamData(data.data))
                    .catch(err => console.log(err))
            }
        }, 10000)
        return () => clearInterval(tickId);
    }, [selectedRadioStation])

    useEffect(() => {
        //TODO I think this can be moved to handleSelectStation
        if (selectedRadioStation?.urlObject) playerRef.current.src = selectedRadioStation.urlObject;
        stationInfoRef.current = {...radiosStationsList[currentIndex], page: stationsPage, index: currentIndex}
    }, [selectedRadioStation])


    const handleSelectStation = useCallback((index: number) => {
        setCurrentIndex(index)
        setSelectedRadioStation({urlObject: radiosStationsList[index].url})
    }, [filterStationsByFavorites, radiosStationsList])

    const handlePrevTrack = useCallback(() => {
        // @ts-ignore
        if (currentIndex > 0) {
            setCurrentIndex((state: number) => {
                const prev = state - 1;
                handleSelectStation(prev);
                return prev;
            })
        }
    }, [currentIndex, filterStationsByFavorites, radiosStationsList])

    const handleNextTrack = useCallback(() => {
        // @ts-ignore
        if (currentIndex < radiosStationsList.length - 1) {
            setCurrentIndex((state: number) => {
                const next = state + 1;
                handleSelectStation(next);
                return next;
            })
        }
    }, [filterStationsByFavorites, radiosStationsList, currentIndex])

    const handlePlay = useCallback(() => {
        playerRef.current.play();
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
        setFilterStationsByFavorites(filter => filter === "favorites" ? "all" : "favorites")
    }

    const searchByName = () => {
        const inputSearchValue = searchInputRef.current?.value;
        if (inputSearchValue && inputSearchValue !== "") {
            getStationsByStationName(inputSearchValue, 100, stationsPage * 100)
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

    const searchByTag = () => {
        const inputSearchValue = searchInputRef.current?.value;
        if (inputSearchValue && inputSearchValue !== "") {
            getStationsByTagName(inputSearchValue, 100, stationsPage * 100)
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

    const searchByCountry = () => {
        if(selectedCountryRef?.current){
            console.log(selectedCountryRef.current)
            getStationsByCountry(selectedCountryRef.current, 100, stationsPage * 100)
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

    const handleSearch = (searchTerm: string | undefined) => {
        setPlaylistLoading(true);
        setStationsPage(0);
        switch (searchByTerm) {
            // @ts-ignore
            case "name":
                searchByName();
                break;
            // @ts-ignore
            case "tag":
                searchByTag();
                break;
            case "country":
                //@ts-ignore
                selectedCountryRef.current = searchTerm
                searchByCountry();
                break;
        }

    }

    const handleResetFilters = () => {
        //@ts-ignore
        selectedCountryRef.current = null;
        //@ts-ignore
        searchInputRef.current.value = "";
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

    const handleMute = () => {
        if(playerRef.current.volume > 0)savedPlayerVolume.current = playerRef.current.volume;
        playerRef.current.volume = !playerMute ? 0 : savedPlayerVolume.current;
        setPlayerMute(!playerMute);
    }

    console.log(streamData)
    // @ts-ignore
    return (
        <div className="player-container">
            <div className={`${mobileShow === "player" ? "mobile-show " : ""}player`}>
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
                        <p><img src={stationInfoRef.current?.favicon} alt="no radio icon"/></p>}
                    <p className="tag" style={{borderRadius: 0, whiteSpace: "break-spaces"}}>{streamData?.StreamTitle}</p>
                </div>
                <EqualizerWithAnalyser audioSource={playerRef}/>
                <div className="player-header">

                    <div className="player-menu">
                        <button className="player-control-btn" onClick={handleMute}>
                            <IoVolumeMute size="1.2rem" color={playerMute ? "darkred" : "white"}/>
                        </button>
                        <Range min={0} max={1} step={0.01} width="15rem" onChange={handleVolume}/>
                    </div>
                    <div className="player-control-container">
                        <button className="player-control-btn" onClick={handlePrevTrack}>
                            <IoPlaySkipBack size="1.2rem" color="white"/>
                        </button>
                        <div className="vr"/>
                        <button className={`player-control-btn ${playStatus ? "pressed" : ""}`} onClick={handlePlay}>
                            <IoPlay size="1.2rem" color="white"/>
                        </button>
                        <div className="vr"/>
                        <button className="player-control-btn" onClick={handleStop}>
                            <IoStop size="1.2rem" color="white"/>
                        </button>
                        <div className="vr"/>
                        <button className="player-control-btn" onClick={handleNextTrack}><IoPlaySkipForward
                            size="1.2rem"
                            color="white"/>
                        </button>
                    </div>
                </div>
            </div>
            <div className={`${mobileShow === "playlist" ? "mobile-show " : ""}player-playlist-wrapper`}>
                <PlaylistHeader
                    user={user}
                    handleSearch={handleSearch}
                    searchInputRef={searchInputRef}
                    toggleFilterByFavorites={toggleFilterByFavorites}
                    filterStationsByFavorites={filterStationsByFavorites}
                    searchByTerm={searchByTerm}
                    setSearchByTerm={setSearchByTerm}
                    handleResetFilters={handleResetFilters}
                />
                <div className="player-playlist-pagination">
                    <button className="btn icon-btn" onClick={handlePrevStationsPage}>
                        <FaChevronLeft/>
                        <span>prev 100</span>
                    </button>
                    <div style={{width: 16}}>{playlistLoading && <Spinner radius={10} stroke={3}/>}</div>
                    <button className="btn icon-btn" onClick={handleNextStationsPage}>
                        <span>next 100</span>
                        <FaChevronRight/>
                    </button>
                </div>
                <ul className="player-playlist">
                    {radiosStationsList.map((radioData: any, index: number) => (
                        !radioData?.disabled && <li key={radioData.id}
                                                    className={`${selectedRadioStation?.urlObject === radioData.url && "selected"}`}>
                            <div className="player-playlist-radio">
                                <div>
                                    <button className="icon-btn link-btn"
                                            style={{width: "85%", justifyContent: "flex-start"}}
                                            onClick={() => handleSelectStation(index)}
                                            title={radioData.name}>
                                        {(stationLoading && selectedRadioStation?.urlObject === radioData.url) ?
                                            <Spinner radius={10} stroke={3}/> : <span>{index + 1}</span>}
                                        <Image
                                            title={radioData?.country}
                                            src={`https://flagsapi.com/${radioData?.countryCode}/shiny/64.png`}
                                            style={{width: 28}}
                                            alt="no flag for this country"
                                        />
                                        {radioData.name}
                                    </button>
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