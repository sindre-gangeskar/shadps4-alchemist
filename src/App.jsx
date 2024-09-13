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
  const [ message ] = useGlobalStateStore(state => [ state.message ]);
  const [ type ] = useGlobalStateStore(state => [ state.type ]);
  const [ tooltipContent, setToolTipContent ] = useGlobalStateStore(state => [ state.tooltipContent, state.setToolTipContent ]);
  const [ tooltipVisible, setToolTipVisible ] = useGlobalStateStore(state => [ state.tooltipVisible, state.setToolTipVisible ]);
  var errorObj = {};
  var messageObj = {};
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

      setToolTipContent(errorObj);
    }

    if (message) {
      if (message.header) messageObj.header = message.header;
      if (message.body) messageObj.body = message.body;
      if (message.footer) messageObj.footer = message.footer;
      setToolTipContent(messageObj);
    }
  }, [ error, message ])


  useEffect(() => {
    if (tooltipContent !== null)
      setToolTipVisible(true);
    else setToolTipVisible(false);
    
    const awaitFade = async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 2000)
      })
    }
    if (type === 'success') {
      const fadeOut = async () => {
        await awaitFade();
        setToolTipVisible(false);
      }
      fadeOut();
    }

  }, [ tooltipContent, type ])

  return (
    <>
      <TitleBar />
      <Navbar />
      <Tooltip content={tooltipContent} visible={tooltipVisible} type={type} />
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