import React from "react";
import '../css/CardWrapper.css';
function GameCard({ icon, onClick }) {
    return (
        <div className="card-wrapper" onClick={onClick}>
            <div className="card-reflection"></div>
            <div className="card-poster">
                <img src={`file://${icon}`} alt="game poster" className="card-poster-img" />
            </div>
        </div>
    )
}

export default GameCard;