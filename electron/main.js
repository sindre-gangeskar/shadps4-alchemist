import './reload.cjs';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import isDev from 'electron-is-dev';
import path, { relative } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.join(__dirname, '..', 'data');
var games = [];

if (!fs.existsSync(path.join(__dirname, '..', 'data')))
    fs.mkdirSync(path.join(__dirname, '..', 'data'), {
        recursive: true
    })

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        minHeight: 600,
        minWidth: 800,
        frame: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false
        }
    })

    isDev ? win.loadURL('http://localhost:3000') :
        win.loadFile(path.join(__dirname, '..', 'public', 'index.html'));
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
function saveConfig(data, filePath) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}


/* Electron Initialization */
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
})
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
        createWindow();
})

/* IPC Handling */

/* Initialization */
ipcMain.on('open-file-dialog', async (event) => {
    const exists = fs.existsSync(`${dataFilePath}/config.json`)

    if (!exists)
        fs.writeFileSync(`${dataFilePath}/config.json`, JSON.stringify({}, null, 2));

    const setGamesLibrary = await dialog.showOpenDialog({
        title: 'Select ShadPS4 Games Library',
        properties: [ 'openDirectory' ]
    });

    if (!setGamesLibrary.canceled) { // If user doesn't cancel the dialog

        // Set the shadPS4.exe file. 
        const exeResult = await dialog.showOpenDialog({
            properties: [ 'openFile' ],
            title: 'Locate shadPS4 executable',
            defaultPath: 'shadPS4.exe',
            filters: [ { name: 'shadPS4.exe', extensions: [ 'exe' ] } ]
        })

        const selectedFile = exeResult.filePaths[ 0 ];

        if (!exeResult.canceled) {
            if (path.basename(selectedFile) !== 'shadPS4.exe') {
                console.error('Executable selected is not shadPS4.exe');
                return;
            }
        }

        const setModsDirectory = await dialog.showOpenDialog({
            properties: [ 'openDirectory' ],
            title: 'Set Mods Directory',
        })

        if (setModsDirectory.canceled) {
            return;
        }

        const config = {
            games_path: setGamesLibrary.filePaths[ 0 ],
            mods_path: setModsDirectory.filePaths[ 0 ],
            shadPS4Exe: selectedFile,
            games: games
        }

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

        const checkSameDrive = (arr) => {
            for (let i = 0; i < arr.length; i++) {
                console.log(path.parse(arr[ i ]).root);
                if (path.normalize(path.parse(arr[ i ]).root) !== path.normalize(path.parse(arr[ 0 ]).root)) {
                    event.sender.send('error', { message: 'Error: All directories must be on the same drive' })
                    return false;
                }
            }
            return true;
        }

        // Save and send data to rendering client
        const paths = [ config.games_path, config.mods_path, config.shadPS4Exe ];
        if (checkSameDrive(paths)) {
            fs.writeFileSync(`${dataFilePath}/config.json`, JSON.stringify(config, null, 2));
            saveConfig(config, 'config.json');
            event.sender.send('games-updated', { games: games, shadPS4Exe: config.selectedFile });
        }

        else {
            const error = {
                message: 'All directories must be on the same drive',
                name: 'InvalidDrivesError',
                code: 400
            };
            console.error(error.message);
            event.sender.send('error', error);
        }
    }
})
ipcMain.on('open-in-explorer', async (event, path) => {
    if (path) {
        shell.openPath(path);
        console.log(path);
    }
})
ipcMain.on('launch-game', async (event, bin) => {
    try {
        const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'config.json')));
        const shadPS4Exe = config.shadPS4Exe;
        const shadPS4Dir = path.dirname(shadPS4Exe);

        const shadPS4Process = spawn(shadPS4Exe, [ bin ], {
            cwd: shadPS4Dir,
            stdio: 'ignore',
            detached: true
        })

        shadPS4Process.on('error', err => {
            console.error('Failed to launch application', err);
        })

        shadPS4Process.on('exit', code => {
            console.error('ShadPS4 exited with code: ', code);
        })

        shadPS4Process.unref();
    } catch (error) {
        console.error('An error occurred while trying to launch game', error);
    }

})

