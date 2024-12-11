import {
    FormEvent,
    SyntheticEvent,
    RefObject,
    MutableRefObject,
    useState,
    useEffect,
    useRef,
    memo,
    useCallback,
    useContext
} from "react";
import { Ctx } from "../../context/context";
import { TfiArrowCircleDown } from "react-icons/tfi";
import { IoMdTrash, IoMdCreate, IoMdSettings } from "react-icons/io";
import DropdownMenu from "../dropdownMenu/dropdownMenu";
import {EqPreset, eqPresetsList, getEqPreset, saveEqPreset} from "../../data/playerPreset";
import Modal from "../modal/modal";
import "./equalizerUI.css"

interface PropsTypes {
    freqList: number[]
    className?: string
    onPotChange: (x: {[key: number]: number}) => void
    onSelectPreset: (x: EqPreset) => void
}

const EqualizerUI = ({freqList, className, onPotChange, onSelectPreset}: PropsTypes) => {

    const [showEq, setShowEq] = useState<boolean>(true);
    const [eqValues, setEqValues] = useState<{[x: number]: number}>({});
    const [showModal, setShowModal] = useState<boolean>(false);
    const [presetsList, setPresetsList] = useState<EqPreset[]>([]);
    const [selectedEdit, setSelectedEdit] = useState<string>();

    const newPresetInput = useRef<any>();
    const selectedEditPresetInput = useRef<any>();

    //@ts-ignore
    const {state: {user}} = useContext(Ctx);

    console.log(user)

    useEffect(() => {
        const values: {[freq: number]: number} = {};
        freqList.forEach((freq: number) => {
            values[freq] = 0;
        })
        setEqValues(values)
        getEqPreset(user?.uid)
            .then((data: any) => {
                console.log(data)
                setPresetsList(data)
            })
            .catch(err => console.log(err))

    }, [user])

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
        const found = presetsList.find((preset: EqPreset) => preset.name === selectedPresetName);
        const newValues = {...eqValues}
        if(found){
            for(const freq in newValues){
                newValues[freq] = found.eq[freq];
            }
            setEqValues(newValues)
            onSelectPreset(found)
        }
    }

    const handleAddNewPreset = () => {
        const newPresetName = newPresetInput.current.value;
        const found: number = presetsList.findIndex((preset: EqPreset) => preset.name === newPresetName);
        if(found >= 0){
            alert("Preset name already exists, you can update it.");
            return
        }
        if(newPresetName){
            setPresetsList([...presetsList, {name: newPresetName, eq: eqValues}]);
        }
    }

    const handleDeletePreset = (presetName: string) => {
        const userConfirm = window.confirm(`Are you sure you want to delete ${presetName} eq preset?`);
        if(presetName && userConfirm){
            setPresetsList(presetsList.filter(preset => preset.name !== presetName));
        }
    }

    const handleUpdatePreset = (presetIndex: number) => {
        const selectedPresetNewName = selectedEditPresetInput.current;
        const found: EqPreset | undefined = presetsList[presetIndex];
        if(found){
            found.name = selectedPresetNewName;
        }
        setSelectedEdit(undefined)
    }

    const showEditTrashBtns = (presetName: string): boolean => {
        const defaultPresets: string[] = eqPresetsList.map((preset: EqPreset) => preset.name);
        return !defaultPresets.includes(presetName);

    }

    const handleSaveEqPresets = async () => {
        await saveEqPreset(user.uid, filterDefaultPresets(presetsList));
        setShowModal(false)
    }

    const filterDefaultPresets = (presets: EqPreset[]) => {
        const defaultPresets: string[] = eqPresetsList.map((preset: EqPreset) => preset.name);
        return presets.filter(preset => !defaultPresets.includes(preset.name));
    }

    console.log("render EqualiserUI", {presetsList})

    return(
        <div className={`${className} eq-wrapper`}>
            <div className="eq-header">
                <div className="d-flex">
                    <DropdownMenu
                        items={presetsList.map((preset: EqPreset) => preset.name)}
                        onSelectItem={handleSetPreset}
                        className="eq-preset-dropdown"/>
                    {user && <button className="icon-btn" style={{background: "transparent"}} onClick={() => setShowModal(true)}>
                        <IoMdSettings size="1.2rem" color="white"/>
                    </button>}
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
                        <input type="range" min={-12} max={12} step={0.1} className="eq-slide"
                               value={eqValues[freq] | 0} onChange={(e: any) => handlePot(e.target.value, freq)}/>
                    </div>
                ))}
            </div>
            {showModal && <Modal onCloseBtnClick={() => setShowModal(false)} title="Save Eq Preset">
                <div className="preset-modal-form">
                    <div>
                        <input placeholder="Preset Name" name="presetName" ref={newPresetInput}/>
                        <button
                            className="player-control-btn"
                            onClick={handleAddNewPreset}
                        >
                            Add new
                        </button>
                    </div>
                    <div>
                        {filterDefaultPresets(presetsList).map((preset: EqPreset, index: number) => (
                            <div>
                                {selectedEdit === preset.name ?
                                    <input placeholder={preset.name} onChange={(e) => selectedEditPresetInput.current = e.target.value}/>
                                    :
                                    <span>{preset.name}</span>}
                                <div>
                                    {showEditTrashBtns(preset.name) && <>
                                        <button onClick={() => selectedEdit === preset.name ? handleUpdatePreset(index) : setSelectedEdit(preset.name)}>
                                        {selectedEdit === preset.name ? "ok" : <IoMdCreate size="1.2rem"/>}
                                    </button>
                                    <button onClick={() => handleDeletePreset(preset.name)}><IoMdTrash size="1.2rem"/>
                                    </button>
                                    </>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="player-control-btn" onClick={handleSaveEqPresets}>Save</button>
                    <button className="player-control-btn" style={{marginRight: "1rem"}} onClick={() => setShowModal(false)}>Cancel</button>
                </div>
            </Modal>}
        </div>
    )
}

export default memo(EqualizerUI);