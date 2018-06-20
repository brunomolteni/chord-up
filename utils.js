
// ------------------------- UTILS ----------------------------------

var SILENT = true;

function log(){
  SILENT || console.log.apply(this,arguments);
}

function getNetworkIP(callback) {
  var socket = net.createConnection(80, 'www.google.com');
  socket.on('connect', function() {
    callback(undefined, socket.address().address);
    socket.end();
  });
  socket.on('error', function(e) {
    callback(e, 'error');
  });
}

function toBytesInt32 (num) {
    arr = new ArrayBuffer(4);
    view = new DataView(arr);
    view.setUint32(0, num, false);
    return arr;
}

Buffer.prototype.readBytes = function () {
  var messagetxt = ''
  // Convert bytes to string
  for(var i = 0; i < this.length; i++) {
    messagetxt += String.fromCharCode(this[i]);
  }
  return messagetxt;
};
String.prototype.getBytes = function () {
  var textBuff = new Buffer(this.toString());
  var lengthBuff = new Buffer(toBytesInt32(textBuff.length));
  var resultBuff = Buffer.concat([lengthBuff,textBuff]);

  return resultBuff;
};


module.exports = {
  log,
  getNetworkIP,
}
