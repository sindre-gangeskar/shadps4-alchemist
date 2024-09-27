import React from "react";
import GameCard from "./GameCard";

function GamesWrapper({ content, select, isGrid }) {
    const click = (app) => {
        select(app);
    }

    return (<>
        <div className={`library-wrapper ${isGrid ? 'grid' : 'list'}`}>
            {content.map(game => {
                return (
                    <GameCard key={game.title} title={game.title} id={game.id} icon={game.icon} isGrid={isGrid} onClick={() => { click(game) }}></GameCard>
                )
            })}
        </div >
    </>
    )
}

export default GamesWrapper;