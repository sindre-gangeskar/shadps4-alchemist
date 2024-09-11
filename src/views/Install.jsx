import React from "react";
import { useEffect, useState } from "react";
import '../css/Install.css';
import useGlobalStateStore from "../js/globalStateStore";
import { IoIosFolderOpen } from "react-icons/io";
import GamesWrapper from "../partials/GamesWrapper";
import Modal from '../partials/Modal';
import ToggleButton from '../partials/ToggleButton';
function Install() {
    const [ setLibraryDirectory ] = useGlobalStateStore(state => [ state.setLibraryDirectory ]);
    const [ setShadPS4Location ] = useGlobalStateStore(state => [ state.setShadPS4Location ]);
    const [ setModsDirectory ] = useGlobalStateStore(state => [ state.setModsDirectory ]);

    const [ games, setGames ] = useState([]);
    const [ updated, setUpdated ] = useState(false);
    const [ modalContent, setModalContent ] = useState(null);
    const [ modalOpen, setModalOpen ] = useState(false);
    const [ selectedApp, setSelectedApp ] = useState(false);
    const [ setError ] = useGlobalStateStore(state => [ state.setError ]);
    const [ setToolTipVisible ] = useGlobalStateStore(state => [ state.setToolTipVisible ]);

    const [ modsForCurrentApp, setModsForCurrentApp ] = useState(null);
    const [ enabledMods, setEnabledMods ] = useState([]);
    const [ disabledMods, setDisabledMods ] = useState([]);
    const [ installedMods, setInstalledMods ] = useState([]);

    const initializeLibrary = () => {
        window.electron.send('open-file-dialog');
    }

    const hideTooltip = async () => {
        setToolTipVisible(false);
    }

    const bootGame = () => {
        window.electron.send('launch-game', `${selectedApp.path}/eboot.bin`);
    }

    const revealInExplorer = (path) => {
        window.electron.send('open-in-explorer', path);
    }

    const handleSelectedApp = (app) => {
        setSelectedApp(app);
        setModalOpen(true);
    }

    const closeModal = () => {
        setModalOpen(false);
    }

    const enableMod = (data) => {
        window.electron.send('enable-mod', ({ modName: data.modName, id: data.id }))
    }

    const disableMod = (data) => {
        window.electron.send('disable-mod', ({ modName: data.modName, id: data.id }));
    }

    const requestModsForApp = (app) => {
        if (app) {
            window.electron.send('check-mods', app.id);
        }
    }

    /* Error Handling */
    useEffect(() => {
        window.electron.on('error', (event, err) => {
            if (err) {
                const header = <div className="tooltip-header">
                    <p className="tooltip-title">{err.name}</p>
                </div>

                const body = <div className="tooltip-body">
                    <p>{err.message}</p>
                </div>

                const footer = <div className="tooltip-footer">
                    <button className="btn tooltip-btn" onClick={hideTooltip}>OK</button>
                </div>
                const obj = ({ header: header, body: body, footer: footer })
                setError(obj);
            }

            return () => {
                window.electron.removeAllListeners('error');
            }
        })
    }, [])

    /* Set available mods for selected app */
    useEffect(() => {
        if (selectedApp && selectedApp.id) {
            window.electron.send(`get-mods-directory`, selectedApp.id)

            const modsListener = (event, data) => {
                window.electron.removeListener(`mods-${selectedApp.id}`, modsListener);
                if (data && data.mods)
                    setModsForCurrentApp(data.mods);
            }

            window.electron.on(`mods-${selectedApp.id}`, modsListener)
            return () => {
                window.electron.removeListener(`mods-${selectedApp.id}`, modsListener);
            }
        }

    }, [ selectedApp ])

    /* Library */
    useEffect(() => {
        const getJsonData = async () => {
            const data = await window.electron.getJsonData();
            if (data && data.games) {
                setGames(data.games);
                setLibraryDirectory(data.games_path);
                setShadPS4Location(data.shadPS4Exe);
                setModsDirectory(data.mods_path);
                setUpdated(true);
            }
        };
        if (!updated) {
            getJsonData();
        }
    }, [ updated ]);

    /* Open Modal */
    useEffect(() => {
        const handleMods = (event, data) => {
            setInstalledMods(data.mods);
            setEnabledMods(data.enabled);
            setDisabledMods(data.disabled);
        }
        window.electron.on('mod-data', handleMods);
        return () => { window.electron.removeListener('mod-data', handleMods); };
    }, [ enabledMods ])

    /* Modal */
    useEffect(() => {
        if (selectedApp) {
            const modalHeader = (
                <>
                    <div className="modal-header-wrapper">
                        <div className="app-item">
                            <code>{selectedApp.path}</code>
                            <button className="btn bold reveal-btn" onClick={() => { revealInExplorer(selectedApp.path) }}><IoIosFolderOpen /></button>
                        </div>
                        <code className="modal-title">{selectedApp.title}</code>
                    </div>
                </>
            )

            const modalBody = (
                <div className="modal-body-wrapper">
                    <div className="app-mods-wrapper">
                        <button className="btn bold play-btn" onClick={() => { bootGame() }}>Launch {selectedApp.title}</button>
                        <ul className="mods-list">
                            {Array.isArray(modsForCurrentApp) && modsForCurrentApp.length > 0 ? modsForCurrentApp.map(mod => {
                                const isModEnabled = enabledMods && enabledMods.find(x => x.modName === mod) ? true : false;
                                return (
                                    <div className="mod-item-group">
                                        <li className="mod-item">{mod}</li>
                                        <ToggleButton checked={isModEnabled} onClick={() => {
                                            if (!isModEnabled)
                                                enableMod({ modName: mod, id: selectedApp.id })
                                            else disableMod({ modName: mod, id: selectedApp.id });
                                        }} />
                                    </div>
                                )
                            }) : null}
                        </ul>
                    </div>
                </div>
            )

            const modalFooter = (
                <div className="modal-footer-wrapper">
                    <button className="btn modal-close" onClick={closeModal}>OK</button>
                </div>
            )

            const modalBackdrop = (
                <div className="modal-backdrop" onClick={closeModal}></div>
            )

            setModalContent({
                header: modalHeader,
                body: modalBody,
                footer: modalFooter,
                backdrop: modalBackdrop
            })

            requestModsForApp(selectedApp);
        }
    }, [ selectedApp, modsForCurrentApp, enabledMods, disabledMods, installedMods, modalOpen ])

    /* Refresh Games */
    useEffect(() => {
        const handleGamesUpdated = (event, data) => {
            setGames(data.games);
            setUpdated(true);
        };

        window.electron.on('games-updated', handleGamesUpdated);
        return () => { window.electron.removeListener('games-updated', handleGamesUpdated); };
    }, []);

    return (
        <>
            <Modal content={modalContent} show={modalOpen} />
            {!games || games?.length === 0 ?
                <div className="dialog-wrapper">
                    <p className="message">No games library found</p>
                    <button className="btn initialize" onClick={initializeLibrary}>Select Games Directory</button>
                </div>
                : <GamesWrapper content={games} select={handleSelectedApp} />
            }
        </>
    )
}

export default Install;