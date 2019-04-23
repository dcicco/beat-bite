import $ from 'jquery';
import tone from 'tone';
import fabric from 'fabric';

$(document).ready(() => {
  console.log('ready');
  tone.Transport.start();
  var sidebarOpen = true;
  var $expandBars = $('.bars');
  var $sideBar = $('#sideBar');
  var $navItems = $('#navItems');
  var $mainDiv = $('#mainContainer');
  var $settingsNav = $('.nav-hover:eq(2)');
  var $aboutNav = $('.nav-hover:eq(3)');
  var $closeSettings = $('#closeSettings');
  var $closeAbout = $('#closeAbout');
  var $canvas = $('#canvas');
  var $playBtn = $('#playBtn');

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

  // 1 = dark; 2 = light; 3 = contrast;
  var activeTheme = localStorage.getItem('activeTheme');
  changeTheme(activeTheme);

  var synth = new tone.Synth({
    'oscillator': {
      'type': 'sine',
      'modulationFrequency': 0.2
    },
    'envelope': {
      'attack': 0.01,
      'decay': 0.7,
      'sustain': 0.14,
      'release': 1.2,
    },
    'volume': -5,
  }).toMaster();

  $canvas.attr({
    width: $mainDiv.width(),
    height: $mainDiv.height(),
  });

  var tileW = $mainDiv.width() / 16;
  var tileH = $mainDiv.height() / 14;

  var rectOpt = {
    fill: 'transparent',
    stroke: 'white',
    strokeWidth: 1,
    selectable: false,
  }

  var grid = new fabric.Canvas('canvas');

  drawGrid(tileH, tileW);

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

  function openSidebar() {
    $('.nav-header').show();
    $('#shadowSideBar, #sideBar').css('width', '270px');
    $('.nav-icon').css('padding', '10px 0 10px 28px');
    sidebarOpen = true;
  }

  function closeSidebar() {
    $('.nav-header:not(#naming)').hide();
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
      localStorage.setItem('activeTheme', '1')
    }
    else if (theme === 'lightTheme' || theme === '2') {
      $('.t-dark').each((i, obj) => {
        $(obj).removeClass('t-dark');
        $(obj).addClass('t-light');
      });
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
    var i = 0;
    for (var h = 0; h < $mainDiv.height(); h += tH) {
      var ii = 1;
      for (var w = 0; w < $mainDiv.width(); w += tW) {
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
        ii++;
      }
      i++;
    }
  }

  function playTone(tile, time) {
    const curNote = tile.note.slice(0, 1);
    const curPitch = parseInt(tile.pitch) + 2;
    synth.triggerAttackRelease(`${curNote}${curPitch}`, '8n', time);
  }

  function playSeq() {
    var noteArr = [];
    var sortedArr = [];
    grid.forEachObject((tile) => {
      if (tile.get('fill') !== 'transparent') {
        const curNote = tile.note.slice(0, 1);
        const curPitch = parseInt(tile.pitch) + 2;
        noteArr.unshift(`${curNote}${curPitch}`);
      }
    });
    console.log(noteArr);
    var seq = new tone.Sequence((time, note) => {
      synth.triggerAttackRelease(note, '4n');
    }, noteArr, '4n');
    seq.start();
  }

  $playBtn.click(() => {
    playSeq();
  });
});
