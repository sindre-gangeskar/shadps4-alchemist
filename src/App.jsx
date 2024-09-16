import './css/App.css';
import './css/Tooltip.css';
import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'

import Install from './views/Install';
import Navbar from './partials/Navbar';
import Options from './views/Options';
import Create from './views/Create';
import ProcessActive from './views/ProcessActive';
import TitleBar from './partials/TitleBar';
import Tooltip from './partials/Tooltip';
import useGlobalStateStore from './js/globalStateStore';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle } from "react-icons/fa";

function App() {
  const [ type, setType ] = useGlobalStateStore(state => [ state.type, state.setType ]);
  const [ setProcessActive ] = useGlobalStateStore(state => [ state.setProcessActive ])
  const [ tooltipContent, setToolTipContent ] = useGlobalStateStore(state => [ state.tooltipContent, state.setToolTipContent ]);
  const [ tooltipVisible, setToolTipVisible ] = useGlobalStateStore(state => [ state.tooltipVisible, state.setToolTipVisible ]);
  const [ message, setMessage ] = useGlobalStateStore(state => [ state.message, state.setMessage ]);

  /* Settings */
  const [ setFullscreen ] = useGlobalStateStore(state => [ state.setFullscreen ]);
  const [ setIsPS4Pro ] = useGlobalStateStore(state => [ state.setIsPS4Pro ]);
  const [ setShowSplash ] = useGlobalStateStore(state => [ state.setShowSplash ]);
  const [ setVBlankDivider ] = useGlobalStateStore(state => [ state.setVBlankDivider ]);
  const [ screenWidth, setScreenWidth ] = useGlobalStateStore(state => [ state.screenWidth, state.setScreenWidth ]);
  const [ screenHeight, setScreenHeight ] = useGlobalStateStore(state => [ state.screenHeight, state.setScreenHeight ]);
  const [ setLogType ] = useGlobalStateStore(state => [ state.setLogType ]);

  const navigate = useNavigate();

  const hideTooltip = async () => {
    setToolTipVisible(false);
  }

  /* Check for ShadPS4 Process */
  useEffect(() => {
    const handleShadPS4ProcessListener = async (event, data) => {
      if (data) {
        if (data.processStatus === 'active') {
          navigate('/process-active');
          setProcessActive(true);
        }
        if (data.processStatus === 'inactive') {
          navigate('/install');
          setProcessActive(false);
        }
      }
    }
    window.electron.on('shadPS4-process', handleShadPS4ProcessListener);
    return () => {
      window.electron.removeListener('shadPS4-process', handleShadPS4ProcessListener);
    }
  }, [])

  /* Set tooltip messages / error messages */
  useEffect(() => {
    window.electron.on('message', (event, message) => {
      if (message) {
        /* Success State */
        if (message.type === 'success') {
          setType('success')
          const header = <div className="tooltip-header success">
            <p className="tooltip-title-success">{message.name}</p>
          </div>

          const body = <div className="tooltip-body success">
            <p>{message.message}</p>
          </div>

          const footer = <div className="tooltip-footer success">
            <p className="icon">{<FaCheckCircle size={25} />}</p>
          </div>

          const obj = ({ header: header, body: body, footer: footer });
          setMessage(obj);
          setToolTipContent(obj);
        }

        /* Error State */
        if (message.type === 'error') {
          setType('error');
          const header = <div className="tooltip-header error">
            <p className="tooltip-title">{message.name} <FaExclamationCircle /></p>
          </div>

          const body = <div className="tooltip-body error">
            <p>{message.message}</p>
          </div>

          const footer = <div className="tooltip-footer error">
            <button className="btn tooltip-btn" onClick={hideTooltip}>OK</button>
          </div>
          const obj = ({ header: header, body: body, footer: footer })
          setMessage(obj);
          setToolTipContent(obj);
        }
      }

      return () => {
        window.electron.removeListener('message');
      }
    })
  }, [ message ])

  /* Update tooltip content */
  useEffect(() => {
    if (tooltipContent !== null)
      setToolTipVisible(true);

    let timeoutID;

    const awaitFade = async () => {
      return new Promise((resolve) => {
        timeoutID = setTimeout(() => {
          resolve()
        }, 2000);
      })
    }
    if (type === 'success') {
      const fadeOut = async () => {
        await awaitFade();
        setToolTipVisible(false);
      }
      fadeOut();
    }

    return () => { setToolTipVisible(false); clearTimeout(timeoutID) };

  }, [ tooltipContent, type ])

  /* Update Global Settings */
  useEffect(() => {
    const handleSettingsListener = (event, data) => {
      console.log('Received Data:', data)
      if (data) {
        setVBlankDivider(data.GPU.vblankDivider);
        setScreenWidth(data.GPU.screenWidth);
        setScreenHeight(data.GPU.screenHeight);
        setFullscreen(data.General.Fullscreen);
        setIsPS4Pro(data.General.isPS4Pro);
        setLogType(data.General.logType);
        setShowSplash(data.General.showSplash);
      }
    }
    window.electron.send('get-settings');
    window.electron.on('get-settings', handleSettingsListener);
    return (() => { window.electron.removeListener('get-settings', handleSettingsListener) });
  }, [])

  useEffect(() => {
    setScreenWidth(screenWidth);
    setScreenHeight(screenHeight);
  }, [ screenWidth, screenHeight ])
  return (
    <>
      <TitleBar />
      <Navbar />
      <Tooltip content={tooltipContent} visible={tooltipVisible} type={type} />

      <Routes>
        <Route path='/options' key={'/options'} element={
          <Options key={'options'}></Options>
        }></Route>
        <Route path='/' key={'/install'} element={
          <Install key={'install'} />
        }></Route>
        <Route path='/create' key={'/create'} element={
          <Create key={'create'} />
        }></Route>
        <Route path='/process-active' key={'/process-active'} element={
          <ProcessActive key={'process-active'} />
        }></Route>
      </Routes>
    </>
  );
}

export default App;