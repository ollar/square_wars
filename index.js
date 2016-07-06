'use steict';

global.__approot = __dirname;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/scripts', express.static(__approot + '/scripts'));
app.use('/css', express.static(__approot + '/css'));
var winArray = [];

var length = 5;
var fieldItems = [];
var players = {};
function createFields() {
  for (var i = 0; i < length; i++) {
    fieldItems[i] = [];
    for (var j = 0; j < length; j++) {
      var id = i + '_' + j;
      fieldItems[i][j] = {
        id: id,
        active: false
      };
    }
  }
}

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function recursiveCheck(items, direction, socket) {
  var length = items.length;
  if (length === 4) combo(items, socket);
  var current = items[length - 1];
  var indexes = current.id.split('_');
  var next;
  var newItems;
  if (!direction || direction === 'horizontal') {

    next = fieldItems[parseInt(indexes[0]) + 1] && fieldItems[parseInt(indexes[0]) + 1][indexes[1]];
    if (next && next.owner === current.owner) {
      newItems = items.slice();
      newItems.push(next);
      recursiveCheck(newItems, 'horizontal', socket);
    }
  }
  if (!direction || direction === 'vertical') {
    next = fieldItems[indexes[0]][parseInt(indexes[1]) + 1];
    if (next && next.owner === current.owner) {
      newItems = items.slice();
      newItems.push(next);
      recursiveCheck(newItems, 'vertical', socket);
    }
  }
}

function combo(items, socket) {
  for (var i = 0; i < items.length; i++) {
    items[i].owner = null;
    items[i].color = null;
  }
  players[socket.id].points += 100;
  io.emit('update', {
    fields: fieldItems
  });
  updatePlayers();
}

function checkForCombo(socket) {
  for (var i = 0; i < fieldItems.length; i++) {
    for (var j = 0; j < fieldItems[i].length; j++) {
      var item = fieldItems[i][j];
      if (!item.owner) continue;
      recursiveCheck([item], null, socket);
    }
  }
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

function updatePlayers() {
  io.emit('updatePlayers', players);
}
createFields();
io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.id);
  socket.emit('start', {
    fields: fieldItems
  });
  players[socket.id] = {
    color: getRandomColor(),
    points: 0
  };

  socket.on('disconnect', function(){
    delete players[socket.id];
    updatePlayers();
    console.log('user disconnected');
  });

  socket.on('addPlayer', function(name){
    console.log(socket.id);
    players[socket.id].name = name;
    updatePlayers();
  });

  socket.on('button:pressed', function(id) {
    var indexes = id.split('_');
    fieldItems[indexes[0]][indexes[1]].owner = socket.id;
    fieldItems[indexes[0]][indexes[1]].color = players[socket.id].color;
    io.emit('update', {
      fields: fieldItems
    });
    checkForCombo(socket);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
