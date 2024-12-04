import {ReactNode} from "react";
import { IoMdClose } from "react-icons/io";
import "./modal.css";

interface Props {
    children: ReactNode
    onCloseBtnClick?: () => void
    title: string
}

const Modal = ({children, onCloseBtnClick, title}: Props) => {
    return (
        <div className="modal-wrapper">
            <div className="modal-content">
                <div className="modal-header">
                    <p>{title}</p>
                    <button onClick={onCloseBtnClick}>
                        <IoMdClose color="white"/>
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    )
}

export default Modal;