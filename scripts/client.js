var field = document.getElementById('field');
var socket = io();
var fieldItems = [];
socket.on('start', function(data) {
  fieldItems = data.fields;
  createFields();
  addEvents();
});

socket.on('update', function(data) {
  fieldItems = data.fields;
  updateFields();
});

socket.on('updatePlayers', function(data) {
  playersTable(data);
});

socket.on('boom', function(items) {
  _.each(items, function(item, i) {
    var target = document.querySelector('[data-id="' + item.id + '"]');

    target.className = 'field__item';

    target.classList.add('rubberBand');
    target.classList.add('animated');

    setTimeout(function() {
      target.className = 'field__item';
    }, 700);
  });
});

var name = localStorage.getItem('name') || prompt('Вас кличут:');
localStorage.setItem('name', name);
socket.emit('addPlayer', name);

function playersTable(players) {
  var container = document.createElement('div');
  container.classList.add('players');
  var keys = _.keys(players);
  console.log(players);
  for (var i = 0; i < keys.length; i++) {
    if (!players[keys[i]].name) continue;
    var item = document.createElement('div');
    item.classList.add('player');
    console.log(players[keys[i]].points);
    item.innerHTML = players[keys[i]].name + ': ' +  players[keys[i]].points;
    container.appendChild(item);
  }
  document.querySelector('#playersTable').innerHTML = container.outerHTML;
}

function updateFields() {
  for (var i = 0; i < fieldItems.length; i++) {
    for (var j = 0; j < fieldItems[i].length; j++) {
      var item = fieldItems[i][j];
      var node = document.querySelector('[data-id="' + item.id + '"]');
      node.style.backgroundColor = item.color;
    }
  }
}

function createFields() {
  for (var i = 0; i < fieldItems.length; i++) {
    var row = createFieldRow();
    for (var j = 0; j < fieldItems[i].length; j++) {
      var item = createFieldItem(fieldItems[i][j].id);
      item.style.backgroundColor = fieldItems[i][j].color;
      row.appendChild(item);
    }
  }
}

function createFieldItem(id) {
  var item = document.createElement('div');
  item.classList.add('field__item');
  item.setAttribute('data-id', id);
  return item;
}

function createFieldRow() {
  var row = document.createElement('div');
  row.classList.add('field__row');
  field.appendChild(row);
  return row;
}

function addEvents() {
  field.addEventListener("click", function(e) {
    var target = e.target;
    if (!target.classList.contains('field__item')) return;

    target.className = 'field__item';
    target.classList.add('bounceIn');
    target.classList.add('animated');
    setTimeout(function() {
      target.className = 'field__item';
    }, 500);
    socket.emit('button:pressed', target.getAttribute('data-id'));
  });
}
