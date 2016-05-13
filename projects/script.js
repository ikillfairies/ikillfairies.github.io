/*************************************************************************************/
/****************************** On document ready stuff ******************************/
/*************************************************************************************/
$(document).ready(function() {
  /* Fade stuff in */
  $("#background").animate({opacity: "1"}, {duration: 250})
  $("#main").animate({opacity: "1"}, {duration: 250})
  /* Hover functions for the footer */
  $("a").hover(function() { $(this).stop().animate({color: "#90CAF9"}, 200); }, function() { $(this).stop().animate({color: "#CFD8DC"}, 200); })
  /* Set the active page/div on click */
  $(".navbutton").on("click", function() {
    $(this).addClass("active").siblings().removeClass("active");
  });
});

function active(id) {
  /* Pick a random background image (NOTE: I"m actually pretty sure this RNG really sucks) */
  var backgrounds = ["bg1", "bg2", "bg3"];
  var backgroundsIndex = Math.floor(Math.random() * backgrounds.length)
  $("#background").css({"background-image": "url(" + id + "/" + backgrounds[backgroundsIndex] + ".jpg)"});
  /* Assign class about as the default on page load */
  $("#" + id).addClass("active");
  $("#" + id).unbind();
}

function navLink(id) {
  $("#background").animate({opacity: "0"},{duration: 250});
  $("#main").animate({opacity: "0.2"},{duration: 250});
  setTimeout('window.open("' + id + '", "_self")', 250);
}

/*************************************************************************************/
/************************************ About stuff ************************************/
/*************************************************************************************/
function about() {
  var backgrounds = ["bg1", "bg2", "bg3"];
  var backgroundsIndex = Math.floor(Math.random() * backgrounds.length)
  alert("background-image": "url(about/" + backgrounds[backgroundsIndex] + ".jpg)");
  $("#background").css({"background-image": "url(about/" + backgrounds[backgroundsIndex] + ".jpg)"});
  /* Assign class about as the default on page load */
  $("#about").addClass("active");
  $("#about").unbind();
}

/*************************************************************************************/
/*********************************** Travel stuff ************************************/
/*************************************************************************************/

/*************************************************************************************/
/********************************** Projects stuff ***********************************/
/*************************************************************************************/

/*************************************************************************************/
/*********************************** Contact stuff ***********************************/
/*************************************************************************************/