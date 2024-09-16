import React from "react";
import GameCard from "./GameCard";

function GamesWrapper({ content, select }) {
    const click = (app) => {
        select(app);
    }

    return (<>
        <div className="library-wrapper">
            {content.map(game => {
                return (
                    <GameCard key={game.title} title={game.title} icon={game.icon} onClick={() => { click(game) }}></GameCard>
                )
            })}
        </div >
    </>
    )
}

export default GamesWrapper;