import React from "react";
import GameCard from "./GameCard";
import GamesList from './GamesList';
function GamesWrapper({ content, select, resetSearch, searchInputRef, onChange, isActive }) {
    const click = (app) => {
        select(app);
    }

    return (<>
        <div className="main-wrapper">
            <GamesList content={content} resetSearch={resetSearch} searchInputRef={searchInputRef} onChange={onChange} select={select} isActive={isActive}></GamesList>
            <div className={`library-wrapper`}>
                {content.map(game => {
                    return (
                        <GameCard key={game.title} title={game.title} id={game.id} icon={game.icon} onClick={() => { click(game) }}></GameCard>
                    )
                })}
            </div >
        </div>
    </>
    )
}

export default GamesWrapper;