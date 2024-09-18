import React from "react";
import { useState, useEffect } from "react";
import UpdateTooltip from "./UpdateTooltip";
import { GoDownload } from "react-icons/go";
function UpdateChecker() {
  const [ message, setMessage ] = useState(null);
  const [ content, setContent ] = useState(null);

  useEffect(() => {
    const handleUpdateCheck = (event, data) => {
      if (data && data.updateAvailable) {
        setMessage(data.message);
      }
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


  const handleDownload = () => {
    window.electron.send('initiate download');
  }

  return (
    <UpdateTooltip content={content} visible={!!content} onClick={handleDownload} />
  )
}

export default UpdateChecker;