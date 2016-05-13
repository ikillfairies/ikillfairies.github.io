/* Variable declaration (obviously) */
var scrollMultiplier = 1.8;
/* Declared in calculated or from HTML */
var page;
var numDivs;
var windowHeight;
/* Global variables declared for setVariables and setOpacity */
var scrollPosition;
var windowHeight;
var divIndex = 0; // Starts at 0 always because I'm forcing scrollTop(0) on refresh
var textIndex = 0;
var lowerBound;
var upperBound;
var inBounds;
/* That arrow shit */
var navBarVisible = 1; // 1 for visible, -1 for invisible
/* Start at the top of the page even if refreshed */
$(window).on('beforeunload', function() { $(window).scrollTop(0); });

/* ---------------------------------------------------------------------------------- */
/* ---------------------------- On document ready stuff ----------------------------- */
/* ---------------------------------------------------------------------------------- */
$(document).ready(function() {
  /* Fade stuff in */
  $("#bg0").animate({opacity: "1"}, {duration: 350});
  $("h1").delay(250).animate({opacity: "1"},{duration: 350});
  $("h4").delay(250).animate({opacity: "1"},{duration: 350});
  $("#divStack").delay(350).animate({opacity: "1"}, {duration: 0});
  /* Hover functions */
  $(".navButton").mouseover(function() { $(this).stop().animate({color: "#DFCDAC"}, 150); });
  $(".navButton").mouseout(function() { $(this).stop().animate({color: "#CFD8DC"}, 250); });
  $(".button").mouseover(function() { $(this).stop().animate({color: "#DFCDAC", backgroundColor: "rgba(50, 50, 50, 0.6)"}, 150) });
  $(".button").mouseout(function() { $(this).stop().animate({color: "#CFD8DC", backgroundColor: "rgba(80, 85, 90, 0.2)"}, 400) });
  $("#expandNavBar").mouseover(function() { $("#rightArrowOuter").stop().animate({borderLeftColor: "#FFCC80"}, 250) });
  $("#expandNavBar").mouseout(function() { $("#rightArrowOuter").stop().animate({borderLeftColor: "#CFD8DC"}, 300) });
});

/* ---------------------------------------------------------------------------------- */
/* ------------------------- On page load called from body -------------------------- */
/* ---------------------------------------------------------------------------------- */
function loadPage(pageHTML, numDivsHTML) {
  /* Set global variables and height of the page */
  page = pageHTML;
  numDivs = numDivsHTML;
  windowHeight = (scrollMultiplier * numDivs + 1) * 100 - 1;
  $("body").height(String(windowHeight) + "vh");
  /*Assign active pages on load */
  $("#travel").addClass("active").unbind();
  $("#" + page).addClass("active").unbind();
  /* Load top two backgrounds */
  $("#bg0").css("background", "url(./" + page + "/bg0.jpg) no-repeat center center");
  $("#bg0").css("background-size", "cover");
  $("#bg1").css("background", "url(./" + page + "/bg1.jpg) no-repeat center center");
  $("#bg1").css("background-size", "cover");
}

/* ---------------------------------------------------------------------------------- */
/* ------------------------------- Scroll fade effect ------------------------------- */
/* ---------------------------------------------------------------------------------- */
/* Need to account for the change in scrollbar position on window resize */
$(window).resize(function() { 
  setOpacity();
  setText();
  if (navBarVisible == 1 && scrollPosition > 0) hideNavBar();
  else if (navBarVisible == -1 && scrollPosition == 0) showNavBar();
});

/* Set the opacity whenever scrollbar location changes */
$(window).scroll(function() { 
  setOpacity(); 
  setText();
  if (navBarVisible == 1 && scrollPosition > 0) hideNavBar();
  else if (navBarVisible == -1 && scrollPosition == 0) showNavBar();
});

