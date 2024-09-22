import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import isDev from 'electron-is-dev';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import toml from '@iarna/toml';
import updatesChecker from './updatesChecker.js';
import pkg from "electron-updater";
import { Candy } from 'candy-log';

const c = new Candy();
const { autoUpdater } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.join(app.getPath('appData'), 'shadPS4 Alchemist');
var games = [];


if (!fs.existsSync(dataFilePath))
    fs.mkdirSync(dataFilePath), {
        recursive: true
    }

/* Main Electron */
app.whenReady().then(async () => {
    createWindow();
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
})
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
        createWindow();
})

/* Initialization */
ipcMain.on('open-file-dialog', async (event) => {
    let shadPS4ExeFile;
    const exists = fs.existsSync(dataFilePath);
    if (!exists) {
        fs.mkdirSync(dataFilePath, { recursive: true });
    }

    /* Set games location */
    const setGamesLibrary = await dialog.showOpenDialog({
        title: 'Set the location of where you store your games for ShadPS4',
        properties: [ 'openDirectory' ],
    });
    /* if setGames is not canceled */
    if (!setGamesLibrary.canceled) {
        /* Set mods location */
        const setModsDirectory = await dialog.showOpenDialog({
            properties: [ 'openDirectory' ],
            title: 'Set the location of where you want to store your mods',
        })

        /* If mods directory is not canceled */
        if (!setModsDirectory.canceled) {
            /* Set shadps4.exe file location */
            const exeResult = await dialog.showOpenDialog({
                properties: [ 'openFile' ],
                title: 'Locate shadps4.exe (Can be on a different drive)',
                defaultPath: 'shadPS4.exe',
                filters: [ { name: 'shadPS4.exe', extensions: [ 'exe' ] } ],
            })

            shadPS4ExeFile = exeResult.filePaths[ 0 ];
            if (!exeResult.canceled) {
                if (path.basename(exeResult.filePaths[ 0 ]) !== 'shadPS4.exe') {
                    console.error('Executable selected is not shadPS4.exe');
                    return;
                }
            }
            else return;
        }

        const config = {
            games_path: setGamesLibrary.filePaths[ 0 ],
            mods_path: setModsDirectory.filePaths[ 0 ],
            shadPS4Exe: shadPS4ExeFile,
            games: games
        }


        getGamesInDirectory(config.games_path);

        // Save and send data to rendering client
        const paths = [ config.games_path, config.mods_path ];
        if (checkSameDrive(event, paths)) {
            await fs.promises.writeFile(path.join(dataFilePath, 'config.json'), JSON.stringify('', null, 2))
            await saveConfig(config, path.resolve(`${dataFilePath}/config.json`));
            event.sender.send('fetch-games-in-library', { games: games, shadPS4Exe: config.selectedFile });
        }

        else {
            const error = {
                message: 'Ensure the Games and Mods directories are on the same drive',
                name: 'InvalidDrivesError',
                code: 400
            };
            console.error(error.message);
            sendMessage(event, error.message, error.name, 400, 'error');
        }
    }
})
ipcMain.on('open-in-explorer', async (event, data) => {
    try {
        const pathExists = (path) => {
            const exists = fs.existsSync(path);
            return exists;
        }
        const initialData = parseInitialModData(event, data.data)
        if (initialData) {
            /* Open game directory */
            if (data.type === 'game' && pathExists(initialData.gameDir))
                shell.openPath(initialData.gameDir);

            /* Open mod directory */
            if (data.type === 'mod') {
                if (pathExists(initialData.modsDir))
                    shell.openPath(initialData.modsDir)
                else {
                    fs.mkdirSync(initialData.modsDir, { recursive: true });
                    shell.openPath(initialData.modsDir);
                }
            }
            else return;
        }
    } catch (error) {
        sendMessage(event, 'Failed to open directory in file explorer', 'FileExplorerErr', 500, 'error');
        console.error(error);
    }
})
ipcMain.on('set-shadps4', async (event) => {
    let config;
    if (checkFileExists(dataFilePath, 'config.json')) {
        config = await parseJSON(dataFilePath, 'config.json');
        const result = await dialog.showOpenDialog({
            properties: [ 'openFile' ],
            title: 'Locate shadPS4 executable',
            defaultPath: 'shadPS4.exe',
            filters: [ { name: 'shadPS4.exe', extensions: [ 'exe' ] } ]
        })
        if (!result.canceled) {
            config.shadPS4Exe = result.filePaths[ 0 ];
            saveConfig(config, path.join(dataFilePath, 'config.json'));
            event.sender.send('get-paths', { modsPath: config.mods_path, shadPS4Path: config.shadPS4Exe, gamesPath: config.games_path });
            sendMessage(event, 'Successfully saved location for shadps4.exe', 'Saved', 200, 'success');
        }
    }
})
ipcMain.on('set-games', async (event) => {
    if (checkFileExists(dataFilePath, 'config.json')) {
        let config = await parseJSON(dataFilePath, 'config.json');
        const result = await dialog.showOpenDialog({
            title: 'Set games directory',
            properties: [ 'openDirectory' ]
        })

        if (!result.canceled) {
            config.games_path = result.filePaths[ 0 ];
            config.games = getGamesInDirectory(config.games_path);
            if (checkSameDrive(event, [ config.games_path, config.mods_path ])) {
                sendMessage(event, 'Successfully saved new location for games', 'Saved', 200, 'success');
                saveConfig(config, path.join(dataFilePath, 'config.json'));
                event.sender.send('get-paths', { modsPath: config.mods_path, shadPS4Path: config.shadPS4Exe, gamesPath: config.games_path });
            }
            else sendMessage(event, 'Cannot save games directory to a different drive from mods directory', 'SaveErr', 400, 'error');
        }
    }
})
ipcMain.on('set-mods', async (event) => {
    let config;
    if (checkFileExists(dataFilePath, 'config.json')) {
        config = await parseJSON(dataFilePath, 'config.json');
        const result = await dialog.showOpenDialog({
            title: 'Set new location for mods directory',
            properties: [ 'openDirectory' ],
        })

        if (!result.canceled) {
            config.mods_path = result.filePaths[ 0 ];
            if (checkSameDrive(event, [ config.games_path, config.mods_path ])) {
                await saveConfig(config, path.join(dataFilePath, 'config.json'));
                sendMessage(event, 'Successfully saved new location for mods directory', 'Saved', 200, 'success')
                event.sender.send('get-paths', { modsPath: config.mods_path, shadPS4Path: config.shadPS4Exe, gamesPath: config.games_path });
            }
            else sendMessage(event, 'Cannot save the mods directory to a different drive from games directory', 'SaveErr', 400, 'error')
        }
    }
})

