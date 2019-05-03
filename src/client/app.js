import $ from 'jquery';
import tone from 'tone';
import fabric from 'fabric';

$(document).ready(() => {
  console.log('ready');
});

tone.Transport.bpm.value = 90;

var sidebarOpen = true;
var instrumentsOpen = false;
var $expandBars = $('.bars');
var $sideBar = $('#sideBar');
var $navItems = $('#navItems');
var $mainDiv = $('#mainContainer');
var $instruments = $('#instruments');
var $settingsNav = $('.nav-hover:eq(2)');
var $aboutNav = $('.nav-hover:eq(3)');
var $closeSettings = $('#closeSettings');
var $closeAbout = $('#closeAbout');
var $canvas = $('#canvas');
var $playBtn = $('#playBtn');
var $piano = $('.dropdown-item:eq(0)');
var $synth = $('.dropdown-item:eq(1)');

var colors = {
  'C': 'rgb(198, 115, 47)',
  'D': 'rgb(198, 72, 47)',
  'E': 'rgb(198, 47, 55)',
  'F': 'rgb(198, 47, 103)',
  'G': 'rgb(198, 47, 198)',
  'A': 'rgb(133, 47, 198)',
  'B': 'rgb(85, 47, 198)',
};

var notes = ['B', 'A', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'G', 'F', 'E', 'D', 'C'];

$canvas.attr({
  width: $mainDiv.width(),
  height: $mainDiv.height(),
});

var tileW = $mainDiv.width() / 16;
var tileH = $mainDiv.height() / 14;

let rectOpt = {
  fill: 'transparent',
  stroke: 'rgba(20, 20, 22, 1)',
  strokeWidth: 1,
  selectable: false,
}

var grid = new fabric.Canvas('canvas');

drawGrid(tileH, tileW);

// 1 = dark; 2 = light; 3 = contrast;
var activeTheme = localStorage.getItem('activeTheme');
changeTheme(activeTheme);

$piano.focus();

var synth = new tone.PolySynth({
  polyphony: 4,
  voice: tone.Synth,
}).toMaster();

synth.set({
  'oscillator': {
    'type': 'sine',
    'modulationFrequency': 0.2,
  },
  'envelope': {
    'attack': 0.01,
    'decay': 0.7,
    'sustain': 0.14,
    'release': 1.2,
  },
  'volume': -5,
});

grid.on('mouse:down', (e) => {
  if (e.target.get('fill') !== 'transparent') {
    e.target.set('fill', 'transparent');
  }
  else if (e.target.get('fill') === 'transparent') {
    const curNote = e.target.note.slice(0, 1);
    e.target.set('fill', colors[curNote]);
    playTone(e.target);
  }
  console.log(e.target.note, e.target.pitch);
});

$expandBars.click(() => {
  if (sidebarOpen === true) {
    closeSidebar();
  }
  else {
    openSidebar();
  }
});

$instruments.click(() => {
  if (instrumentsOpen === true) {
    $('#instrumentList').hide();
    instrumentsOpen === false;
  }
  else if (instrumentsOpen === false) {
    $('#instrumentList').show();
    instrumentsOpen === true;
  }
})

function openSidebar() {
  $('.nav-header').show();
  $('#instrumentList').show();
  $('#shadowSideBar, #sideBar').css('width', '270px');
  $('.nav-icon').css('padding', '10px 0 10px 28px');
  sidebarOpen = true;
}

function closeSidebar() {
  $('.nav-header:not(#naming)').hide();
  $('#instrumentList').hide();
  $('.nav-icon').css('padding', '20px 0 20px 28px');
  $('#shadowSideBar, #sideBar').css('width', '80px');
  sidebarOpen = false;
}

$settingsNav.click(() => {
  $('.modal:eq(0)').show();
});

$aboutNav.click(() => {
  $('.modal:eq(1)').show();
});

$(window).click((e) => {
  if (e.target.className === 'modal') {
    $('.modal').hide();
  }
});

$closeSettings.click(() => {
  $('.modal').hide();
});

$closeAbout.click(() => {
  $('.modal').hide();
});

$('.modal-button').click((e) => {
  const theme = e.target.id;
  changeTheme(theme);
});

