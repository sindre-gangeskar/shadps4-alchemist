import React from "react";
import '../css/TitleBar.css'
import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { VscChromeClose, VscChromeMaximize, VscChromeMinimize, VscChromeRestore } from "react-icons/vsc";
function TitleBar() {
    const [ maximized, setMaximized ] = useState(false);
    const [ titleName, setTitleName ] = useState(null);
    const location = useLocation();
    useEffect(() => {
        if (location.pathname === '/')
            setTitleName('Library');
        if (location.pathname === '/create')
            setTitleName('Create A Mod');
        if (location.pathname === '/options')
            setTitleName('Options');

    }, [ location ])

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
            <div className="title-location" key={location}>{titleName}</div>
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