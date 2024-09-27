import { IoRefreshSharp } from "react-icons/io5";
import { FaListUl } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
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
      <span className="controls-wrapper">
        <button className="btn" onClick={toggleGrid}>{isGrid ? <IoGrid size={20} /> : <FaListUl  size={20}/>}</button>
      </span>
    </span>
  )
}

export default Search;