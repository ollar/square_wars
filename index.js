'use steict';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var state = new Array(25);

var winArray = [];

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function checkForCombo() {
  var similarColors = 1;
  var winColor = '';

  for (var i = 0; i < 25; i++) {
    (function(_i) {
      if (state[_i] && state[_i] === state[_i+1]) {
        similarColors++;
        winArray.push(_i);
        winColor = state[_i];
      }
    })(i);
  }
  if (similarColors >= 4) {
    io.emit('boom', winColor);
    winColor = '';
    similarColors = 0;
  }
  console.log(similarColors);
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('start', {
    color: getRandomColor(),
    state: state
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('button:pressed', function(i, color) {
    state[i] = color;
    io.emit('button:pressed', i, color);
    checkForCombo();
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
