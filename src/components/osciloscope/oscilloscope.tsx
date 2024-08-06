import { useEffect, useRef } from "react";

interface PropsTypes {
    audioSource: React.RefObject<HTMLMediaElement>
}
const Oscilloscope = ({audioSource}: PropsTypes) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const draw = (analyser: any) => {
        if(canvasRef.current){
            analyser.fftSize = 2048;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteTimeDomainData(dataArray);
            const canvasCtx = canvasRef.current.getContext('2d');
            const drawVisual = requestAnimationFrame(() => draw(analyser));
            analyser.getByteTimeDomainData(dataArray);
            if(canvasCtx){
                canvasCtx.fillStyle = "#252424";
                canvasCtx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                canvasCtx.lineWidth = 2;
                canvasCtx.strokeStyle = "#5145fc";
                canvasCtx.beginPath();
                const sliceWidth = canvasRef.current.width / bufferLength;
                let x = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const v = dataArray[i] / 128.0;
                    const y = v * (canvasRef.current.height / 2);

                    if (i === 0) {
                        canvasCtx.moveTo(x, y);
                    } else {
                        canvasCtx.lineTo(x, y);
                    }

                    x += sliceWidth;
                }
                canvasCtx.lineTo(canvasRef.current.width, canvasRef.current.height / 2);
                canvasCtx.stroke();
            }
        }
    }

    const handleResumeAudioCtx = (audioCtx: AudioContext) => {
        const analyser = audioCtx.createAnalyser();
        let source = null;
        if (audioSource.current) {
            source = audioCtx.createMediaElementSource(audioSource.current);
        }
        if(source)source.connect(analyser);
        analyser.connect(audioCtx.destination);
        if(canvasRef.current){
            draw(analyser);
        }
        audioCtx.resume()
            .then(res => console.log("audio context resumed"))
            .catch(error => console.log(error))
    }

    useEffect(() => {
        //@ts-ignore
        const audioCtx = new(window.AudioContext || window.webkitAudioContext)();
        // @ts-ignore
        audioSource.current.onplay = () => {
            if(audioCtx.state === "suspended") handleResumeAudioCtx(audioCtx);
        }
    }, [])

    return(
        <div>
            <canvas ref={canvasRef}/>
        </div>
    )
}

export default Oscilloscope;