import React from "react";
function GameCard({ title, icon }) {
    console.log(icon);

    return (
        <div className="card-wrapper" key={title}>
            <div className="card-reflection"></div>
            <img src={`file://${icon}`} alt="game poster" className="card-poster" />
            <div className="card-footer">
                <p>{title}</p>
            </div>
        </div>
    )

}

export default GameCard;