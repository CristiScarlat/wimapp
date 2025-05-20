import {useEffect, useState} from "react";
import {getAllStations} from "../services/db";
import StationCard from "../components/stationCard/stationCard";


const Home = () => {

    const [stations, setStations] = useState<RadioStation[]>([])

    useEffect(() => {
        getAllStations(100, 0)
            .then(data => setStations(data))
            .catch((error: any) => console.log(error))
    }, []);

    console.log(stations);
    return (
        <div>
            <div className="cards-list">
                {stations.map((station) => (
                    <StationCard key={station.id} stationData={station} />
                ))}
            </div>
        </div>
    )
}

export default Home;