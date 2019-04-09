import $ from 'jquery';
import tone from 'tone';

$(document).ready(() => {
  console.log('ready');
  var sidebarOpen = true;
  var activeTheme = 1; // 1 = dark; 2 = light; 3 = contrast;
  var $expandBars = $('.bars');
  var $sideBar = $('#sideBar');
  var $navItems = $('#navItems');
  var mainDiv = $('#mainContainer');
  var $settingsNav = $('.nav-hover:eq(2)');
  var $closeSettings = $('#closeSettings');

  buildChart(mainDiv.css('height'), mainDiv.css('width'));

  function buildChart(heightPX, widthPX) {
    var height = heightPX.replace('px', '');
    var width = widthPX.replace('px', '');
  }

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
    $('.modal').show();
  });

  $(window).click((e) => {
    if (e.target.className === 'modal') {
      $('.modal').hide();
    }
  });

  $closeSettings.click(() => {
    $('.modal').hide();
  });

  $('.modal-button').click((e) => {
    console.log(e.target.id);
    let theme = e.target.id;
    changeTheme(theme);
  });

  function changeTheme(theme) {
    if (theme === 'darkTheme') {
      activeTheme = 1;
    }
    if (theme === 'lightTheme') {
      activeTheme = 2;
    }
    if (theme === 'conTheme') {
      activeTheme = 3;
    }
    else {
      activeTheme = 1;
    }
  }
});
