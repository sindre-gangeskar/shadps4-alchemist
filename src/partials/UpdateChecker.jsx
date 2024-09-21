import React from "react";
import { useState, useEffect } from "react";
import UpdateTooltip from "./UpdateTooltip";
import { GoDownload } from "react-icons/go";
function UpdateChecker() {
  const [ message, setMessage ] = useState(null);
  const [ content, setContent ] = useState(null);
  const [ progress, setProgress ] = useState(0);
  const [ isDownloading, setIsDownloading ] = useState(false);
  useEffect(() => {
    const handleUpdateCheck = (event, data) => {
      if (data && data.updateAvailable && data.type !== 'error') {
        setMessage(data.message);
      }
      if (data.type === 'error')
        console.error(data.message);
    }
    window.electron.send('check-updates');
    window.electron.on('check-updates', handleUpdateCheck);
    return () => {
      window.electron.removeListener('check-updates', handleUpdateCheck);
    }
  }, [])

  /* Set tooltip content when a message has been changed or set */
  useEffect(() => {
    setContent(
      <div className="tooltip-data">{message}<GoDownload className="download-icon" size={20} /></div>
    )
  }, [ message ])


  const initializeDownload = () => {
    window.electron.send('initiate-download');
    console.log('Initiated update download');
  }

  useEffect(() => {
    const handleDownload = (event, data) => {
      if (data && data.message) {
        setMessage(data.message);
      }

      if (data && data.progress) {
        setProgress(data.progress);
        setIsDownloading(true);
      }
      console.log(data);
    }
    window.electron.on('initiate-download', handleDownload);
    return () => { window.electron.removeListener('initiate-download', handleDownload) };
  }, [])

  return (
    <UpdateTooltip content={content} visible={!!message} progress={progress} isDownloading={isDownloading} onClick={initializeDownload} />
  )
}

export default UpdateChecker;