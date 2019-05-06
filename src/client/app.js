import './app.scss';
import $ from 'jquery';
import tone from 'tone';
import fabric from 'fabric';

$(document).ready(() => {
  console.log('ready');
});

/* Globals & jQuery DOM elements cached */

let sidebarOpen = true;
let instrumentsOpen = false;
let isPlaying = false;
let firstPlay = true;
let seq;
let selectedInst;
let currentSelection;
const $expandBars = $('.bars');
const $sideBar = $('#sideBar');
const $navItems = $('#navItems');
const $mainDiv = $('#mainContainer');
const $instruments = $('#instruments');
const $settingsNav = $('.nav-hover:eq(2)');
const $aboutNav = $('.nav-hover:eq(3)');
const $closeSettings = $('#closeSettings');
const $closeAbout = $('#closeAbout');
const $canvas = $('#canvas');
const $playBtn = $('#playBtn');
const $piano = $('.dropdown-item:eq(0)');
const $synth = $('.dropdown-item:eq(1)');
const $bpmSlider = $('#bpmSlider');
const $volSlider = $('#volSlider');
const $reset = $('#resetBtn');

/* Color palette object for each note tile */

const colors = {
  'C': 'rgb(198, 115, 47)',
  'D': 'rgb(198, 72, 47)',
  'E': 'rgb(198, 47, 55)',
  'F': 'rgb(198, 47, 103)',
  'G': 'rgb(198, 47, 198)',
  'A': 'rgb(133, 47, 198)',
  'B': 'rgb(85, 47, 198)',
};

/* 2 octaves of notes being used */

const notes = ['B', 'A', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'G', 'F', 'E', 'D', 'C'];

/* Set canvas height and width to match container size */

$canvas.attr({
  width: $mainDiv.width(),
  height: $mainDiv.height(),
});

var tileW = $mainDiv.width() / 16;
var tileH = $mainDiv.height() / 14;

/* Default tile options for each tile placed on the canvas */

const rectOpt = {
  fill: 'transparent',
  stroke: 'rgba(20, 20, 22, 1)',
  strokeWidth: 1,
  selectable: false,
}

/* Bind canvas to Fabric instance, Then draws the grid based on
  current height and width divisions of the container
 */

var grid = new fabric.Canvas('canvas');
drawGrid(tileH, tileW);

/* Gets the current theme from localStorage (if set), then
  changes the page theme to the corresponding theme.
  1 = dark 2 = light 3 = contrast
 */

var activeTheme = localStorage.getItem('activeTheme');
changeTheme(activeTheme);

/* Sets up the 2 synths that are used for the instruments,
  default set to piano on page load
 */

var synth = new tone.PolySynth({
  polyphony: 4,
  voice: tone.Synth,
}).toMaster();
var membrane = new tone.MembraneSynth().toMaster();

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

/**
 *  PAGE EVENTS
 */

/* Gets the targetted tile, if its transparent, set it to its
  corresponding color based on the note index, if its already
  selected, turn it back transparent
 */

grid.on('mouse:down', (e) => {
  if (e.target.get('fill') !== 'transparent') {
    e.target.set('fill', 'transparent');
  }
  else if (e.target.get('fill') === 'transparent') {
    const curNote = e.target.note.slice(0, 1);
    e.target.set('fill', colors[curNote]);
    playTone(e.target);
  }
});

$expandBars.click(() => {
  if (sidebarOpen === true) {
    closeSidebar();
  }
  else {
    openSidebar();
  }
});

/* Opens and closes the instrument list and sets its state */

$instruments.click(() => {
  if (instrumentsOpen === true) {
    $('#instrumentList').hide();
    instrumentsOpen = false;
  }
  else if (instrumentsOpen === false) {
    $('#instrumentList').show();
    instrumentsOpen = true;
  }
});

/* Gets values of BPM and Volume on mouse up, then sets
  them to Tone's transport and master channels accordingly
 */

$bpmSlider.mouseup(() => {
  tone.Transport.bpm.value = $bpmSlider.val();
});

