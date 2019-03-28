import $ from 'jquery';
import tone from 'tone';

$(document).ready(() => {
  console.log('ready');
  var $expandBars = $('.bars');
  var $sideBar = $('#sideBar');
  var $navItems = $('#navItems');
  console.log($('#saved').attr('opened'));

  $expandBars.click(() => {
    $('.nav-header').text('');
    $('.nav-header').css('visibility', 'hidden');
    $('#settings, #about').addClass('icon-after');
    $sideBar.css('width', '80px');
    $('#shadowSideBar').css('width', '80px');

  });
});
