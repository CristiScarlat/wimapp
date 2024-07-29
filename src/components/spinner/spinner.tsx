import "./spinner.css";
interface PropsType {
    radius?: number
    stroke?: number
}
const Spinner = ({radius=5, stroke=3}: PropsType) => {

    return(
        <div className="spinner-container" style={{width: radius, height: radius, borderWidth: stroke}}></div>
  )
}

export default Spinner;