/* Updates */
ipcMain.on('check-updates', async (event) => {
    try {
        await updatesChecker.checkForUpdates(event);
    } catch (error) {
        sendMessage(event, error.message, 'UpdateErr', 500, 'error');
        console.error(error);
    }
})
ipcMain.on('initiate-download', async (event) => {
    try {
        autoUpdater.removeAllListeners('download-progress');
        autoUpdater.removeAllListeners('update-downloaded');

        event.sender.send('initiate-download', { message: 'Initializing...' });

        autoUpdater.on('download-progress', (progress) => {
            event.sender.send('initiate-download', { type: 'progress', message: `Downloading ${progress.percent.toFixed(1)}%`, progress: progress.percent });
        });

        autoUpdater.once('update-downloaded', () => {
            autoUpdater.quitAndInstall(false)
        });

        await autoUpdater.downloadUpdate();
    } catch (error) {
        console.error('Error during download:', error);
        event.sender.send('initiate-download', { message: 'Error during update download', error: error.message });
    }
});

/* Mods */
ipcMain.on(`get-mods-directory`, async (event, id) => {
    const configFile = JSON.parse(fs.readFileSync(`${dataFilePath}/config.json`));
    const modsPath = configFile.mods_path;
    const idExists = fs.existsSync(`${modsPath}/${id}`);

    if (idExists) {
        const directory = fs.readdirSync(`${modsPath}/${id}`, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
        event.sender.send(`mods-${id}`, { mods: directory.length > 0 ? directory : `No mods installed for ${id}` });
    }
    else {
        event.sender.send(`mods-${id}`, { mods: `No directory in mods library exist for: ${id}` });
    }
})
ipcMain.on('enable-mod', async (event, data) => {
    try {
        const initialData = parseInitialModData(event, data);
        /* Initialize mod object */
        const mod = { modName: data.modName, enabled: true };
        const absoluteModsPath = `${initialData.modsDir}/${mod.modName}`;

        /* Get files from mod, and enable them */
        const filesInMod = getFilesInMod(absoluteModsPath, mod.modName);
        const success = await enableModForGame(initialData.gameDir, filesInMod, mod.modName, data.id, event)

        if (success) {
            /* Parse mods config file for said game */
            const fileData = JSON.parse(fs.readFileSync(initialData.modConfigPath, 'utf-8'));

            if (!fileData.mods[ data.modName ])
                fileData.mods[ data.modName ] = mod;
            else fileData.mods[ data.modName ].enabled = true;

            const mods = getAllMods(fileData);
            await saveConfig(fileData, initialData.modConfigPath);
            sendMessage(event, data.modName, 'Successfully Enabled Mod', 200, 'success');
            event.sender.send('mod-state', { mods: fileData.mods[ data.modName ], enabled: mods.enabled, disabled: mods.disabled })
        }
        else sendMessage(event, `Trying to activate: ${data.modName}`, `Conflict detected: file is already in use by another mod. Disable conflicting mod and retry`, 200, 'error');
    } catch (error) {
        console.error(error);
        sendMessage(event, 'An error has occurred while enabling enabling mod', 'Failed To Enable Mod', 500, 'error');
    }

})
ipcMain.on('disable-mod', async (event, data) => {
    try {
        const initialData = parseInitialModData(event, data);
        const fileData = JSON.parse(fs.readFileSync(initialData.modConfigPath, 'utf-8'));

        /* Initialize mod object */
        const mod = { modName: data.modName, enabled: false };
        const absoluteModsPath = `${initialData.modsDir}/${mod.modName}`;

        const filesInMod = getFilesInMod(absoluteModsPath, mod.modName);
        const success = await disableModForGame(initialData.gameDir, filesInMod, mod.modName, data.id, event)

        if (success) {
            /* If Mod does not exist in file - add it */
            if (!fileData.mods[ data.modName ])
                fileData.mods[ data.modName ] = mod;
            else fileData.mods[ data.modName ].enabled = false;

            const mods = getAllMods(fileData)
            await saveConfig(fileData, initialData.modConfigPath);
            sendMessage(event, data.modName, 'Successfully Disabled Mod', 200, 'success');
            event.sender.send('mod-state', { mods: fileData.mods[ data.modName ], enabled: mods.enabled, disabled: mods.disabled })

        }
        else sendMessage(event, 'An error occurred while attempting to disable mod', 'UnknownDisableErr', 500, 'error');
    } catch (error) {
        console.error(error);
    }
})
ipcMain.on('get-settings', async (event) => {
    try {
        const exists = fs.existsSync(path.join(dataFilePath, 'config.json'));
        if (exists) {
            const config = JSON.parse(fs.readFileSync(`${dataFilePath}/config.json`));
            const shadPS4Dir = path.dirname(config.shadPS4Exe);
            const shadPS4Config = fs.readFileSync(path.join(shadPS4Dir, 'user', 'config.toml'));
            const shadPS4ConfigData = toml.parse(shadPS4Config);

            event.sender.send('get-settings', shadPS4ConfigData);
        }
    } catch (error) {
        console.error(error);
    }
})
/* Client Handling */
ipcMain.handle('get-json-data', async () => {
    const exists = fs.existsSync(path.join(dataFilePath, 'config.json'));
    if (exists) {
        const config = `${dataFilePath}/config.json`;
        const data = JSON.parse(fs.readFileSync(config))
        if (data) {
            return data;
        }
    }
    else return false;
})
ipcMain.handle('minimize-window', async () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window)
        window.minimize();
})
ipcMain.handle('maximize-window', async () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
        if (window.isMaximized())
            window.unmaximize();
        else
            window.maximize();

        return window.isMaximized();
    }
})
ipcMain.handle('maximize-status', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window)
        return window.isMaximized();

    return false;
})
ipcMain.handle('get-mod-states', async (event, data) => {
    const initialData = parseInitialModData(event, data);
    const modData = JSON.parse(fs.readFileSync(`${initialData.modConfigPath}`));
    return modData;
})
ipcMain.on('launch-game', async (event, data) => {
    try {
        const config = JSON.parse(fs.readFileSync(path.join(dataFilePath, 'config.json')));
        const shadPS4Exe = config.shadPS4Exe;
        const shadPS4Dir = path.dirname(shadPS4Exe);
        const shadPS4ConfigFilePath = path.join(shadPS4Dir, 'user', 'config.toml');
        const shadPS4ConfigFile = fs.readFileSync(shadPS4ConfigFilePath);
        const shadPS4ConfigData = toml.parse(shadPS4ConfigFile);

        shadPS4ConfigData.General.Fullscreen = data.fullscreen;
        shadPS4ConfigData.General.isPS4Pro = data.isPS4Pro;
        shadPS4ConfigData.General.showSplash = data.showSplash;
        shadPS4ConfigData.General.logType = data.logType;
        shadPS4ConfigData.GPU.vblankDivider = +data.vBlankDivider;
        shadPS4ConfigData.GPU.screenHeight = +data.screenHeight;
        shadPS4ConfigData.GPU.screenWidth = +data.screenWidth;

        console.log({ width: shadPS4ConfigData.GPU.screenWidth, height: shadPS4ConfigData.GPU.screenHeight });
        let tomlString = toml.stringify(shadPS4ConfigData);
        fs.writeFileSync(shadPS4ConfigFilePath, tomlString);

        const shadPS4Process = spawn(shadPS4Exe, [ data.bin ], {
            cwd: shadPS4Dir,
            stdio: 'ignore',
            detached: false
        })

        shadPS4Process.on('error', err => {
            console.error('Failed to launch application', err);
        })

        shadPS4Process.on('exit', code => {
            console.error('ShadPS4 exited with code: ', code);
            event.sender.send('shadPS4-process', { processStatus: 'inactive' })
        })

        event.sender.send('shadPS4-process', { processStatus: 'active' })
    } catch (error) {
        console.error('An error occurred while trying to launch game', error);
    }
})
ipcMain.on('fetch-games-in-library', async (event) => {
    const config = JSON.parse(await fs.promises.readFile(path.join(dataFilePath, 'config.json')));
    getGamesInLibrary(config);

    event.sender.send('fetch-games-in-library', { games: config.games })
})

