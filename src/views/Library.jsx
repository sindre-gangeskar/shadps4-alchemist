import React, { useRef, createContext } from "react";
import { useEffect, useState } from "react";
import '../css/Install.css';
import useGlobalStateStore from "../js/globalStateStore";
import { IoIosFolderOpen } from "react-icons/io";
import GamesWrapper from "../partials/GamesWrapper";
import ToggleButton from '../partials/ToggleButton';
import { FaFaceFrown } from "react-icons/fa6";
import { BiLoaderCircle } from "react-icons/bi";

export const SearchContext = createContext();

function Install() {
	const [ setLibraryDirectory ] = useGlobalStateStore(state => [ state.setLibraryDirectory ]);
	const [ setShadPS4Location ] = useGlobalStateStore(state => [ state.setShadPS4Location ]);
	const [ setModsDirectory ] = useGlobalStateStore(state => [ state.setModsDirectory ]);

	const [ games, setGames ] = useState([]);
	const [ filteredGames, setFilteredGames ] = useState(null);
	const [ searchTerm, setSearchTerm ] = useState('');
	const [ updated, setUpdated ] = useState(false);
	const [ modalContent, setModalContent ] = useState(null);
	const [ modalOpen, setModalOpen ] = useState(false);
	const [ selectedApp, setSelectedApp ] = useState(false);
	const [ togglingMod, setTogglingMod ] = useState(null);

	/* Settings */
	const [ fullscreen, setFullscreen ] = useGlobalStateStore(state => [ state.fullscreen, state.setFullscreen ]);
	const [ isPS4Pro, setIsPS4Pro ] = useGlobalStateStore(state => [ state.isPS4Pro, state.setIsPS4Pro ]);
	const [ showSplash, setShowSplash ] = useGlobalStateStore(state => [ state.showSplash, state.setShowSplash ]);
	const [ vBlankDivider, setvBlankDivider ] = useGlobalStateStore(state => [ state.vBlankDivider, state.setvBlankDivider ]);
	const [ screenWidth, setScreenWidth ] = useGlobalStateStore(state => [ state.screenWidth, state.setScreenWidth ]);
	const [ screenHeight, setScreenHeight ] = useGlobalStateStore(state => [ state.screenHeight, state.setScreenHeight ]);
	const [ logType, setLogType ] = useGlobalStateStore(state => [ state.logType, state.setLogType ]);

	const [ modsForCurrentApp, setModsForCurrentApp ] = useState(null);
	const [ modalTabView, setModalTabView ] = useState('game');
	const [ enabledMods, setEnabledMods ] = useState([]);
	const [ disabledMods, setDisabledMods ] = useState([]);
	const [ installedMods, setInstalledMods ] = useState([]);

	const heightSettingRef = useRef(null);
	const widthSettingRef = useRef(null);
	const vBlankDividerRef = useRef(null);
	const searchInputRef = useRef(null);


	const initializeLibrary = () => {
		window.electron.send('open-file-dialog');
	}
	const bootGame = () => {
		let width = widthSettingRef.current.value;
		let height = heightSettingRef.current.value;
		let vBlankDividerValue = vBlankDividerRef.current.value;
		window.electron.send('launch-game', ({
			bin: `${selectedApp.path}/eboot.bin`,
			fullscreen: fullscreen,
			showSplash: showSplash,
			screenWidth: width || screenWidth,
			screenHeight: height || screenHeight,
			vBlankDivider: vBlankDividerValue || vBlankDivider,
			logType: logType,
			isPS4Pro: isPS4Pro
		}));

		console.log(heightSettingRef.current.value, widthSettingRef.current.value);
	}
	const revealInExplorer = (app, type) => {
		console.log(app, type);
		window.electron.send('open-in-explorer', { data: app, type: type });
	}
	const revealLogsInExplorer = (app) => {
		window.electron.send('open-logs', { id: app.id });
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
	const setViewTab = (tab) => {
		if (tab === 'game')
			setModalTabView('game');
		else setModalTabView('mods');
	}
	const enableMod = async (data) => {
		await window.electron.send('enable-mod', ({ modName: data.modName, id: data.id }))
	}
	const disableMod = async (data) => {
		await window.electron.send('disable-mod', ({ modName: data.modName, id: data.id }));
	}
	const toggleValue = (value, setState) => {
		value = !value;
		setState(value);
	}
	const toggleLogType = () => {
		if (logType === "async")
			setLogType("sync")
		else setLogType("async");
	}

	/* Refresh / set games in library */
	useEffect(() => {
		const handleLibraryRefresh = (event, data) => {
			if (data && data.games) {
				data.games = sortAlphabetically(data.games);
				setGames(data.games);
				setFilteredGames(data.games);
			}
		}

		window.electron.send('fetch-games-in-library');
		window.electron.on('fetch-games-in-library', handleLibraryRefresh);
		return () => { window.electron.removeAllListeners('fetch-games-in-library') }
	}, [])
	/* Set available mods and fetch their current states for selected app from IPC */
	useEffect(() => {
		if (selectedApp && selectedApp.id) {
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
			window.electron.send('get-mods-in-directory', selectedApp)
			const getModStates = (event, data) => {
				console.log(data);
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
					setInstalledMods(data.mods.length);
				}
			}
			window.electron.on('get-mods-in-directory', getModStates)
			return () => { window.electron.removeAllListeners('get-mods-in-directory', getModStates) }
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
	useEffect(() => {
		const handleModStatusChange = (event, data) => {
			if (data) {
				setTogglingMod(data.mod);
			}
		}
		const handleModStatusChangeCompletion = (event, data) => {
			if (data && data.status) {
				if (data.status === 'completed')
					setTogglingMod(null);
			}
		}
		window.electron.on('mod-process-complete', handleModStatusChangeCompletion);
		window.electron.on('processing-mod', handleModStatusChange);
		return (() => { window.electron.removeAllListeners('processing-mod', handleModStatusChange); window.electron.removeAllListeners('mod-process-complete', handleModStatusChangeCompletion) });
	}, [])
	/* Initialize Modal Structure */
	useEffect(() => {
		if (selectedApp) {
			const modalHeader = (
				<div className="modal-header-wrapper settings-title">
					<span className="tabs-wrapper">
						<button className={`btn tab ${modalTabView == 'game' ? 'active' : 'inactive'}`} onClick={() => { setViewTab('game') }}>Game</button>
						<button className={`btn tab ${modalTabView == 'mods' ? 'active' : 'inactive'}`} onClick={() => { setViewTab('mods') }}>Mods</button>
					</span>
					<span className="tabs-wrapper">
						<button className="btn tab reveal-btn" onClick={() => { revealLogsInExplorer(selectedApp) }}>Logs Directory</button>
						<button className="btn tab reveal-btn" onClick={() => { revealInExplorer(selectedApp, 'game') }}>Game Directory</button>
						<button className="btn tab reveal-btn" onClick={() => { revealInExplorer(selectedApp, 'mod') }}>Mods Directory</button>
					</span>
				</div>
			)
			const modsView = (
				<div className="modal-body-wrapper">
					<div className="app-mods-wrapper">
						{Array.isArray(modsForCurrentApp) && modsForCurrentApp.length > 0 ? (
							<>
								<p className="mods-title">Mods available</p>
								<ul className="mods-list">
									{modsForCurrentApp.map(mod => {
										const isModEnabled = enabledMods && enabledMods.find(x => x.modName === mod) ? true : false;

										return (
											<div className="mod-item-group" key={mod}>
												<li className="mod-item" key={mod}>{mod}</li>
												<ToggleButton clickable={togglingMod === null ? true : false} checked={isModEnabled} onClick={() => {
													if (!isModEnabled) {
														enableMod({ modName: mod, id: selectedApp.id })
													}
													else {
														disableMod({ modName: mod, id: selectedApp.id })
													}
												}} />
												<BiLoaderCircle className={`loader ${togglingMod === mod ? 'show spinner' : 'hide'}`} size={25} />
											</div>
										);
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
				</div>
			)
			const gameView = (
				<div className="modal-body-wrapper games">
					<div className="app-details-wrapper">
						<div className="app-poster-wrapper">
							<div className="app-poster-overlay"></div>
							<img src={selectedApp.icon} alt="game-icon" className="app-poster" />
						</div>
						<div className="game-details-wrapper">
							<button className="btn bold play-btn" onClick={() => { bootGame() }}>Launch {selectedApp.title}</button>
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
					<div className="app-settings-wrapper">
						<div className="settings-title"><p>Global Settings</p></div>
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
							<input ref={widthSettingRef} type="text" className="input setting-input" placeholder={`Current: ${screenWidth}`} onChange={e => { setScreenWidth(e.target.value) }} />
						</div>
						<div className="setting-item">
							<p>Screen Height:</p>
							<input ref={heightSettingRef} type="text" className="input setting-input" placeholder={`Current: ${screenHeight}`} onChange={e => setScreenHeight(e.target.value)} />
						</div>
						<div className="setting-item">
							<p>Vblank Divider</p>
							<input ref={vBlankDividerRef} type="number" placeholder={`Current: ${vBlankDivider}`} className="input setting-input" min={0} max={10} onChange={(e) => { setvBlankDivider(e.target.value) }} />
						</div>
						<p className="category">Logger</p>
						<div className="setting-item">
							<p>Enable Async</p>
							<ToggleButton onClick={toggleLogType} checked={logType === "async" ? true : false} />
						</div>
					</div>
					
				</div>
			)
			setModalContent({
				header: modalHeader,
				body: modalTabView === 'game' ? gameView : modsView,
			})
		}
	}, [ selectedApp, modsForCurrentApp, enabledMods, disabledMods, fullscreen, showSplash, logType, isPS4Pro, vBlankDivider, modalTabView, togglingMod ])

	useEffect(() => {
		if (searchTerm) {
			setFilteredGames(games.filter(x => x.title.toLowerCase().replace('\u2122', '').includes(searchTerm.toLowerCase())));
		}

		if (searchTerm.length === 0) {
			setFilteredGames(games);
		}
	}, [ searchTerm ])

	return (
		<>
			{!games || games?.length === 0 ?
				<div className="dialog-wrapper">
					<p className="message">No games library found</p>
					<button className="btn initialize" onClick={initializeLibrary}>Setup</button>
				</div>
				:
				<SearchContext.Provider value={{ setSearchTerm, searchInputRef, modalContent, modalOpen }}>
					<GamesWrapper content={filteredGames} select={handleSelectedApp} />
				</SearchContext.Provider>
			}
		</>
	)
}
function sortAlphabetically(games) {
	const sorted = games.sort((a, b) => {
		if (a.title > b.title) return 1;
		else if (b.title > a.title) return -1;
		else return 0;
	})
	return sorted;
}

export default Install;