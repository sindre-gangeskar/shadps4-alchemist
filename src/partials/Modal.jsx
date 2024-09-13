import React from "react";
import '../css/Modal.css';
function Modal({ content, show }) {

    return (
        <div className={`modal-wrapper ${show ? 'show' : 'hide'}`} show={show}>
            {content?.header}
            {content?.body}
            {content?.footer}
            {content?.backdrop}
        </div>
    )
}

export default Modal;