import $ from 'jquery';
import tone from 'tone';

$(document).ready(() => {
  console.log('ready');
  var sidebarOpen = true;
  // var activeTheme; // 1 = dark; 2 = light; 3 = contrast;
  var $expandBars = $('.bars');
  var $sideBar = $('#sideBar');
  var $navItems = $('#navItems');
  var mainDiv = $('#mainContainer');
  var $settingsNav = $('.nav-hover:eq(2)');
  var $closeSettings = $('#closeSettings');

  var activeTheme = localStorage.getItem('activeTheme');
  changeTheme(activeTheme);

  // buildChart(mainDiv.css('height'), mainDiv.css('width'));
  //
  // function buildChart(heightPX, widthPX) {
  //   var height = heightPX.replace('px', '');
  //   var width = widthPX.replace('px', '');
  // }

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
});
