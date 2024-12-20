import { IoRefreshSharp } from "react-icons/io5";
import '../css/Search.css';

function Search({ reset, searchTerm, onChange, inputRef, isGrid, toggleGrid }) {
  return (
    <span className="search-wrapper">
      <span className="input-wrapper">
        <span className="search-input-group">
          <input type="text" placeholder="Search for game" className="search-input" value={searchTerm} onChange={onChange} ref={inputRef} />
          <button className="btn refresh" onClick={reset}><IoRefreshSharp size={20} /></button>
        </span>
      </span>
    </span>
  )
}

export default Search;