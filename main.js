const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

var express = require('express')
  , Primus = require('primus')
  , http = require('http')

  var net = require('net');
  var utils = require("./utils");

var browser, serverApp, server, primus, bitwig, reconnect, isBitwigConnected = false;

// ------------------------- SERVER TO BITWIG ----------------------------------

function sendToBrowser(data){
  if(primus && primus.write) primus.write(data);
}

function connectToBitwig(){
  bitwig = reconnect();

  bitwig.on('connect', function() {
    utils.log(' -------- Bitwig connected ---------');
    isBitwigConnected = true;
  });

  bitwig.on('data', function(data) {
    parsedData = data.readBytes();
    utils.log('got data from Bitwig: \n', parsedData, '\n');
    sendToBrowser(parsedData);
  });

  bitwig.on('close', function(error) {
    utils.log('connection closed');
    isBitwigConnected = false;
    setTimeout( connectToBitwig, 2000 )
  });

  bitwig.on('error', function (err) {
      utils.log(err);
  });
}

// ------------------------- SERVER TO BROWSER ---------------------------------
function sendToBitwig(data){
  if(isBitwigConnected) bitwig.write( JSON.stringify(data).getBytes() );
}

function connectToBrowser() {
  primus.on('connection', function (spark) {
    browser = spark;
    sendToBitwig({init: true});

    spark.on('data', function message(data) {
      utils.log('got data from Browser: \n',data, '\n');
      sendToBitwig(data);
    });
  });
}


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // ------------------------- START SERVER ---------------------------------

  reconnect = net.connect.bind(this,{port: 42000, localAddress: '127.0.0.1', localPort: 51000});
  serverApp = express()
  server = http.createServer(serverApp);
  primus = new Primus(server, {transformer: 'websockets'});
  //
  connectToBitwig();
  connectToBrowser();
  // primus.save(__dirname +'/src/primus.js');
  // const bundler = new Bundler('index.html', {});
  // serverApp.use(bundler.middleware());
  serverApp.use('/', express.static('dist'));
  // start server
  server.listen(8888,'0.0.0.0');


  // ------------------------- CREATE WINDOW ---------------------------------
  mainWindow = new BrowserWindow({width: 740, height: 40,  frame: false, transparent: true, alwaysOnTop: true})


  // mainWindow.setIgnoreMouseEvents(true, {forward: true});

  // and load the index.html of the app.
  mainWindow.loadURL("http://localhost:8888/")

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
