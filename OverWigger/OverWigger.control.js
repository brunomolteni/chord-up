loadAPI(5);
load('es5-shim.min.js');
load('json3.min.js');

// Remove this if you want to be able to use deprecated methods without causing script to stop.
// This is useful during development.
host.setShouldFailOnDeprecatedUse(true);

host.defineController("Brumo", "Overwigger", "0.1", "e5d14328-7cfb-41ef-a2b0-2ceb53eb0f42", "Brumo");

var clientConn;
var clientIsConnected = false;
var app;
var track1;
var device1;
var macros = [];
var tracks = [];
var arrayOf8 = createArray(8);
var arrayOf4 = createArray(4);

var SILENT = false;

//
// Callbacks
//

function init()
{
  log( "-------- INIT ---------");
  app = host.createApplication();
  masterTrack = host.createMasterTrack(0);
  cursorTrack = host.createCursorTrack(4, 8);
  trackBank = host.createMainTrackBank(8, 4, 4);
	trackBank.followCursorTrack(cursorTrack);


  // -------------------------------------------------------------------------------------------------
  // ----------------------------------------- Set state: ---------------------------------------
  // -------------------------------------------------------------------------------------------------

  arrayOf8.forEach( function(i1){
    var channel = trackBank.getItemAt(i1);
    var device = channel.createCursorDevice("Primary");
    var chain = device.deviceChain();
    var deviceMacros = device.createCursorRemoteControlsPage(8);
    var macros = arrayOf4.map( function(i2){
      var macro = deviceMacros.getParameter(i2);
      return {macro: macro, moving: false};
    })

    tracks.push({track: channel, macros: macros, device: device});

    // channel.selectInMixer();
    // device.selectFirstInChannel( device.channel() );
  });

  // -------------------------------------------------------------------------------------------------
  // ----------------------------------------- Set Listeners: ---------------------------------------
  // -------------------------------------------------------------------------------------------------

  function setupListeners() {

    tracks.forEach( function(el, i){

      if(i>0)el.track.addNoteObserver( function(noteOn, key, velocity){
        sendToBrowser({noteOn: noteOn, key: key , track:i,});
      });

      el.track.color().addValueObserver( function(r,g,b){
        sendToBrowser({track: i, color: {
             r: scaleColor( r ),
             g: scaleColor( g ),
             b: scaleColor( b )
           } });
      });
    });
  }

  setupListeners();

  function respondToInput(data){

    // Re-assemble the Data from the incoming Byte Array:
    var dataString = bytesToString(data);
    var data = JSON3.parse( dataString );

    log("Client Data Incomming ----------------------------");
    log("data: " + dataString + "\n");

    if(data.init){
     sendInitialLayout();
    }
  }

  // -------------------- INITIAL LAYOUT ----------------------

  function sendInitialLayout(){

    var macrosArray = [];

    var channels = tracks.map( function(el,i){
      var color = returnColor( el.track.color() );
      return { color: color, track: i };
    });

    var layout = {
      channels: channels
    };

    sendToBrowser(layout);
  }

  // -------------------------------------------------------------------------------------------------
  // ----------------------------------------- Set Connection: ---------------------------------------
  // -------------------------------------------------------------------------------------------------

  reSocket = host.createRemoteConnection("Overwigger", 42000);
  reSocket.setClientConnectCallback(function (cConn)
  {
    clientConn = cConn;
    clientIsConnected = true;
    log("Client connected");

    // ----------------------- Set Callback for Incoming Data: ----------------
    clientConn.setReceiveCallback( respondToInput );

    // ------------------- Set Callback for Closing connection: ----------------
    clientConn.setDisconnectCallback(function (){
      clientIsConnected = false;
      log("Client disconnected");
    });
  });
}

function exit()
{
  log( "++++++++ EXIT +++++++++");
}


// -------------------------------------------------------------------------------------------------
// ----------------------------------------- UTILITIES: --------------------------------------------
// -------------------------------------------------------------------------------------------------


String.prototype.getBytes = function () {
  var bytes = [];
  for (var i = 0; i < this.length; ++i) {
    bytes.push(this.charCodeAt(i));
  }
  return bytes;
};

function bytesToString(data) {
  var clientData = "";
  for (var i=0; i<data.length; i++) {
    clientData += String.fromCharCode(data[i])
  }
  return clientData;
};

function scaleColor(unscaledNum) {
  return Math.floor( (255 - 0) * (unscaledNum - 0) / (1 - 0) + 0);
}

function returnColor(color){
  return {
    r: scaleColor( color.red() ),
    g: scaleColor( color.green() ),
    b: scaleColor( color.blue() )
  }
}

function sendToBrowser(data)
{
  if(clientIsConnected && clientConn){
    clientConn.send( JSON.stringify(data).getBytes() );
    log('Data sent to browser:');
    log(JSON.stringify(data) + "\n");
  }
}

function createArray(length){
  var array = []
  for (var i = 0; i < length; i++) {
    array[i] = i;
  }
  return array;
}

function log(msg){
  SILENT || println(msg);
}
