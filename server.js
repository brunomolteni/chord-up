var express = require('express')
  , Primus = require('primus')
  , http = require('http')
  , app = express()
  , server = http.createServer(app)
  , Bundler = require("parcel-bundler");

  var myip = require('quick-local-ip');
  var net = require('net');


// ------------------------- UTILS ----------------------------------

var utils = require("./utils");

function sendToBitwig(data){
  if(isBitwigConnected) bitwig.write( JSON.stringify(data).getBytes() );
}

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

// ------------------------- SERVER TO BITWIG ----------------------------------

var reconnect = net.connect.bind(this,{port: 42000, localAddress: '127.0.0.1', localPort: 51000});
var bitwig;
isBitwigConnected = false;
connectToBitwig();

// ------------------------- SERVER TO BROWSER ---------------------------------

var primus = new Primus(server, {transformer: 'websockets'});
var browser;

primus.on('connection', function (spark) {
  browser = spark;
  sendToBitwig({init: true});

  spark.on('data', function message(data) {
    utils.log('got data from Browser: \n',data, '\n');
    sendToBitwig(data);
  });
});

// ------------------------- START SERVER ---------------------------------

primus.save(__dirname +'/src/primus.js');
const file = 'index.html';
const bundler = new Bundler(file, {});

app.use(bundler.middleware());

// start server
server.listen(8888,'0.0.0.0');
