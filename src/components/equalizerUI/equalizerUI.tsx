import "./equalizerUI.css"
import { TfiArrowCircleDown } from "react-icons/tfi";
import { useState } from "react";
interface PropsTypes {
    freqList: number[]
    className?: string
    onPotChange: (x: {[key: number]: number}[]) => void
    onResetClick: () => void
}

const EqualizerUI = ({freqList, className, onPotChange, onResetClick}: PropsTypes) => {

    const [showEq, setShowEq] = useState<boolean>(true);
    const [eqValues, setEqValues] = useState<{[x: number]: number}[]>(freqList.map(freq => ({[freq]: 0})))
    const formatFreq = (freq: number):string => {
        if(freq >= 1000){
            return `${freq/1000} Khz`
        }
        return freq.toString()
    }

    const handleShowEq = () => {
        setShowEq(state => !state)
    }

    const handlePot = (value: string, freq: number) => {
        const newList = eqValues.map((obj: {[x: number]: number}) => {
            if(freq in obj){
                obj[freq] = Number(value);
            }
            return obj;
        })
        setEqValues(newList)
        onPotChange(newList)
    }

    const handleResetButtonClick = () => {
        onResetClick();
        const newList = freqList.map((freq: number) => {
            return {[freq]: 0}
        })
        setEqValues(newList)
    }


    return(
        <div className={`${className} eq-wrapper`}>
            <div className="eq-header">
                <button className="player-control-btn" style={{color: "white", fontWeight: 800}} onClick={handleResetButtonClick}>reset</button>
                <span>Equalizer</span>
                <button className="close-btn" onClick={handleShowEq}>
                    <TfiArrowCircleDown size="1.2rem" color="white" style={{transform: showEq ? "rotate(180deg)" : "rotate(0deg)"}}/>
                </button>
            </div>
            <div className="eq-slides-container" style={{height: showEq ? 189 : 0}}>
                {freqList.map((freq: number, index: number) => (
                    <div key={freq}>
                        <label style={{fontSize: 9, color: 'white'}}>{formatFreq(freq)}</label>
                        <input type="range" min={-12} max={12} step={0.1} className="eq-slide" value={eqValues[index][freq] | 0} onChange={(e: any) => handlePot(e.target.value, freq)}/>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default EqualizerUI;