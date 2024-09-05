import './css/App.css';
import Install from './views/Install';
import { Routes, Route } from 'react-router-dom'
import Navbar from './partials/Navbar';
import Home from './views/Home';
import Create from './views/Create';
import TitleBar from './partials/TitleBar';
function App() {
  return (
    <>
      <TitleBar />
      <Navbar />
      <Routes>
        <Route path='/' key={'/'} element={
          <Home key={'home'}></Home>
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