function parseInitialModData(event, data) {
    try {
        const exists = fs.existsSync(`${dataFilePath}/mods/${data.id}.json`);
        const configFile = JSON.parse(fs.readFileSync(`${dataFilePath}/config.json`));

        if (!exists) {
            fs.mkdirSync(dataFilePath + '/mods', { recursive: true });
            fs.writeFileSync(`${dataFilePath}/mods/${data.id}.json`, JSON.stringify({ mods: {} }, null, 2));
        }

        const modConfigPath = `${dataFilePath}/mods/${data.id}.json`;
        const gameDir = `${configFile.games_path}/${data.id}`
        const modsDir = `${configFile.mods_path}/${data.id}`;

        return {
            modConfigPath: modConfigPath,
            gameDir: gameDir,
            modsDir: modsDir,
        }
    } catch (error) {
        console.error(error);
        return sendMessage(event, 'An error occurred while trying to parse mod config file', 'ModParsingError', 500, 'error');
    }
}
function getAllMods(allModsList) {
    const allMods = Object.values(allModsList.mods);
    const enabledMods = allMods.filter(x => x.enabled);
    const disabledMods = allMods.filter(x => !x.enabled);

    return ({ all: allMods, enabled: enabledMods, disabled: disabledMods });
}
function getFilesInMod(fullModPath, modName) {
    const files = [];
    const entries = fs.readdirSync(fullModPath, { withFileTypes: true, recursive: true });

    const normalizedPath = path.normalize(fullModPath);
    const modRootIndex = normalizedPath.indexOf(modName);
    const modRoot = normalizedPath.substring(modRootIndex);

    if (entries) {
        for (const entry of entries) {
            const relativePath = path.relative(modRoot, path.join(entry.parentPath.substring(modRootIndex)));
            if (entry.isFile()) {
                files.push({ path: relativePath, file: entry.name, fullPath: entry.parentPath });
            }
        }

        return files;
    }
}
function getGameRootDir(fullGamePath, appId, originalFiles, filesToLink) {
    try {
        const normalizedPath = path.normalize(fullGamePath);
        const gameRootIndex = normalizedPath.indexOf(appId);
        const gameRootDir = normalizedPath.substring(gameRootIndex);

        const entries = fs.readdirSync(fullGamePath, { withFileTypes: true, recursive: true });
        /* Set initial relative file paths */
        for (const entry of entries) {
            const relativePath = path.relative(gameRootDir, path.join(entry.parentPath.substring(gameRootIndex)))
            if (entry.isFile()) {
                originalFiles.push({ path: relativePath, file: entry.name, fullPath: path.join(fullGamePath, relativePath) });
            }
        }
        const filtered = originalFiles.filter(fileToLink =>
            filesToLink.some(originalFile =>
                originalFile.path === fileToLink.path && originalFile.file === fileToLink.file
            )
        )

        return filtered;
    } catch (error) {
        console.error(error);
        sendMessage('An error has occurred while reading the game root directory', 'An internal error has occured while attempting to get game root directory', 'GameRootDirErr', 500, 'error');
    }

}
function sendMessage(event, message, name, code, type) {
    const obj = {
        message: message,
        name: name,
        code: code,
        type: type
    };
    event.sender.send('message', obj);
}
function createWindow() {
    let win = new BrowserWindow({
        width: 1440,
        height: 900,
        minHeight: 600,
        minWidth: 800,
        frame: false,
        icon: path.join(__dirname, '..', 'assets', 'shadps4_alchemist.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false
        },
    })
    isDev ? win.loadURL('http://localhost:3000') : win.loadURL(`file://${path.join(__dirname, '..', 'build', 'index.html')}`);
    win.on('closed', () => win = null)
}
function readUInt(buffer, offset, length) {
    if (length === 1) return buffer.readUInt8(offset);
    if (length === 2) return buffer.readUInt16LE(offset);
    if (length === 4) return buffer.readUInt32LE(offset);
}
function parseSFO(buffer) {
    let title;
    let id;
    let appVer;

    // Read the SFO header
    const magic = buffer.slice(0, 4).toString('ascii');
    if (magic !== "\0PSF")
        throw new Error('Invalid magic number in sfo');

    const keyTableStart = readUInt(buffer, 8, 4);   // Offset to key table
    const dataTableStart = readUInt(buffer, 12, 4); // Offset to data table
    const tableEntries = readUInt(buffer, 16, 4);   // Number of parameters (key-value pairs)

    // Iterate through each parameter entry in the header
    for (let i = 0; i < tableEntries; i++) {
        const entryOffset = 20 + (i * 16);  // Each entry is 16 bytes

        const keyOffset = readUInt(buffer, entryOffset, 2);  // Offset into the key table
        const dataLength = readUInt(buffer, entryOffset + 4, 4); // Length of the data
        const dataOffset = readUInt(buffer, entryOffset + 12, 4); // Offset into the data table

        // Get the key name (e.g., "TITLE")
        const key = buffer.toString('ascii', keyTableStart + keyOffset, buffer.indexOf(0, keyTableStart + keyOffset));

        // If the key is "TITLE", read the value from the data table
        if (key === 'TITLE') {
            title = buffer.toString('utf-8', dataTableStart + dataOffset, dataTableStart + dataOffset + dataLength - 1);
        }
        if (key === 'APP_VER') {
            appVer = buffer.toString('utf-8', dataTableStart + dataOffset, dataTableStart + dataOffset + dataLength - 1);
        }
        if (key === 'TITLE_ID') {
            id = buffer.toString('utf-8', dataTableStart + dataOffset, dataTableStart + dataOffset + dataLength - 1);
        }
    }

    return { title, appVer, id };
}
function checkFileExists(pathToFile, file) {
    return fs.existsSync(path.join(pathToFile, file));
}
function checkSameDrive(event, arr) {
    for (let i = 0; i < arr.length; i++) {
        console.log(path.parse(arr[ i ]).root);
        if (path.normalize(path.parse(arr[ i ]).root) !== path.normalize(path.parse(arr[ 0 ]).root)) {
            event.sender.send('error', { message: 'Error: games and mod directories must be on the same drive' })
            return false;
        }
    }
    return true;
}
function getGamesInDirectory(gamesDirectory) {
    games = [];
    const gamesAvailable = fs.readdirSync(gamesDirectory).filter(x => x.startsWith('CUSA')); // Make sure all directories start with CUSA
    gamesAvailable.forEach(directory => {
        const sfoExists = fs.existsSync(path.join(gamesDirectory, directory, 'sce_sys', 'param.sfo'));
        const binExists = fs.existsSync(path.join(gamesDirectory, directory, 'eboot.bin'));
        if (sfoExists && binExists) { // Game must have a .sfo and eboot.bin file in order to be seen as a game available to play and be added to the library
            const sfo = fs.readFileSync(path.normalize(path.join(gamesDirectory, directory, 'sce_sys', 'param.sfo')));
            const icon = path.normalize(path.join(gamesDirectory, directory, 'sce_sys', 'icon0.png'));
            if (sfoExists) {
                const game = parseSFO(sfo);
                if (!games.some(x => x.id === game.id)) { // Add game only if the games list doesn't already have an identical game based on the ID provided
                    games.push({ title: game.title, appVersion: game.appVer, id: game.id, icon: icon, path: `${gamesDirectory}/${directory}` });
                }
            }
        }
    })
    if (games) return games;
}

