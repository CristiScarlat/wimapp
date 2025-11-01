import {ReactNode} from "react";
import { IoMdClose } from "react-icons/io";
import "./modal.css";

interface Props {
    children: ReactNode
    onCloseBtnClick?: () => void
    title: string
    showCloseBtn?: boolean
}

const Modal = ({children, onCloseBtnClick, title, showCloseBtn=true}: Props) => {
    return (
        <div className="modal-wrapper">
            <div className="modal-content">
                <div className="modal-header">
                    <p>{title}</p>
                    {showCloseBtn && <button onClick={onCloseBtnClick}>
                        <IoMdClose color="white"/>
                    </button>}
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    )
}

export default Modal;