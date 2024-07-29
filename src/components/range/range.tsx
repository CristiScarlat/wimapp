import "./range.css";

interface PropsType {
    min: number
    max: number
    step: number
    width: number | string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}
const RangeSlider = ({min=0, max=100, step=1, width="10rem", onChange}: PropsType) => {
    return(
        <div>
            <input type="range" min={min} max={max} step={step} style={{maxWidth: width}} list="markers" onChange={onChange}/>
        </div>
    )
}

export default RangeSlider;