$volSlider.mouseup(() => {
  tone.Master.volume.value = $volSlider.val();
});

/* Reset button clears all tiles on the page, requests a re-render
  and tells the transport to stop
 */

$reset.click(() => {
  grid.forEachObject((o) => {
    o.set('fill', 'transparent');
  });
  grid.renderAll();
  seq.removeAll();
  tone.Transport.stop();
  firstPlay = true;
});

/* Event for toggling the pseduo focus class on the selected instrument */

$('.dropdown-item').click((e) => {
  loadSynth(e.target);
  if (e.target !== currentSelection) {
    $(e.target).toggleClass('selectedInst');
    $(currentSelection).toggleClass('selectedInst');
  }
  else {
    $(e.target).toggleClass('selectedInst');
  }
  currentSelection = e.target;
});

/* Events for opening and closing modals based on the nav buttons */

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

/* Initializes the theme changer based on the selection */

$('.modal-button').click((e) => {
  const theme = e.target.id;
  changeTheme(theme);
});

/* Play button handels the changing of icon for the respective
  option, determines if the sequence needs to be built or not,
  and either plays the sequence, or pauses the transport
 */

$playBtn.click(() => {
  if (!isPlaying) {
    if (firstPlay) {
      buildSeq();
      firstPlay = false;
    }
    $playBtn.removeClass('fa-play');
    $playBtn.addClass('fa-pause');
    isPlaying = true;
    playSeq();
  }
  else if (isPlaying) {
    $playBtn.removeClass('fa-pause');
    $playBtn.addClass('fa-play');
    isPlaying = false;
    tone.Transport.pause();
  }
});

/* Functions for opening and closing the sidebar based on
  the event from the 'bars' icon, modifies css and shows or hides
*/

function openSidebar() {
  $('.nav-header').show();
  $('#instrumentList, .icon-after').show();
  $('#shadowSideBar, #sideBar').css('width', '270px');
  $('.nav-icon').css('padding', '10px 0 10px 28px');
  sidebarOpen = true;
}

function closeSidebar() {
  $('.nav-header:not(#naming)').hide();
  $('#instrumentList, .icon-after').hide();
  $('.nav-icon').css('padding', '20px 0 20px 28px');
  $('#shadowSideBar, #sideBar').css('width', '80px');
  sidebarOpen = false;
}

/* Theme changer takes in a theme parameter from when its called
  and determines which theme it needs to load. Classes are set up
  based on inheritance so the theme colors cascade downwards on change
 */

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

/* Function for drawing the grid, takes in 2 parameters from the
  height and width of the container as determined on load. Loops
  through starting by creating columns vertically until it hits
  the edge of the screen. Every loop creates a Fabric rectangle
  with the options specified, and sets their note and pitch data
  accordingly based on position of the tile, then appends to the
  canvas.
 */

function drawGrid(tH, tW) {
  let ii = 1;
  for (var w = 0; w < $mainDiv.width(); w += tW) {
    let i = 0;
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
      /* add the tile & data to the grid */
      grid.add(tile);
      i++;
    }
    ii++;
  }
}

/* Function that loads the synth, takes 1 parameter that is the
  selected synth element when its called. Based on the 4 cases,
  determines which options to give the synth for the different
  sounds. Sets the global to which instrument is currently selected.
 */

