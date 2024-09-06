import React from "react";
function GameCard({ title, icon, onClick }) {
    return (
        <div className="card-wrapper" key={title} onClick={onClick}>
            <div className="card-reflection"></div>
            <img src={`file://${icon}`} alt="game poster" className="card-poster" />
            <div className="card-footer">
                <p>{title}</p>
            </div>
        </div>
    )
}

export default GameCard;