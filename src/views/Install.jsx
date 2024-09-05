import React from "react";
import { useEffect, useState } from "react";
import '../css/Install.css';

import GameCard from "../partials/GameCard";

function Install() {
    const [ games, setGames ] = useState(null);

    const testSignal = () => {
        window.electron.send('open-file-dialog');
    }

    useEffect(() => {
        const getJsonData = async () => {
            const data = await window.electron.getJsonData();
            setGames(data.games);
        }

        getJsonData();
    }, [])


    return (
        <>
            <p className="title">Install Mod</p>

            {!games ?
                <div className="dialog-wrapper">
                    <p className="message">No games library found</p>
                    <button className="btn initialize" onClick={testSignal}>Select Games Directory</button>
                </div>
                : <div className="library-wrapper">
                    {games.map(game => {
                        return (
                            <GameCard title={game.title} icon={game.icon}></GameCard>
                        )
                    })}
                </div>

            }



        </>
    )
}

export default Install;