function loadSynth(selected) {
  if (selected.innerHTML === 'PIANO') {
    synth.set({
      'oscillator': {
        'type': 'sine',
        'modulationFrequency': 0.2,
        'harmonicity': 1.0,
      },
      'envelope': {
        'attack': 0.01,
        'decay': 0.7,
        'sustain': 0.14,
        'release': 1.2,
      },
      'volume': -5,
    });
    selectedInst = 'piano';
  }
  else if (selected.innerHTML === 'SYNTH') {
    synth.set({
      'oscillator': {
        'type': 'fatsawtooth',
        'spread': 30,
        'count': 3,
      },
      'envelope': {
        'attack': 0.01,
        'decay': 0.1,
        'sustain': 0.5,
        'release': 0.4,
        'attackCurve': 'exponential',
      },
      'volume': -8,
    });
    selectedInst = 'synth';
  }
  else if (selected.innerHTML === 'XYLOPHONE') {
    synth.set({
      'oscillator': {
        'type': 'sine',
      },
      'envelope': {
        'attack': 0.01,
        'decay': 0.1,
        'sustain': 0.1,
        'release': 0.8,
      },
      'volume': -5,
    });
    selectedInst = 'xylophone';
  }
  else if (selected.innerHTML === 'PERCUSSION') {
    membrane.set({
      'pitchDecay': 0.01,
      'octaves': 2,
      'oscillator': {
        'frequency': 440,
        'type': 'fmsine',
        'modulationIndex': 0.1,
        'modulationType': 'sawtooth',
        'harmonicity': 0.44,
      },
      'envelope': {
        'attack': 0.0006,
        'decay': 0.25,
        'sustain': 0,
        'release': 1.4,
        'attackCurve': 'exponential',
        'decayCurve': 'exponential',
        'releaseCurve': 'exponential',
      }
    });
    selectedInst = 'percussion';
  }
}

/* Function that plays the sound of the note the user is places
  when it is clicked on the screen, determines which synth to use
  based on the currently selected instrument. Triggers notes for
  a duration of an 8th note.
 */

function playTone(tile, time) {
  const curNote = tile.note.slice(0, 1);
  const curPitch = parseInt(tile.pitch) + 2;
  if (selectedInst !== 'percussion') {
    synth.triggerAttackRelease(`${curNote}${curPitch}`, '8n', time);
  }
  else if (selectedInst === 'percussion') {
    membrane.triggerAttackRelease(`${curNote}${curPitch}`, '8n', time);
  }
}

/* noteObj is the static data structure being used to place all
  the notes in the sequence based on their time and how many are
  selected in the same measure.
 */

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

/* Function that builds the note sequence */

function buildSeq() {
  /* Variable declarations */
  let colArr = [];
  let colNum = 0;
  let emptyNum = 0;
  let objNum = 0;
  /* Load all the tile objects from the canvas */
  const tiles = grid._objects;
  /* Loop through every tile (224 total) if the tile has
    a fill, get its note, and pitch, then push it to the
    temp array. If no fill, increment the empty variable.
  */
  for (let i = 0; i < 224; i++) {
    if (tiles[i].fill !== 'transparent') {
      const curNote = tiles[i].note.slice(0, 1);
      const curPitch = parseInt(tiles[i].pitch) + 2;
      colArr.push(`${curNote}${curPitch}`);
    }
    else if (tiles[i].fill === 'transparent') {
      emptyNum += 1;
    }
    /* Incrememnt the column variable once it goes through */
    colNum += 1;
    /* Once it reaches the end of a column, determines if
      the whole column is empty, if it is, then set a blank
      note that will be read as a 'rest'
    */
    if (colNum === 14 && emptyNum === 14) {
      objNum += 1;
      emptyNum = 0;
      colNum = 0;
      colArr = [];
    }
    /* If it is not empty then set all the nots in the column
      to the noteObj based on the position of the loop and using
      the objNum increment variable.
     */
    else if (colNum === 14 && emptyNum !== 14) {
      noteObj[objNum].note = colArr;
      objNum += 1;
      emptyNum = 0;
      colNum = 0;
      colArr = [];
    }
  }
  /* Creates the Tone sequence, takes in the time global from Transport
    and the value is the iterated item from the noteObj that is provided.
    Determines which synth to use based on the currently selected instrument.
    Each note is played as a 4th note.
   */
  seq = new tone.Sequence((time, value) => {
    if (selectedInst !== 'percussion') {
      synth.triggerAttackRelease(value.note, '4n', time);
    }
    else if (selectedInst === 'percussion') {
      membrane.triggerAttackRelease(value.note.pop(), '4n', time);
    }
  }, noteObj);
}

/* Function that starts the transport and starts the sequence at the beginning */

function playSeq() {
  tone.Transport.start();
  seq.start(0);
}
