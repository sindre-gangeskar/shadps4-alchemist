import './css/App.css';
import './css/Tooltip.css';
import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'

import Install from './views/Install';
import Navbar from './partials/Navbar';
import Options from './views/Options';
import Create from './views/Create';
import TitleBar from './partials/TitleBar';
import Tooltip from './partials/Tooltip';
import useGlobalStateStore from './js/globalStateStore';

function App() {
  const [ error ] = useGlobalStateStore(state => [ state.error ]);
  const [ tooltipContent, setToolTipContent ] = useGlobalStateStore(state => [ state.tooltipContent, state.setToolTipContent ]);
  const [ tooltipVisible, setToolTipVisible ] = useGlobalStateStore(state => [ state.tooltipVisible, state.setToolTipVisible ]);
  var errorObj = {};

  const navigate = useNavigate();
  useEffect(() => {
    navigate('/install')
  }, [])

  /* Handle Errors */
  useEffect(() => {
    if (error) {
      if (error.header)
        errorObj.header = error.header;
      if (error.body)
        errorObj.body = error.body;
      if (error.footer)
        errorObj.footer = error.footer;
    }

    setToolTipContent(errorObj);
    if (tooltipContent !== null)
      setToolTipVisible(true);
    else setToolTipVisible(false);
  }, [ error ])

  return (
    <>
      <TitleBar />
      <Navbar />
      <Tooltip content={tooltipContent} visible={tooltipVisible} />
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