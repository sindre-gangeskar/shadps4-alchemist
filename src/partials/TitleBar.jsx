import React from "react";
import '../css/TitleBar.css'
import VersionVisuals from "./VersionVisuals";
import { useState } from 'react';
import { VscChromeClose, VscChromeMaximize, VscChromeMinimize, VscChromeRestore } from "react-icons/vsc";
function TitleBar() {
    const [ maximized, setMaximized ] = useState(false);

    const maximizeWindow = () => {
        window.electron.maximizeWindow();
        setMaximized(!maximized)
    }
    const closeWindow = () => {
        window.close();
    }
    const minimizeWindow = () => {
        window.electron.minimizeWindow();
    }


    return (
        <>
            <div className="title-bar-wrapper">
                <div className="title-logo-wrapper">
                    <img className="title-logo-icon" src="./assets/images/shadps4-alchemist-icon.png" alt="logo" />
                    <div className="title-name">shadPS4 Alchemist</div>
                    <VersionVisuals />
                </div>
                <div className="title-bar-controls">
                    <button className="btn minimize" onClick={minimizeWindow}><VscChromeMinimize /></button>
                    <button className="btn maximize" onClick={maximizeWindow}>{maximized ? <VscChromeRestore /> : <VscChromeMaximize />}</button>
                    <button className="btn close" onClick={closeWindow}><VscChromeClose /></button>
                </div>
            </div>
        </>
    )
}

export default TitleBar;