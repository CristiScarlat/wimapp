import { useEffect, useRef } from "react";

interface PropsTypes {
    audioSource: React.RefObject<HTMLMediaElement>
}
const EqualizerWithAnalyser = ({audioSource}: PropsTypes) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isCtxResumed = useRef<boolean>(false);
    
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
        const filterNode = audioCtx.createBiquadFilter();
        filterNode.type = "peaking";
        filterNode.frequency.setValueAtTime(10000, audioCtx.currentTime);
        filterNode.gain.setValueAtTime(8, audioCtx.currentTime);
        const analyser = audioCtx.createAnalyser();
        let source = null;
        if (audioSource.current) {
            source = audioCtx.createMediaElementSource(audioSource.current);
        }
        if(source)source.connect(filterNode);
        filterNode.connect(analyser);
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
        console.log(">>>", audioCtx)
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

    return(
        <div>
            <canvas ref={canvasRef}/>
        </div>
    )
}

export default EqualizerWithAnalyser;