function setOpacity() {
  /* Set scrollPosition, windowHeight, divIndex, lowerBound, upperBound, and inBounds */
  setVariables(); 
  /* Declare variables to make this shit slightly faster */
  var $currentBG = $("#bg" + (divIndex)); // String + Int lol.
  var $belowBG = $("#bg" + (divIndex + 1));
  var $2xbelowBG = $("#bg" + (divIndex + 2));
  /* Ensure current and below BG's are loaded even if they scroll super fast (but only if hasn't been loaded yet) */
  if ($currentBG.css("background-size") == "auto") $currentBG.css({
    "background": "url(./" + page + "/bg" + String(divIndex) + ".jpg) no-repeat center center", 
    "background-size": "cover",
  });
  if ($belowBG.css("background-size") == "auto") $belowBG.css({
    "background": "url(./" + page + "/bg" + String(divIndex + 1) + ".jpg) no-repeat center center", 
    "background-size": "cover",
  });
  if ($2xbelowBG.css("background-size") == "auto") $2xbelowBG.css({
    "background": "url(./" + page + "/bg" + String(divIndex + 2) + ".jpg) no-repeat center center", 
    "background-size": "cover",
  });
  /* For loop probably bad performance wise but only way I can think of to get around super fast scrolling problem   */
  /* which happens if user grabs the scrollbar and drags it to the bottom of the screen too fast, things won't load  */
  /* Also need to set z-index b/c it will be out of order if user scrolls too quickly. I really hate this edge case. */
  for (var i = 0; i <= numDivs; i++) {
    if (i < divIndex) $("#bg" + String(i)).css({"opacity": "0", "display": "none", "z-index": -i});
    else if (i == divIndex + 1) $("#bg" + String(i)).css({"opacity": "1", "display": "block", "z-index": -i});
    else if (i > divIndex + 1) $("#bg" + String(i)).css({"opacity": "1", "display": "none", "z-index": -i});
  }
  /* If (in bounds of transition range && not the last div), calculate the opacity, if not leave it as 1 */
  if (inBounds) $currentBG.css({"opacity": 1 - (scrollPosition - lowerBound) / (upperBound - lowerBound), "display": "block"});
  else $currentBG.css({"opacity": "0", "display": "block"});
}

/* Set variables here to keep setOpacity shorter (Note: these are globally declared) */
function setVariables() {
  scrollPosition = $(window).scrollTop();
  windowHeight = $(window).height();
  divIndex = Math.floor(scrollPosition / (windowHeight * scrollMultiplier));
  textIndex = Math.floor( (scrollPosition / (windowHeight * scrollMultiplier)) + 0.4 )
  lowerBound = divIndex * windowHeight * scrollMultiplier;
  upperBound = lowerBound + windowHeight;
  inBounds = (scrollPosition >= lowerBound && scrollPosition <= upperBound && divIndex != numDivs);
}

function setText() {
  if (scrollPosition < windowHeight) $("#textBar").hide();
  else if (scrollPosition >= windowHeight) $("#textBar").show();
  setVariables();
  $("#imageTitle").load(page + "/text" + String(divIndex));
}

function hideNavBar() {
  $("#navBar").stop().animate({width: "48px", backgroundColor: "rgba(30, 35, 40, 1)"}, 300);
  $(".navButton").stop().hide(300);
  navBarVisible = navBarVisible * -1;
  $("#expandNavBar").stop().delay(75).animate({"opacity": 1}, 200);
}

function showNavBar() {
  $("#navBar").stop().animate({width: "100%", backgroundColor: "rgba(50, 50, 50, 0.8)"}, 300);
  $(".navButton").stop().show(300);
  navBarVisible = navBarVisible * -1; 
  $("#expandNavBar").stop().animate({"opacity": 0}, 200);
}

/* ---------------------------------------------------------------------------------- */
/* ----------------------------- Other/helper functions ----------------------------- */
/* ---------------------------------------------------------------------------------- */
function navLink(page) {
  $(".navButton").unbind();
  $(".navButton.active").animate({color: "#CFD8DC"}, 300);
  $("#" + page).css({"color": "#DFCDAC"});
  $("#" + page).animate({color: "#FFB74D"}, 300);
  $("#text0").animate({opacity: "0"}, {duration: 200});
  $("#fadeOut").animate({opacity: "1"}, {duration: 300});
  setTimeout('window.open("../' + page + '.html", "_self")', 300);
}

function travelLink(page) {
  $(".button").unbind();
  $("#divStack").hide();
  $("#" + page).css({"color": "#DFCDAC", backgroundColor: "rgba(50, 50, 50, 0.6)"});
  $("#" + page).animate({color: "#FFB74D", backgroundColor: "rgba(50, 50, 50, 0.8)"}, 300);
  $("#bg0").animate({opacity: "0.1"},{duration: 300});
  $("h1").animate({opacity: "0"},{duration: 300});
  $("h4").animate({opacity: "0"},{duration: 300});
  setTimeout('window.open("' + page + '.html", "_self")', 300);
}