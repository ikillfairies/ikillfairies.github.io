$(document).ready(function() {

  $('.navLink').mouseover(function() { 
    $(this).stop().animate({color: '#F5F5F5'}, 150); });
  $('.navLink').mouseout(function() { 
    $(this).stop().animate({color: '#B0B0B0'}, 300); });
  $('.active').unbind();

  $('#header').load('header');
  $('#content').load('content');

});