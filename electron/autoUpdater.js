import pkg from "electron-updater";
const { autoUpdater } = pkg;
async function checkForUpdates(event = null) {
  autoUpdater.on('update-available', () => {
    if (event) {
      event.sender.send('update-available', { message: 'An update is available' });
    }
    console.log('Update detected')
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded');
    /* event.sender.send('update-downloaded', { message: 'An update has been downloaded' }); */
  })

  autoUpdater.on('update-not-available', () => {
    console.log('No updates are available');
    /*     event.sender.send('update-not-available', { message: 'No update is available' }) */
  })

  autoUpdater.on('error', (err) => {
    console.error('Error during update:', err);
  });

}
async function downloadUpdate(event = null) {
  await autoUpdater.downloadUpdate();
  event.sender.send('check-updates', { message: 'Update has successfully been downloaded. Quit the application to apply the update' });
}
export default { checkForUpdates, downloadUpdate };