import "./spinner.css";
interface PropsType {
    radius?: number
    stroke?: number
    fixed?: boolean
}
const Spinner = ({radius=5, stroke=3, fixed=false}: PropsType) => {

    return(
        fixed ? <div className="spinner-fixed-container">
                <div className="spinner-container" style={{width: radius, height: radius, borderWidth: stroke}}></div>
            </div>
            :
            <div className="spinner-container" style={{width: radius, height: radius, borderWidth: stroke}}></div>
  )
}

export default Spinner;