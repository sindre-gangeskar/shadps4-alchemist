import { useRef, useEffect, useState } from 'react';
import '../css/UpdateTooltip.css';

function UpdateTooltip({ content, visible, progress, onClick, isDownloading }) {
  const progressBarRef = useRef(null);

  useEffect(() => {
    if (progress && progressBarRef && progressBarRef.current) {
      progressBarRef.current.style.width = `${progress}%`;
    }
  }, [ progress ])

  return (
    <>
      <div className={`tooltip-wrapper ${visible ? 'show' : 'hide'}`}>
        {!isDownloading ?
          <div className={`update-tooltip-wrapper`} onClick={onClick}>
            {content}
          </div>
          :
          <div className="update-tooltip-progress-wrapper">
            <p>Progress:</p>
            <div className="update-tooltip-progress-track">
              <div className="update-tooltip-progress-content" ref={progressBarRef}></div>
            </div>
          </div>
        }
      </div>
    </>
  )
}

export default UpdateTooltip;