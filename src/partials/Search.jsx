import { IoRefreshSharp } from "react-icons/io5";
import '../css/Search.css';
import { SearchContext } from '../views/Library.jsx';
import { useRef, useContext } from 'react';
function Search({ searchTerm }) {
  const inputRef = useRef(null);

  const { setSearchTerm, searchInputRef } = useContext(SearchContext)

  const resetSearchTerm = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      setSearchTerm('');
    }
  }
  return (
    <span className="search-wrapper">
      <span className="input-wrapper">
        <span className="search-input-group">
          <input type="text" placeholder="Search for game" className="search-input" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value) }} ref={searchInputRef} />
          <button className="btn refresh" onClick={resetSearchTerm}><IoRefreshSharp size={20} /></button>
        </span>
      </span>
    </span>
  )
}

export default Search;