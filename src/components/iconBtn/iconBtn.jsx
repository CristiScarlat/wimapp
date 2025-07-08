import "./iconBtn.css"

const IconBtn = ({label, onClick, children, className}) => {
    return <button onClick={onClick} className={`icon-btn-pagination ${className}`}>
        {label}
        {children}
    </button>
}

export default IconBtn;
