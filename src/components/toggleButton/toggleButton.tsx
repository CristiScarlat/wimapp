import "./toggleButton.css"

const ToggleButton = ({onChange}: any) => (
    <label className="switch">
        <input type="checkbox" onChange={onChange} />
        <span className="slider round"></span>
    </label>
)

export default ToggleButton;