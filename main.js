const {app, Menu, Tray, BrowserWindow} = require('electron');
require('electron-debug')({showDevTools:false});

const path = require('path');

let mainWindow;

function createWindow () {
  // // ------------------------- CREATE TRAY ICON --------------------------------
  tray = new Tray(path.join(__dirname,'icon.ico'));
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Reload', click: () => mainWindow.reload() },
    {label: 'Exit', click: () => app.quit() },
  ])
  tray.setContextMenu(contextMenu);
  tray.on('click', () => tray.popUpContextMenu(contextMenu));

  // // ------------------------- START SERVER ---------------------------------
  require('./server');


  // ------------------------- CREATE WINDOW ---------------------------------
  mainWindow = new BrowserWindow({width: 880, height: 40,  frame: false, transparent: true, alwaysOnTop: true, skipTaskbar: true})

  mainWindow.loadURL("http://localhost:8888/")

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
