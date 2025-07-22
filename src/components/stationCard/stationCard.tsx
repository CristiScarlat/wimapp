import { useContext } from 'react';
import { Ctx } from '../../context/context';
import Image from "../image/image";
import "./stationCard.css";

interface PropsTypes {
    stationData: RadioStation
    onClick?: () => void
}

const StationCard = ({ stationData }: PropsTypes) => {

    //@ts-ignore
    const { dispatch, state } = useContext(Ctx);

    const handleSelectStation = (stationUrl: string) => {
        dispatch({ type: "SELECTED_URL_TO_PLAY", payload: stationUrl });
    }

    return (
        <div className="stationCard" onClick={() => handleSelectStation(stationData.url_resolved)} style={state.selectedUrlToPlay === stationData.url_resolved ? {backgroundColor: "#bdbcbc"} : {}}>
            <div>
                <div>
                    <p className="stationCard-title">{stationData?.name}</p>
                    {stationData?.favicon ? <img src={stationData.favicon} alt="favicon" style={{maxWidth: 150}}/> : <div className="img-replace">
                        <svg width="100" height="105" viewBox="0 0 43 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.63422 45.7343C-4.61566 37.7343 8.75933 31.2343 13.2592 33.9843C13.3843 27.7343 13.2608 14.6379 13.1343 12.1093C13.0093 9.60925 15.301 7.73425 16.6343 7.10925C23.3427 5.02593 37.2593 0.709278 39.2593 0.109278C41.2593 -0.490722 42.5093 1.52594 42.8843 2.60928V35.2343C41.7593 39.2343 32.8843 45.8593 26.5093 39.3593C22.0093 29.2343 34.2593 27.1926 39.2593 28.6093C39.301 23.6509 39.3593 13.6093 39.2593 13.1093C39.1593 12.6093 38.551 12.4009 38.2593 12.3593C32.301 14.1926 20.0343 17.9593 18.6343 18.3593C17.2343 18.7593 16.7177 19.9426 16.6343 20.4843C16.676 27.3593 16.7343 41.1343 16.6343 41.2343C14.0093 49.1093 4.38434 47.8593 1.63422 45.7343Z" fill="#0E5D4E" />
                        </svg>
                    </div>}
                </div>
                <div>
                    <div className="stationCard-country">
                        <Image
                            title={stationData?.country}
                            src={`https://flagsapi.com/${stationData?.countrycode}/flat/64.png`}
                            style={{ width: 28 }}
                            alt="no flag for this country"
                        />
                        <p>{stationData?.country}</p>
                    </div>
                </div>
            </div>
            <div className="stationCard-footer">
                <svg className="stationCard-favorite-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.24 12.25C3.84461 11.8572 3.53134 11.3897 3.31845 10.8747C3.10556 10.3596 2.99731 9.80733 3 9.25002C3 8.12285 3.44777 7.04184 4.2448 6.24481C5.04183 5.44778 6.12283 5.00002 7.25 5.00002C8.83 5.00002 10.21 5.86002 10.94 7.14002H12.06C12.4311 6.48908 12.9681 5.94811 13.6163 5.57219C14.2645 5.19628 15.0007 4.99886 15.75 5.00002C16.8772 5.00002 17.9582 5.44778 18.7552 6.24481C19.5522 7.04184 20 8.12285 20 9.25002C20 10.42 19.5 11.5 18.76 12.25L11.5 19.5L4.24 12.25ZM19.46 12.96C20.41 12 21 10.7 21 9.25002C21 7.85763 20.4469 6.52227 19.4623 5.53771C18.4777 4.55314 17.1424 4.00002 15.75 4.00002C14 4.00002 12.45 4.85002 11.5 6.17002C11.0151 5.49652 10.3766 4.94834 9.63748 4.57095C8.89835 4.19356 8.0799 3.99784 7.25 4.00002C5.85761 4.00002 4.52226 4.55314 3.53769 5.53771C2.55312 6.52227 2 7.85763 2 9.25002C2 10.7 2.59 12 3.54 12.96L11.5 20.92L19.46 12.96Z" fill="#9F1111" />
                </svg>
            </div>
        </div>
    )
}

export default StationCard;