function changeTheme(theme) {
  if (theme === 'darkTheme' || theme === '1') {
    $('.t-light').each((i, obj) => {
      $(obj).removeClass('t-light');
      $(obj).addClass('t-dark');
    });
    grid.forEachObject((rect) => {
      rect.set('stroke', 'rgba(242, 244, 244, 1)');
    });
    grid.renderAll();
    localStorage.setItem('activeTheme', '1')
  }
  else if (theme === 'lightTheme' || theme === '2') {
    $('.t-dark').each((i, obj) => {
      $(obj).removeClass('t-dark');
      $(obj).addClass('t-light');
    });
    grid.forEachObject((rect) => {
      rect.set('stroke', 'rgba(20, 20, 22, 1)');
    });
    grid.renderAll();
    localStorage.setItem('activeTheme', '2')
  }
  else if (theme === 'conTheme') {
    console.log('contrast');
  }
  else {
    console.log('dark');
  }
}

function drawGrid(tH, tW) {
  var ii = 1;
  for (var w = 0; w < $mainDiv.width(); w += tW) {
    var i = 0;
    for (var h = 0; h < $mainDiv.height(); h += tH) {
      var tile = new fabric.Rect({
        ...rectOpt,
        width: tW,
        height: tH,
        top: h,
        left: w,
      });
      /* this is really confusing but 'i' is the note
       and 'ii' is the number of the note horizontally */
      tile.set('note', `${notes[i]}${ii}`);
      /* this is setting either the top octave or the
       bottom octave */
      if (i + 1 <= 7) {
        tile.set('pitch', '2');
      }
      else if (i + 1 > 7) {
        tile.set('pitch', '1');
      }
      // add the tile & data to the grid
      grid.add(tile);
      i++;
    }
    ii++;
  }
}

$('.dropdown-item').click((e) => {
  console.log(e.target.innerHTML);
});

function loadSynth(selected) {
  if (selected.innerHTML === 'PIANO') {
    // load piano
  }
  else if (selected.innerHTML === 'SYNTH') {
    //load synth
  }
}

function playTone(tile, time) {
  const curNote = tile.note.slice(0, 1);
  const curPitch = parseInt(tile.pitch) + 2;
  synth.triggerAttackRelease(`${curNote}${curPitch}`, '8n', time);
}

let noteObj = [
  { 'time': '0', 'note': [] },
  { 'time': '0:1', 'note': [] },
  { 'time': '0:2', 'note': [] },
  { 'time': '0:3', 'note': [] },
  { 'time': '0:4', 'note': [] },
  { 'time': '0:5', 'note': [] },
  { 'time': '0:6', 'note': [] },
  { 'time': '0:7', 'note': [] },
  { 'time': '0:8', 'note': [] },
  { 'time': '0:9', 'note': [] },
  { 'time': '0:10', 'note': [] },
  { 'time': '0:11', 'note': [] },
  { 'time': '0:12', 'note': [] },
  { 'time': '0:13', 'note': [] },
  { 'time': '0:14', 'note': [] },
  { 'time': '0:15', 'note': [] },
];

function playSeq() {
  let colArr = [];
  let colNum = 0;
  let emptyNum = 0;
  let objNum = 0;
  let tiles = grid._objects;
  for (let i = 0; i < 224; i++) {
    if (tiles[i].fill !== 'transparent') {
      const curNote = tiles[i].note.slice(0, 1);
      const curPitch = parseInt(tiles[i].pitch) + 2;
      colArr.push(`${curNote}${curPitch}`);
    }
    else if (tiles[i].fill === 'transparent') {
      emptyNum += 1;
    }
    colNum += 1;
    if (colNum === 14 && emptyNum === 14) {
      objNum += 1;
      emptyNum = 0;
      colNum = 0;
      colArr = [];
    }
    else if (colNum === 14 && emptyNum !== 14) {
      noteObj[objNum].note = colArr;
      objNum += 1;
      emptyNum = 0;
      colNum = 0;
      colArr = [];
    }
  }
  console.log(noteObj);
  tone.Transport.start();
  let part = new tone.Part((time, value) => {
    console.log(value.note);
    synth.triggerAttackRelease(value.note, '4n', time);
  }, noteObj).start(0);
}

$playBtn.click(() => {
  playSeq();
});
