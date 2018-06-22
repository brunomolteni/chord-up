var express = require('express')
  , Primus = require('primus')
  , http = require('http')
  , path = require('path')
  , net = require('net')
  , utils = require("./utils");

var browser, app, server, primus, bitwig, reconnect, isBitwigConnected = false;


// ------------------------- UTILS ----------------------------------

var utils = require("./utils");

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

// ------------------------- START SERVER ---------------------------------

reconnect = net.connect.bind(this,{port: 42000, localAddress: '127.0.0.1', localPort: 51000});
app = express()
server = http.createServer(app);
primus = new Primus(server, {transformer: 'websockets'});

connectToBitwig();
connectToBrowser();

var publicPath = path.join(__dirname, 'dist');
app.use('/', express.static(publicPath));

server.listen(8888,'0.0.0.0');
