import DropdownMenu from "../dropdownMenu/dropdownMenu";
import {SyntheticEvent, useEffect, useState} from "react";
import InputWithText from "../inputWithButton/inputWithButton";
import {FaHeart, FaRegHeart} from "react-icons/fa";
import { MdClose } from "react-icons/md";
import {getListOfCountries} from "../../services/RBApi";

interface CountryType {
    iso_3166_1: string
    name: string
    stationcount: number
}

const PlaylistHeader = ({user, handleSearch, searchInputRef, toggleFilterByFavorites, filterStationsByFavorites, searchByTerm, setSearchByTerm, handleResetFilters}: any) => {

    const [countries, setCountries] = useState<CountryType[]>([]);

    useEffect(() => {
        getListOfCountries()
            .then(listOfCountries => {
                if(listOfCountries)setCountries(listOfCountries)
            })
            .catch(err => console.log(err));
    }, [])

    const handleSelectCountry = (e: SyntheticEvent<HTMLSelectElement, Event>) => {
        const selectedCountry = countries.find((country: CountryType) => country.name === e.currentTarget.value)
        // @ts-ignore
        handleSearch(selectedCountry.iso_3166_1)
    }

    return (
        <div className="player-playlist-header">
            {filterStationsByFavorites === "all" && <div className="playlist-filterBy-dropdown">
                <label>Search by:</label>
                <DropdownMenu
                    items={["name", "tag", "country"]}
                    className="eq-preset-dropdown"
                    onSelectItem={(e: SyntheticEvent<HTMLSelectElement, Event>) => setSearchByTerm(e.currentTarget.value)}

                />
            </div>}
            {filterStationsByFavorites === "all" && <>
            {searchByTerm === "country" ? <DropdownMenu
                    items={countries.map((countryObj: CountryType) => countryObj?.name)}
                className="eq-preset-dropdown"
                onSelectItem={handleSelectCountry}
                    showDisabledItem
                    disabledLabel="Select a country"
            />
                :
                <InputWithText buttonOnClick={handleSearch} inputRef={searchInputRef}/>}
            </>}
            <div className="playlist-filterBy-dropdown" style={{justifyContent: "flex-end"}}>
                {filterStationsByFavorites === "all" && <button className="btn icon-btn" style={{padding: "0.2rem 0.5rem"}} onClick={handleResetFilters}>
                    <MdClose size="1.2rem" color="white"/>Reset Filters
                </button>}
                <div style={{flex: "1 1 auto"}}>
                    {user && <button className="icon-btn" style={{marginLeft: "auto"}} onClick={toggleFilterByFavorites}>
                        {filterStationsByFavorites === "favorites" ? <FaHeart color="#8907e4" size="2rem"/> :
                            <FaRegHeart color="#8907e4" size="2rem"/>}
                    </button>}
                </div>
            </div>
        </div>
    )
}

export default PlaylistHeader;