import { useEffect, useRef } from "react";
import EqualizerUI from "../equalizerUI/equalizerUI"

const eqFrequencyList = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
interface PropsTypes {
    audioSource: React.RefObject<HTMLMediaElement>
}
const EqualizerWithAnalyser = ({audioSource}: PropsTypes) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isCtxResumed = useRef<boolean>(false);
    const eqAudioFilters = useRef<BiquadFilterNode[]>([]);
    
    const draw = (analyser: any) => {
        requestAnimationFrame(() => draw(analyser));
        if(canvasRef.current){
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);
            const canvasCtx = canvasRef.current.getContext('2d');
            const barWidth = (canvasRef.current.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;
            if(canvasCtx){
                canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                canvasCtx.fillStyle = "#252424";
                canvasCtx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                for (let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i] / 2;
                    canvasCtx.fillStyle = `rgb(${barHeight + 100} 0 255)`;
                    canvasCtx.fillRect(x, canvasRef.current.height - barHeight, barWidth, barHeight);
                    x += barWidth + 1;
                }
            }
        }
    }

    const handleResumeAudioCtx = (audioCtx: AudioContext) => {
        eqFrequencyList.forEach((freq: number) => {
            const filterNode: BiquadFilterNode = audioCtx.createBiquadFilter();
            filterNode.type = "peaking";
            filterNode.frequency.value = freq;
            filterNode.gain.value = 0;
            eqAudioFilters.current.push(filterNode);
        })
        const analyser = audioCtx.createAnalyser();
        let source = null;
        if (audioSource.current) {
            source = audioCtx.createMediaElementSource(audioSource.current);
        }
        if(source)source.connect(eqAudioFilters.current[0]);
        for(let i=1; i<eqAudioFilters.current.length; i++){
            eqAudioFilters.current[i-1].connect(eqAudioFilters.current[i])
        }
        eqAudioFilters.current[eqAudioFilters.current.length-1].connect(analyser);
        analyser.connect(audioCtx.destination);
        if(canvasRef.current){
            draw(analyser);
        }
        audioCtx.resume()
            .then(res => {
                console.log("audio context resumed");
                isCtxResumed.current = true;
            })
            .catch(error => console.log(error))
    }

    useEffect(() => {
        //@ts-ignore
        const audioCtx = new(window.AudioContext || window.webkitAudioContext)();
        // @ts-ignore
        audioSource.current.oncanplay = () => {
            try{
                if(!isCtxResumed.current){
                    handleResumeAudioCtx(audioCtx);
                }
            }
            catch(e: any){
                console.log(e)
            }
        }
    }, [])

    const handleEqValueChange = (obj: any) => {
        eqAudioFilters.current.forEach((filterNode: BiquadFilterNode, index: number) => {
            if(isFinite(obj[index][filterNode.frequency.value])){
                filterNode.gain.value = obj[index][filterNode.frequency.value];
            }

        })
    }

    const handleResetEq = () => {
        eqAudioFilters.current.forEach((filterNode: BiquadFilterNode, index: number) => {
            filterNode.gain.value = 0;
        })
    }

    return(
        <div>
            <canvas ref={canvasRef}/>
            <EqualizerUI freqList={eqFrequencyList} className="eq-style" onPotChange={handleEqValueChange} onResetClick={handleResetEq}/>
        </div>
    )
}

export default EqualizerWithAnalyser;