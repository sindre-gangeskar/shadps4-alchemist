import React from "react";

function Tooltip({ content, visible, type }) {
    return (
        <div className={`tooltip-wrapper ${type ? type : ''} ${visible === true ? 'show' : 'hide'}`}>
            {content?.header}
            {content?.body}
            {content?.footer}
        </div>
    )
}

export default Tooltip;