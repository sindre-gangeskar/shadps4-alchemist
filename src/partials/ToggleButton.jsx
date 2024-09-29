import React from 'react';
import '../css/ToggleButton.css';
function ToggleButton({ checked, onClick, clickable = true }) {
    return (
        <button className={`toggle-btn ${checked ? 'toggled' : ''} ${clickable ? 'clickable' : 'disabled'}`} checked={checked} onClick={onClick}>
            <div className="thumb"></div>
        </button>
    )
}

export default ToggleButton;