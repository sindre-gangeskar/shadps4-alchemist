import React from "react";

function Tooltip({ content, visible }) {
    return (
        <div className={`tooltip-wrapper ${visible === true ? 'show' : 'hide'}`}>
            {content?.header}
            {content?.body}
            {content?.footer}
        </div>
    )
}

export default Tooltip;