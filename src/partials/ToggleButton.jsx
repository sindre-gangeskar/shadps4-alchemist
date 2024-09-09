import React from 'react';
import '../css/ToggleButton.css';
function ToggleButton({ checked, onClick }) {
    return (
        <button className={`toggle-btn ${checked ? 'toggled' : ''}`} checked={checked} onClick={onClick}>
            <div className="thumb"></div>
        </button>
    )
}

export default ToggleButton;