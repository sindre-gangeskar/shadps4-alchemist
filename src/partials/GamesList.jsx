import '../css/GamesList.css';
import Search from './Search';

import { useState } from 'react';

function GamesList({ content, resetSearch, searchInputRef, onChange, select }) {
  const [ active, setActive ] = useState(null);
  return (
    <ul className="games-list">
      <Search reset={resetSearch} inputRef={searchInputRef} onChange={onChange} />
      {content.map(game => {
        return (
          <li key={game.id} className={`list-item ${active == game ? 'active' : ''}`} onClick={() => { select(game); setActive(game); }} ><span className='item-content' ><img src={game.icon} className="list-icon" />{game.title}</span></li>
        )
      })}
    </ul>
  )
}

export default GamesList;