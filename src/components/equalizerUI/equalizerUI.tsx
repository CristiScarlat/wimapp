import "./equalizerUI.css"
import { TfiArrowCircleDown } from "react-icons/tfi";
import { IoMdAddCircleOutline } from "react-icons/io";
import {FormEvent, SyntheticEvent, useState, useEffect, memo} from "react";
import DropdownMenu from "../dropdownMenu/dropdownMenu";
import {EqPreset, saveEqPreset} from "../../data/playerPreset";
import Modal from "../modal/modal";

interface PropsTypes {
    freqList: number[]
    className?: string
    onPotChange: (x: {[key: number]: number}) => void
    onSelectPreset: (x: EqPreset) => void
    presets: EqPreset[]
    handleAddEqPreset: (x: {[freq: number]: number}) => void
}

const EqualizerUI = ({freqList, className, onPotChange, onSelectPreset, presets, handleAddEqPreset}: PropsTypes) => {

    const [showEq, setShowEq] = useState<boolean>(true);
    const [eqValues, setEqValues] = useState<{[x: number]: number}>({});
    const [showModal, setShowModal] = useState<boolean>(false);

    useEffect(() => {
        const values: {[freq: number]: number} = {};
        freqList.forEach((freq: number) => {
            values[freq] = 0;
        })
        setEqValues(values)
    }, [])

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
        const newValues = {...eqValues}
        if(newValues[freq] !== undefined){
            newValues[freq] = Number(value);
            setEqValues(newValues)
            onPotChange(newValues)
        }

    }

    const handleSetPreset = (selectedPreset: SyntheticEvent<HTMLSelectElement, Event>) => {
        const selectedPresetName: string = selectedPreset.currentTarget.value;
        const found = presets.find((preset: EqPreset) => preset.name === selectedPresetName);
        console.log(presets, found)
        const newValues = {...eqValues}
        if(found){
            for(const freq in newValues){
                newValues[freq] = found.eq[freq];
            }
            setEqValues(newValues)
            onSelectPreset(found)
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleAddEqPreset(eqValues);
    }

    console.log("render Equaliser")

    return(
        <div className={`${className} eq-wrapper`}>
            <div className="eq-header">
                <div className="d-flex">
                    <DropdownMenu
                        items={presets.map((preset: EqPreset) => preset.name)}
                        onSelectItem={handleSetPreset}
                        className="eq-preset-dropdown"/>
                    <button className="icon-btn" style={{background: "transparent"}} onClick={() => setShowModal(true)}>
                        <IoMdAddCircleOutline size="1.2rem" color="white" />
                    </button>
                </div>
                <div className="d-flex">
                    <span>Equalizer</span>
                    <button className="close-btn" onClick={handleShowEq}>
                        <TfiArrowCircleDown size="1.2rem" color="white" style={{transform: showEq ? "rotate(180deg)" : "rotate(0deg)"}}/>
                    </button>
                </div>
            </div>
            <div className="eq-slides-container" style={{height: showEq ? 189 : 0}}>
                {freqList.map((freq: number, index: number) => (
                    <div key={freq}>
                        <label style={{fontSize: 9, color: 'white'}}>{formatFreq(freq)}</label>
                        <input type="range" min={-12} max={12} step={0.1} className="eq-slide" value={eqValues[freq] | 0} onChange={(e: any) => handlePot(e.target.value, freq)}/>
                    </div>
                ))}
            </div>
            {showModal && <Modal onCloseBtnClick={() => setShowModal(false)} title="Save Eq Preset">
                <form onSubmit={handleSubmit} className="preset-modal-form">
                    <input placeholder="Preset Name" name="presetName"/>
                    <button type="submit" className="player-control-btn">Save</button>
                </form>
            </Modal>}
        </div>
    )
}

export default memo(EqualizerUI);