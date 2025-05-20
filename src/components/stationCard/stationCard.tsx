
interface PropsTypes {
    stationData: RadioStation
}

const StationCard = ({stationData}: PropsTypes) => {

    return (
        <div className="stationCard">
            {stationData?.favicon ? <img src={stationData.favicon} alt="" /> : <div className="img-replace"></div>}
            <p>{stationData?.name}</p>
        </div>
    )
}

export default StationCard;