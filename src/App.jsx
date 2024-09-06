import './css/App.css';
import Install from './views/Install';
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './partials/Navbar';
import Options from './views/Options';
import Create from './views/Create';
import TitleBar from './partials/TitleBar';
import { useEffect } from 'react';
function App() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/install')
  }, [])

  return (
    <>
      <TitleBar />
      <Navbar />
      <Routes>
        <Route path='/options' key={'/options'} element={
          <Options key={'options'}></Options>
        }></Route>
        <Route path='/install' key={'/install'} element={
          <Install key={'install'} />
        }></Route>
        <Route path='/create' key={'/create'} element={
          <Create key={'create'} />
        }></Route>
      </Routes>
    </>
  );
}

export default App;