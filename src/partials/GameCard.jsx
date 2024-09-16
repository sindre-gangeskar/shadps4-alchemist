import React from "react";
function GameCard({ title, icon, onClick }) {
    return (
        <div className="card-wrapper" onClick={onClick}>
            <div className="card-reflection"></div>
            <div className="card-poster">
                <img src={`file://${icon}`} alt="game poster" className="card-poster-img" />
            </div>
            <div className="card-footer">
                <p>{title}</p>
            </div>
        </div>
    )
}

export default GameCard;