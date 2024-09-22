import React, { useState, useEffect } from "react";
import { LuFolderEdit } from "react-icons/lu";
import '../css/Settings.css';
function Settings() {
    const [ shadPS4Location, setShadPS4Location ] = useState(null)
    const [ libraryDirectory, setLibraryDirectory ] = useState(null);
    const [ modsDirectory, setModsDirectory ] = useState(null);

    const setGames = () => {
        window.electron.send('set-games');
    }

    const setShadPS4 = () => {
        window.electron.send('set-shadps4');
    }

    const setMods = () => {
        window.electron.send('set-mods');
    }

    const reinitialize = () => {
        window.electron.send('open-file-dialog');
    }

    const fetchSettings = async () => {
        const data = await window.electron.getJsonData();
        if (data) {
            setLibraryDirectory(data.games_path);
            setModsDirectory(data.mods_path);
            setShadPS4Location(data.shadPS4Exe)
        }
    }

    useEffect(() => {
        const awaitSettings = async () => {
            await fetchSettings();
        }
        awaitSettings();
    }, [])

    useEffect(() => {
        const setPaths = async (event, data) => {
            if (data && data.gamesPath && data.shadPS4Path && data.modsPath) {
                setLibraryDirectory(data.gamesPath);
                setShadPS4Location(data.shadPS4Path)
                setModsDirectory(data.modsPath);
            }

            window.electron.on('get-paths', setPaths);
            return () => { window.electron.removeListener('get-paths', setPaths) }
        }
        setPaths();
    }, [])

    return (
        <>
            <div className="settings-wrapper">
                <div className="setting">
                    <p className="bold name">shadPS4 Location</p>
                    <p className="path">{shadPS4Location ? shadPS4Location : 'No shadPS4.exe location specified'}
                        <button className="btn setting-btn" onClick={setShadPS4}><LuFolderEdit size={20} /></button>
                    </p>
                </div>
                <div className="setting">
                    <p className="bold name">Games Location</p>
                    <p className="path">{libraryDirectory ? libraryDirectory : 'No library directory specified'}
                        <button className="btn setting-btn" onClick={setGames}><LuFolderEdit size={20} /></button>
                    </p>
                </div>
                <div className="setting">
                    <p className="bold name">Mods Location</p>
                    <p className="path">{modsDirectory ? modsDirectory : 'No mods directory specified'}
                        <button className="btn setting-btn" onClick={setMods}><LuFolderEdit className="setting-btn-icon" size={20} /></button>
                    </p>
                </div>
                <button className="btn reset" onClick={reinitialize}>Reset Configuration</button>
            </div>
        </>
    )
}

export default Settings;