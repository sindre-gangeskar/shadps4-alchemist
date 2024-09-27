import React from "react";
import '../css/CardWrapper.css';
function GameCard({ title, icon, onClick, isGrid, id }) {
    return (
        isGrid ? (
            <div className="card-wrapper" onClick={onClick}>
                <div className="card-reflection"></div>
                <div className="card-poster">
                    <img src={`file://${icon}`} alt="game poster" className="card-poster-img" />
                </div>
            </div>
        ) : (
            <div className="card-wrapper list" onClick={onClick}>
                <div className="card-poster list">
                    <img src={`file://${icon}`} alt="game poster" className="card-poster-img list" />
                </div>
                <div className="card-footer list">
                    <p>{title}</p>
                    <p>{id}</p>
                </div>
            </div>
        )
    )
}

export default GameCard;