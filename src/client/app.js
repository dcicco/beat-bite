import $ from 'jquery';
import tone from 'tone';
import fabric from 'fabric';

$(document).ready(() => {
  console.log('ready');
  var sidebarOpen = true;
  // var activeTheme; // 1 = dark; 2 = light; 3 = contrast;
  var $expandBars = $('.bars');
  var $sideBar = $('#sideBar');
  var $navItems = $('#navItems');
  var $mainDiv = $('#mainContainer');
  var $settingsNav = $('.nav-hover:eq(2)');
  var $aboutNav = $('.nav-hover:eq(3)');
  var $closeSettings = $('#closeSettings');
  var $closeAbout = $('#closeAbout');
  var $canvas = $('#canvas');

  var colors = {

  };

  var activeTheme = localStorage.getItem('activeTheme');
  changeTheme(activeTheme);

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

  grid.forEachObject((obj) => {
    console.log(obj.note);
  });

  grid.on('mouse:down', (e) => {
    e.target.set('fill', 'red');
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
    console.log(e.target.id);
    let theme = e.target.id;
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
    for (var h = 0; h < $mainDiv.height(); h += tH) {
      for (var w = 0; w < $mainDiv.width(); w += tW) {
        var tile = new fabric.Rect({
          ...rectOpt,
          width: tW,
          height: tH,
          top: h,
          left: w,
          note: 'asdf',
        });
        grid.add(tile);
      }
    }
  }
});
