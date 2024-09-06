import React from "react";
import { useEffect, useState } from "react";
import '../css/Install.css';

import { IoIosFolderOpen, IoMdPlay } from "react-icons/io";
import GamesWrapper from "../partials/GamesWrapper";
import Modal from '../partials/Modal';

function Install() {
    const [ games, setGames ] = useState([]);
    const [ updated, setUpdated ] = useState(false);
    const [ modalContent, setModalContent ] = useState(null);
    const [ modalOpen, setModalOpen ] = useState(false);
    const [ selectedApp, setSelectedApp ] = useState(false);

    const initializeLibrary = () => {
        window.electron.send('open-file-dialog');
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

    /* Library */
    useEffect(() => {
        const getJsonData = async () => {
            const data = await window.electron.getJsonData();
            if (data && data.games) {
                setGames(data.games);
                setUpdated(true);
            }
        };
        if (!updated) {
            getJsonData();
        }
    }, [ updated ]);

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
                        <button className="btn bold play-btn" onClick={() => { bootGame() }}>Play<IoMdPlay className="play-icon" /></button>
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
        }
    }, [ selectedApp ])

    /* Refresh Games */
    useEffect(() => {
        const handleGamesUpdated = (event, data) => {
            setGames(data.games);
            setUpdated(true);
        };

        window.electron.on('games-updated', handleGamesUpdated);
        return () => { window.electron.removeEventListener('games-updated', handleGamesUpdated); };
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