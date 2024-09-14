import React, { useRef } from "react";
import { useEffect, useState } from "react";
import '../css/Install.css';
import useGlobalStateStore from "../js/globalStateStore";
import { IoIosFolderOpen } from "react-icons/io";
import GamesWrapper from "../partials/GamesWrapper";
import Modal from '../partials/Modal';
import ToggleButton from '../partials/ToggleButton';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle } from "react-icons/fa";
import { FaFaceFrown } from "react-icons/fa6";

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
	const [ setMessage ] = useGlobalStateStore(state => [ state.setMessage ]);
	const [ type, setType ] = useGlobalStateStore(state => [ state.type, state.setType ]);
	const [ tooltipVisible, setToolTipVisible ] = useGlobalStateStore(state => [ state.tooltipVisible, state.setToolTipVisible ]);

	/* Settings */
	const [ fullscreen, setFullscreen ] = useGlobalStateStore(state => [ state.fullscreen, state.setFullscreen ]);
	const [ isPS4Pro, setIsPS4Pro ] = useGlobalStateStore(state => [ state.isPS4Pro, state.setIsPS4Pro ]);
	const [ showSplash, setShowSplash ] = useGlobalStateStore(state => [ state.showSplash, state.setShowSplash ]);
	const [ vBlankDivider ] = useGlobalStateStore(state => [ state.VBlankDivider ]);
	const [ screenWidth, setScreenWidth ] = useGlobalStateStore(state => [ state.screenWidth, state.setScreenWidth ]);
	const [ screenHeight, setScreenHeight ] = useGlobalStateStore(state => [ state.screenHeight, state.setScreenHeight ]);
	const [ logType, setLogType ] = useGlobalStateStore(state => [ state.logType ]);

	const [ modsForCurrentApp, setModsForCurrentApp ] = useState(null);
	const [ enabledMods, setEnabledMods ] = useState([]);
	const [ disabledMods, setDisabledMods ] = useState([]);
	const [ installedMods, setInstalledMods ] = useState([]);

	const heightSettingRef = useRef(null);
	const widthSettingRef = useRef(null);
	const vBlankDividerRef = useRef(null);

	const initializeLibrary = () => {
		window.electron.send('open-file-dialog');
	}

	const hideTooltip = async () => {
		setToolTipVisible(false);
	}

	const bootGame = () => {
		let width = widthSettingRef.current.value;
		let height = heightSettingRef.current.value;
		window.electron.send('launch-game', ({
			bin: `${selectedApp.path}/eboot.bin`,
			fullscreen: fullscreen,
			showSplash: showSplash,
			screenWidth: width || screenWidth,
			screenHeight: height || screenHeight,
			vBlankDivider: vBlankDivider,
			logType: logType,
			isPS4Pro: isPS4Pro
		}));

		console.log(heightSettingRef.current.value, widthSettingRef.current.value);
	}

	const revealInExplorer = (app, type) => {
		console.log(app, type);
		window.electron.send('open-in-explorer', { data: app, type: type });
	}

	const handleSelectedApp = (app) => {
		setSelectedApp(app);
		setTimeout(() => {
			setModalOpen(true);
		}, 100);
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

	const refreshLibrary = () => {
		window.electron.send('fetch-games-in-library');
	}

	const toggleValue = (value, setState) => {
		value = !value;
		setState(value);
	}

	const toggleLogType = (logType, setLogType) => {
		if (logType === "async")
			setLogType("sync")
		else setLogType("async");
	}

	/* Set tooltip error messages */
	useEffect(() => {
		window.electron.on('error', (event, err) => {
			if (err) {
				const header = <div className="tooltip-header">
					<p className="tooltip-title">{err.name} <FaExclamationCircle /></p>
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
		window.electron.on('message', (event, message) => {
			if (message) {
				if (message.type === 'success') {
					setType('success')
					const header = <div className="tooltip-header-success">
						<p className="tooltip-title-success">{message.name}</p>
					</div>

					const body = <div className="tooltip-body-success">
						<p>{message.message}</p>
					</div>

					const footer = <div className="tooltip-footer-success">
						<p className="icon">{<FaCheckCircle size={25} />}</p>
					</div>

					const obj = ({ header: header, body: body, footer: footer });
					setMessage(obj);
				}
				else {
					const header = <div className="tooltip-header">
						<p className="tooltip-title">{message.name}</p>
					</div>

					const body = <div className="tooltip-body">
						<p>{message.message}</p>
					</div>

					const footer = <div className="tooltip-footer">
						<button className="btn tooltip-btn" onClick={hideTooltip}>OK</button>
					</div>
					const obj = ({ header: header, body: body, footer: footer });
					setMessage(obj);
				}
			}

			return () => {
				window.electron.removeListener('message');
			}
		})
	}, [])

	useEffect(() => {
		const handleLibraryRefresh = (event, data) => {
			setGames(data.games);
		}

		window.electron.on('refresh-library', handleLibraryRefresh);
		return () => { window.electron.removeListener('refresh-games', handleLibraryRefresh) }
	}, [])

	/* Set available mods and fetch their current states for selected app from IPC */
	useEffect(() => {
		if (selectedApp && selectedApp.id) {
			/* Send request to */
			window.electron.send(`get-mods-directory`, selectedApp.id)
			window.electron.send('mod-state', selectedApp.id);

			const modsDirectoryListener = (event, data) => {
				window.electron.removeListener(`mods-${selectedApp.id}`, modsDirectoryListener);
				if (data && data.mods) {
					setModsForCurrentApp(data.mods);
				}
			}
			const modsStateListener = (event, data) => {
				if (data) {
					console.log(data);
				}
			}
			/* Response from IPC from fetch request */
			window.electron.on(`check-mods`, modsStateListener)
			window.electron.on(`mods-${selectedApp.id}`, modsDirectoryListener)
			/* Remove listeners after they've been attached */
			return () => {
				window.electron.on(`check-mods`, modsStateListener)
				window.electron.removeListener(`mods-${selectedApp.id}`, modsDirectoryListener);
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

	useEffect(() => {
		if (selectedApp) {
			const getModStates = async () => {
				const data = await window.electron.getModStates(selectedApp);
				if (data && data.mods) {
					const enabledMods = [];
					const disabledMods = [];
					Object.values(data.mods).forEach(mod => {
						if (mod.enabled)
							enabledMods.push(mod);
						else disabledMods.push(mod);
					})

					setEnabledMods(enabledMods);
					setDisabledMods(disabledMods);
				}
			}
			getModStates();
		}
	}, [ selectedApp ]);

	/* Open Modal */
	useEffect(() => {
		const updateModData = (event, data) => {
			const setData = async () => {
				setInstalledMods(data.mods);
				setEnabledMods(data.enabled);
				setDisabledMods(data.disabled);
			}
			const update = async () => {
				await setData();
			}
			update();
		};

		window.electron.on('mod-state', updateModData);
		return () => {
			window.electron.removeListener('mod-state', updateModData)
		};
	}, [ selectedApp, enabledMods, disabledMods, installedMods, modalOpen ]);

	/* Initialize Modal Structure */
	useEffect(() => {
		if (selectedApp) {
			const modalHeader = (
				<>
					<div className="modal-header-wrapper">
						<div className="app-item">
							<code>Game Directory:</code>
							<button className="btn bold reveal-btn" onClick={() => { revealInExplorer(selectedApp, 'game') }}><IoIosFolderOpen /></button>
							<code>Mods Directory:</code>
							<button className="btn bold reveal-btn" onClick={() => { revealInExplorer(selectedApp, 'mod') }}><IoIosFolderOpen /></button>
						</div>
						<code className="modal-title">{selectedApp.title}</code>
					</div>
				</>
			)
			const modalBody = (
				<div className="modal-body-wrapper">
					<div className="app-mods-wrapper">
						{Array.isArray(modsForCurrentApp) && modsForCurrentApp.length > 0 ? (
							<>
								<p className="mods-title">Mods available</p>
								<ul className="mods-list">
									{modsForCurrentApp.map(mod => {
										const isModEnabled = enabledMods && enabledMods.find(x => x.modName === mod) ? true : false;
										return (
											<>
												<div className="mod-item-group">
													<li className="mod-item">{mod}</li>
													<ToggleButton checked={isModEnabled} onClick={() => {
														if (!isModEnabled)
															enableMod({ modName: mod, id: selectedApp.id })
														else disableMod({ modName: mod, id: selectedApp.id });
													}} />
												</div>
											</>);
									})}
								</ul>
							</>
						) : (
							<div className="mods-text-wrapper">
								<p className="mods-text">No mods are currently installed</p>
								<FaFaceFrown size={20} />
							</div>
						)}

					</div>
					<div className="divider vertical"></div>
					<div className="app-settings-wrapper">
						<p className="settings-title">Global Settings</p>
						<p className="category">Emulator</p>
						<div className="setting-item">
							<p>PS4 Pro Mode</p>
							<ToggleButton onClick={() => { toggleValue(isPS4Pro, setIsPS4Pro) }} checked={isPS4Pro} />
						</div>
						<div className="setting-item">
							<p>Fullscreen</p>
							<ToggleButton onClick={() => { toggleValue(fullscreen, setFullscreen) }} checked={fullscreen} />
						</div>
						<div className="setting-item">
							<p>Show Splash</p>
							<ToggleButton onClick={() => { toggleValue(showSplash, setShowSplash) }} checked={showSplash} />
						</div>
						<p className="category">Graphics</p>
						<div className="setting-item">
							<p>Screen Width:</p>
							<input ref={widthSettingRef} type="text" className="input setting-input" placeholder={`Current: ${screenWidth}`} onChange={e => {setScreenWidth(e.target.value)}} />
						</div>
						<div className="setting-item">
							<p>Screen Height:</p>
							<input ref={heightSettingRef} type="text" className="input setting-input" placeholder={`Current: ${screenHeight}`} onChange={e => setScreenHeight(e.target.value)} />
						</div>
						<div className="setting-item">
							<p>Vblank Divider</p>
							<input ref={vBlankDividerRef} type="number" placeholder="1" className="input setting-input" min={0} max={10} defaultValue={vBlankDivider} />
						</div>
						<p className="category">Logger</p>
						<div className="setting-item">
							<p>Enable Async</p>
							<ToggleButton onClick={() => { toggleLogType(logType, setLogType) }} checked={logType === "async" ? true : false} />
						</div>
					</div>
					<div className="divider vertical"></div>
					<div className="app-details-wrapper">
						<div className="app-poster-wrapper">
							<img src={selectedApp.icon} alt="game-icon" className="app-poster" />
						</div>

						<div className="game-details-wrapper">
							<button className="btn bold play-btn" onClick={() => { bootGame() }}>Launch {selectedApp.title}</button>

							<div className="game-detail">
								<p className="game-title">{selectedApp.title}</p>
							</div>
							<div className="game-detail">
								<p>ID:</p>
								<p>{selectedApp.id}</p>
							</div>
							{Array.isArray(modsForCurrentApp) ?
								(<div className="game-detail">
									<p>Total mods:</p>
									<p>{modsForCurrentApp.length}</p>
								</div>) :
								(<div className="game-detail">
									<p>No mods installed</p>
								</div>)}
							{enabledMods && Array.isArray(modsForCurrentApp) ? (
								<div className="game-detail">
									<p>Enabled Mods:</p>
									<p>{enabledMods.length}</p>
								</div>) : null}
							{disabledMods && Array.isArray(modsForCurrentApp) ? (
								<div className="game-detail">
									<p>Disabled Mods:</p>
									<p>{disabledMods.length}</p>
								</div>) : null}
						</div>
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
	}, [ selectedApp, modsForCurrentApp, enabledMods, disabledMods, fullscreen, showSplash, logType, isPS4Pro, vBlankDivider ])



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
				:
				<>
					<button className="btn refresh" onClick={refreshLibrary}>Refresh Library</button>
					<GamesWrapper content={games} select={handleSelectedApp} />
				</>
			}
		</>
	)
}

export default Install;