/* Mods */
ipcMain.on(`get-mods-directory`, async (event, id) => {
    const configFile = JSON.parse(fs.readFileSync(`${dataFilePath}/config.json`));
    const modsPath = configFile.mods_path;
    const idExists = fs.existsSync(`${modsPath}/${id}`);

    if (idExists) {
        const directory = fs.readdirSync(`${modsPath}/${id}`, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
        event.sender.send(`mods-${id}`, { mods: directory.length > 0 ? directory : `No mods found for ${id}` });
    }
    else {
        event.sender.send(`mods-${id}`, { mods: `No mods found for ${id}` });
    }
})
ipcMain.on('enable-mod', async (event, data) => {
    const exists = fs.existsSync(`${dataFilePath}/mods/${data.id}.json`);
    const configFile = JSON.parse(fs.readFileSync(`${dataFilePath}/config.json`));
    if (!exists) {
        fs.mkdirSync(dataFilePath + '/mods', { recursive: true });
        fs.writeFileSync(`${dataFilePath}/mods/${data.id}.json`, JSON.stringify({ mods: {} }, null, 2));
    }
    const modConfigPath = `${dataFilePath}/mods/${data.id}.json`;
    const gameDir = `${configFile.games_path}/${data.id}`
    const modsDir = `${configFile.mods_path}/${data.id}`;

    /* Initialize mod object */
    const mod = { modName: data.modName, enabled: true };
    const absoluteModsPath = `${modsDir}/${mod.modName}`;

    const filesInMod = getFilesInMod(absoluteModsPath, mod.modName);
    const filesInGame = enableModForGame(gameDir, filesInMod, data.id)

    if (filesInGame.length === filesInMod.length)
        console.log('Array lengths match!');


    /* Parse mods config file for said game */
    const fileData = JSON.parse(fs.readFileSync(modConfigPath, 'utf-8'));

    if (!fileData.mods[ data.modName ])
        fileData.mods[ data.modName ] = mod;

    else
        fileData.mods[ data.modName ].enabled = true;

    saveConfig(fileData, modConfigPath);
    const allMods = Object.values(fileData.mods);
    const enabledMods = allMods.filter(x => x.enabled);
    const disabledMods = allMods.filter(x => !x.enabled);
    event.sender.send('mod-data', { mods: fileData.mods[ data.modName ], enabled: enabledMods, disabled: disabledMods })
})
ipcMain.on('disable-mod', async (event, data) => {
    const exists = fs.existsSync(`${dataFilePath}/mods/${data.id}.json`);
    const configFile = JSON.parse(fs.readFileSync(`${dataFilePath}/config.json`));

    if (!exists) {
        fs.mkdirSync(dataFilePath + '/mods', { recursive: true });
        fs.writeFileSync(`${dataFilePath}/mods/${data.id}.json`, JSON.stringify({ mods: {} }, null, 2));
    }

    const modConfigPath = `${dataFilePath}/mods/${data.id}.json`;
    const gameDir = `${configFile.games_path}/${data.id}`
    const modsDir = `${configFile.mods_path}/${data.id}`;

    /* Initialize mod object */
    const mod = { modName: data.modName, enabled: false };
    const absoluteModsPath = `${modsDir}/${mod.modName}`;

    const filesInMod = getFilesInMod(absoluteModsPath, mod.modName);
    disableModForGame(gameDir, filesInMod, data.id)

    /* Parse mods config file for said game */
    const fileData = JSON.parse(fs.readFileSync(modConfigPath, 'utf-8'));

    if (!fileData.mods[ data.modName ])
        fileData.mods[ data.modName ] = mod;

    else
        fileData.mods[ data.modName ].enabled = false;

    saveConfig(fileData, modConfigPath);
    const allMods = Object.values(fileData.mods);
    const enabledMods = allMods.filter(x => x.enabled);
    const disabledMods = allMods.filter(x => !x.enabled);
    event.sender.send('mod-data', { mods: fileData.mods[ data.modName ], enabled: enabledMods, disabled: disabledMods })
})


/* Client Handling */
ipcMain.handle('get-json-data', async () => {
    const exists = fs.existsSync(dataFilePath + '/config.json');
    if (exists) {
        const config = `${dataFilePath}/config.json`;
        const data = JSON.parse(fs.readFileSync(config))
        if (data.games) {
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

        /*     console.log('Mod Files:', files); */
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
        const userError = { message: 'An error has occurred while reading the game root directory' };
        sendError(event)

    }

}
function enableModForGame(fullGamePath, mod, appId) {
    const filesToLink = mod;
    const originalFiles = [];

    const filtered = getGameRootDir(fullGamePath, appId, originalFiles, mod)
    const original = [ ...filtered ];


    console.log(original);

    filtered.forEach(file => {
        const prefix = '_' + file.file;
        const fullOriginalFilePath = path.join(file.fullPath, file.file);
        const prefixFilePath = path.join(file.fullPath, prefix);
        fs.renameSync(fullOriginalFilePath, prefixFilePath);
    })

    filesToLink.forEach(file => {
        const matchingOriginalFile = original.find(orig =>
            orig.path === file.path && orig.file === file.file
        );

        console.log(matchingOriginalFile);
        if (matchingOriginalFile) {
            const sourcePath = path.join(file.fullPath, file.file);
            const destPath = path.join(matchingOriginalFile.fullPath, file.file);
            fs.linkSync(sourcePath, destPath);
        }
    })

    return filtered;
}
function disableModForGame(fullGamePath, mod, appId) {
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

    console.log(filtered);

    filtered.forEach(file => {
        const prefixFilePath = path.join(file.fullPath, file.file);
        const fullOriginalFilePath = path.join(file.fullPath, file.file.replace('_', ''));
        if (fs.existsSync(prefixFilePath)) {
            if (fullOriginalFilePath) {
                fs.unlinkSync(fullOriginalFilePath);
                fs.renameSync(prefixFilePath, fullOriginalFilePath);
            }
        }
    })

    return 'Successfully uninstalled mod';
}

function sendError(event, message) {
    event.sender.send('error', { message: 'Error: All directories must be on the same drive' })
}