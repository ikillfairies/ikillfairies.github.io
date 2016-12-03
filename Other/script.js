$(document).ready(function() {
  $('.navButton').mouseover(function() { 
    $(this).stop().animate({color: '#F5F5F5'}, 150); });
  $('.navButton').mouseout(function() { 
    $(this).stop().animate({color: '#B0B0B0'}, 300); });

});