import { useState } from "react";


const Image = (props: any) => {

    const [error, setError] = useState<boolean>(false);


    return(
        error ? <div style={{display: error ? "block" : "none"}}></div> : <img {...props} onError={() => setError(true)} onLoad={() => setError(false)} />
    )
}

export default Image;