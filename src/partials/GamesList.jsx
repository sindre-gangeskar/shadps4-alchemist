import '../css/GamesList.css';
import Search from './Search';

import { useState } from 'react';

function GamesList({ content, select, onReset }) {
  const [ active, setActive ] = useState(null);
  return (
    <ul className="games-list">
      <Search onReset={onReset} />
      {content.length == 0 ? <li key={0}><span>No games found</span></li> : ''}
      {content.map(game => {
        return (<li key={game.id} className={`list-item ${active == game ? 'active' : ''}`} onClick={() => { select(game); setActive(game); }} ><span className='item-content' ><img src={game.icon} className="list-icon" />{game.title}</span></li>)
      })}

    </ul>
  )
}

export default GamesList;