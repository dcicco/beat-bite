import $ from 'jquery';
import tone from 'tone';

$(document).ready(() => {
  console.log('ready');
  var sidebarOpen = true;
  var $expandBars = $('.bars');
  var $sideBar = $('#sideBar');
  var $navItems = $('#navItems');
  var mainDiv = $('#mainContainer');

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
    $('.nav-header').hide();
    $('.nav-icon').css('padding', '20px 0 20px 28px');
    $('#shadowSideBar, #sideBar').css('width', '80px');
    sidebarOpen = false;
  }
});
