import pkg from "electron-updater";
const { autoUpdater } = pkg;

autoUpdater.channel = 'alpha'
autoUpdater.allowPrerelease = true;
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

async function checkForUpdates(event) {
  return new Promise((resolve, reject) => {
    autoUpdater.checkForUpdates(event);

    autoUpdater.once('update-available', () => {
      event.sender.send('check-updates', { message: 'An update is available. Click to download and install', updateAvailable: true })
      resolve(true);
    })

    autoUpdater.once('update-not-available', () => {
      event.sender.send('check-updates', { message: 'There are no updates at this time', updateAvailable: false })
      resolve(false);
    })

    autoUpdater.once('error', (err) => {
      reject(err);
      console.error('Error during update:', err);
    });
  })
}
export default { checkForUpdates };