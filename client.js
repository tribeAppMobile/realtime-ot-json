var ReconnectingWebSocket = require('reconnecting-websocket');
var sharedb = require('sharedb/lib/client');
var jsondiff = require("json0-ot-diff");
var diffMatchPatch = require("diff-match-patch");
var _ = require("lodash");

// Open WebSocket connection to ShareDB server
var socket = new ReconnectingWebSocket('ws://' + window.location.host);
var connection = new sharedb.Connection(socket);

// Create local Doc instance mapped to 'examples' collection document with id 'counter'
var doc = connection.get('examples', 'counter');
var my_data = {};

// Get initial value of document and subscribe to changes
doc.subscribe(showNumbers);
// When document changes (by this client or any other, or the server),
// update the number on the page
doc.on('op', showNumbers);

function showNumbers() {
  my_data = doc.data;
  const date = new Date(my_data.date);
  document.querySelector('#num-clicks').textContent = doc.data.num + ' times, Updated: ' + date.toLocaleString();
};

// When clicking on the '+1' button, change the number in the local
// document and sync the change to the server and other connected
// clients
function increment() {
  // Increment `doc.data.numClicks`. See
  // https://github.com/ottypes/json0 for list of valid operations.
  const old_data = _.clone(my_data);
  my_data.num++;
  my_data.date = new Date();
  var diff = jsondiff(
    old_data,
    my_data,
    diffMatchPatch
  );
  doc.submitOp(diff);
}

// Expose to index.html
global.increment = increment;
