import { useContext } from 'react';
import GameCard from "./GameCard";
import GamesList from './GamesList';
import Modal from "./Modal";
import { SearchContext } from '../views/Library';

function GamesWrapper({ content, select, resetSearch, searchInputRef, onChange, isActive, setSearchTerm }) {
    const { modalContent, modalOpen } = useContext(SearchContext);

    return (
        <div className="main-wrapper">
            <GamesList content={content} resetSearch={resetSearch} searchInputRef={searchInputRef} onChange={onChange} select={select} isActive={isActive} setSearchTerm={setSearchTerm}></GamesList>

            <div className="library-wrapper">
                <Modal content={modalContent} show={modalOpen} />
               {/*  <div className="games-wrapper">
                    {content.map(game => {
                        return (
                            <GameCard key={game.title} title={game.title} id={game.id} icon={game.icon} onClick={() => { click(game) }}></GameCard>
                        )
                    })}
                </div> */}
            </div >
        </div>
    )
}

export default GamesWrapper;