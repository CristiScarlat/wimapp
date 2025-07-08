import "./playerControls.css"

const PlayerControls = () => {
    return (
        <div className="playerControls">
            <div>
                <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25.7664 55.3867V24.6167H22.4331V55.3834L25.7664 55.3867ZM57.5664 55.3867V24.6167L34.4831 40L57.5664 55.3867Z" fill="#0E5D4E"/>
                </svg>
            </div>
            <div>
                <div>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="47" height="47" rx="23.5" fill="#F9F2E9"/>
                        <rect x="0.5" y="0.5" width="47" height="47" rx="23.5" stroke="#0E5D4E"/>
                        <path d="M16 10.28V38.28L38 24.28L16 10.28Z" fill="#0E5D4E"/>
                    </svg>
                    <input type="range" min="0" max="1" step="0.01"/>
                </div>
            </div>
            <div>
                <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M54.2336 55.3867V24.6167H57.5669V55.3834L54.2336 55.3867ZM22.4336 55.3867V24.6167L45.5169 40L22.4336 55.3867Z" fill="#0E5D4E"/>
                </svg>
            </div>
        </div>
    )
}

export default PlayerControls;