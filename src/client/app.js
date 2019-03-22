import $ from 'jquery';
import tone from 'tone';

$(document).ready(() => {
  console.log('ready');
  var $expandBars = $('.bars');
  var $sideBar = $('#sideBar');
  var $navItems = $('#navItems');
  $expandBars.click(() => {
    $sideBar.css('width', '80px');
    $('.nav-header').css('visibility', 'hidden');
  });
});
