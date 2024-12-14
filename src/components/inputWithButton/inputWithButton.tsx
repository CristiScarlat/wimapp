import "./inputWithButton.css";


interface Props {
    inputPlaceholder?: string
    inputType?: string
    buttonLabel?: string
    buttonOnClick?: () => void
    inputRef: React.LegacyRef<HTMLInputElement> | undefined
}

const InputWithText = ({inputType="text", inputPlaceholder="", buttonLabel="Search", buttonOnClick, inputRef}: Props) => {
    return (
        <div className="input-with-button-container">
            <input type={inputType} placeholder={inputPlaceholder} ref={inputRef}/>
            <button onClick={buttonOnClick}>{buttonLabel}</button>
        </div>
    )
}

export default InputWithText;