async function saveConfig(data, filePath) {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
}
async function parseJSON(pathToFile, json) {
    if (checkFileExists(pathToFile, json)) {
        const data = JSON.parse(await fs.promises.readFile(path.join(pathToFile, json)));
        console.log(data)
        if (data) return data;
    }
}
async function getGamesInLibrary(config) {
    const gamesDirectory = config.games_path;
    const gamesAvailable = fs.readdirSync(gamesDirectory).filter(x => x.startsWith('CUSA')); // Make sure all directories start with CUSA

    gamesAvailable.forEach(directory => {
        const sfoExists = fs.existsSync(path.join(gamesDirectory, directory, 'sce_sys', 'param.sfo'));
        const binExists = fs.existsSync(path.join(gamesDirectory, directory, 'eboot.bin'));
        if (sfoExists && binExists) { // Game must have a .sfo and eboot.bin file in order to be seen as a game available to play and be added to the library
            const sfo = fs.readFileSync(path.normalize(path.join(gamesDirectory, directory, 'sce_sys', 'param.sfo')));
            const icon = path.normalize(path.join(gamesDirectory, directory, 'sce_sys', 'icon0.png'));
            if (sfoExists) {
                const game = parseSFO(sfo);
                if (!games.some(x => x.id === game.id)) { // Add game only if the games list doesn't already have an identical game based on the ID provided
                    games.push({ title: game.title, appVersion: game.appVer, id: game.id, icon: icon, path: `${gamesDirectory}/${directory}` });
                }
            }
        }
    })

    config.games = games;
    await saveConfig(config, `${dataFilePath}/config.json`);
}
async function enableModForGame(fullGamePath, mod, modName, appId, event) {
    let conflict = false;
    const modFilesToLink = mod;
    const originalFiles = [];
    const originalFilesToRename = getGameRootDir(fullGamePath, appId, originalFiles, mod)
    try {
        /* Check for conflicts */
        for (const file of originalFilesToRename) {
            const conflictedFile = await fs.promises.access(`${file.fullPath}\\_${file.file}`).then(() => true).catch(() => false);
            console.log('Conflicted file found:', conflictedFile);
            if (conflictedFile) {
                c.error('Conflict detected');
                conflict = true;
                break;
            }
        }
        /* If there's a conflict, do nothing */
        if (conflict) return false;

        /* Rename original file */
        for (const file of originalFilesToRename) {
            const originalFile = `${file.fullPath}\\${file.file}`
            const renamedFile = `${file.fullPath}\\_${file.file}`
            await fs.promises.rename(originalFile, renamedFile);
            c.success(`Renaming... ${originalFile} -> ${renamedFile}`);
        }

        /* Link mod files to game directory */
        for (const file of modFilesToLink) {
            const originalFileObject = originalFiles.find(x => x && x.fullPath && x.file === file.file)
            let originalFileLinkPath;
            if (originalFileObject)
                originalFileLinkPath = path.join(originalFileObject.fullPath, originalFileObject.file);
            else continue;

            const isRenamed = await fs.promises.access(`${originalFileObject.fullPath}\\_${originalFileObject.file}`).then(() => true).catch(() => false);
            const fileToLink = `${file.fullPath}\\${file.file}`

            if (isRenamed) {
                c.warning(`Linking... ${fileToLink} -> ${originalFileLinkPath}`);
                await fs.promises.link(fileToLink, originalFileLinkPath);
            }
        }
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
async function disableModForGame(fullGamePath, mod, modName, appId, event) {
    const filesToUnlink = mod;
    const originalFiles = [];

    const entries = fs.readdirSync(fullGamePath, { withFileTypes: true, recursive: true });

    const normalizedPath = path.normalize(fullGamePath);
    const gameRootIndex = normalizedPath.indexOf(appId);
    const gameRootDir = normalizedPath.substring(gameRootIndex);

    /* Set initial relative file paths */
    for (const entry of entries) {
        const relativePath = path.relative(gameRootDir, path.join(entry.parentPath.substring(gameRootIndex)))
        if (entry.isFile()) {
            originalFiles.push({ path: relativePath, file: entry.name, fullPath: path.join(fullGamePath, relativePath) });
        }
    }
    const filtered = originalFiles.filter(fileToUnlink =>
        filesToUnlink.some(originalFile =>
            originalFile.path === fileToUnlink.path && `_${originalFile.file}` === fileToUnlink.file
        )
    );
    let failed = false;

    /* Unlink hardlink */
    for (const file of filtered) {
        const fullFilePathToLink = path.join(file.fullPath, file.file.replace('_', ''));
        if (fullFilePathToLink) {
            c.warning(`Unlinking... ${fullFilePathToLink}`)
            await fs.promises.unlink(fullFilePathToLink);
        }
        else {
            failed = true
            break;
        }
    }

    if (failed)
        return false;

    /* Rename original file to origin */
    for (const file of filtered) {
        const fullOriginalFilePath = path.join(file.fullPath, file.file.replace('_', ''));
        const prefixFilePath = path.join(file.fullPath, file.file);
        if (fs.existsSync(prefixFilePath)) {
            await fs.promises.rename(prefixFilePath, fullOriginalFilePath);
        }
        else {
            console.error('No original files found to revert prefixed state');
        }
    }
    return true;
}