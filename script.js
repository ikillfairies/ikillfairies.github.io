var bgDelay = 600;          // Transition delay between pages in miliseconds
var textDelay = 275;        // Transition delay for text (should be < bgDelay / 2 for full fade out and fade in)
var scrollMultiplier = 1.8; // Multiplier for how much scroll height each bg div gets
var locked = false;         // Page Transition lock
var currentPage;            // Page you're currently on
var pageType;               // Current page type. Either 'travel' or 'normal'

/* ------------------------------------------------------------------------------------------------------------------ */
/* Initial stuff set at the first (and only true) page load --------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------ */

/* Fix the shitty scroll jumping issue on IE and Edge (kinda) */
$(document).ready(function() {
  if(navigator.userAgent.match(/Trident\/7\./) || navigator.userAgent.match(/Edge\/13\./)) {
    $('body').on("mousewheel", function () { // Note this doesn't fix touchpad scroll for IE Edge but screw Edge users
      event.preventDefault(); 
      window.scrollTo(0, window.pageYOffset - event.wheelDelta);
    });
  }
});

/* On popstate (back and forward buttons) call an instant page switch */
$(window).bind('popstate', function() {                     // Executed on browser back button press
  var page = location.pathname.split('/')[1].split('.')[0]; // Some string manipulation crap to get new page name
  if (page == '' || page == 'index') fastNavLink('home');
  else if (page == 'midwest') fastTravelTo(page);
  else fastNavLink(page);
});

/* If a user refresh, force them to top of page (unfortunately also called when leaving the page) */
$(window).on('beforeunload', function() { $(window).scrollTop(0); });

/* Initial load called from body of HTML */
function initialLoad(page, pageType) {
  setButtonHover();                           // Set mouseover and mouseout for travel buttons
  $('#bgBot').animate({opacity: 1}, bgDelay); // Fade in the background
  if (pageType == 'normal') {
    setNavBar(page);
    navLink(page);                            // The part where you actually load the page lol
  }
  else if (pageType == 'travel') {
    setNavBar('travel');
    travelTo(page, false);
  }
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Page Transition Links -------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------ */

/* Called by navBar navButtons to transition to a normal page */
function navLink(page) {
  if (locked) return;                    // If locked, no navBar transition is allowed
  locked = true;                         // If not locked, lock
  currentPage = page;                    // Update global page variable to whatever the new page is
  if (pageType == 'travel') {
    $('.button.active').stop().animate({ // Fade out the active button
      color: '#CFD8DC', backgroundColor: 'rgba(80, 85, 90, 0.2)'}, textDelay).removeClass('active');
    setButtonHover();                    // Re-enable hover effects for travel buttons
    setTimeout(function() { $('body').css({'overflow-y': '', 'height': '100%'}); }, textDelay);
    if (scrollPosition >= 1000) {
      $('#overlay, .bgTransition').css({'position': 'fixed', 'top': '-100%'}).animate({top: '0px'}, textDelay);
    }
    else if (scrollPosition < 1000) {
      $('html, body').animate({scrollTop: 0}, textDelay);
      setTimeout(function() { 
        $('#divStack').css({'display': 'none'});
        setContent(page, true); 
        setBG(getRandomBG(page));
      }, textDelay);
    }
    setTimeout(function() {
      $('#overlay, .bgTransition').css({'position':' absolute', 'top': ''});
      $('body').css({'overflow-y': '', 'height': '100%'});
    }, bgDelay); 
  }
  else {
    setContent(page, true);
    setBG(getRandomBG(page));
  }
  toggleTravelBar(page);       // Set travelBar visibility depending on page being loaded
  $('.navButton').unbind();    // Disable hover effects for navBar during page transition
  if (page != $('.navButton.active').prop('id')) {                                // No animate if already active
    $('.navButton.active').stop().animate({color: '#CFD8DC'}, bgDelay);           // Fade out current active link
    $('#' + page).css({'color': '#DFCDAC'}).animate({color: '#FFB74D'}, bgDelay); // Fade in new active link
  }
  setTimeout(function() { setNavBar(page); }, bgDelay);                           // Re-enable hover effects for navBar
  if (page == 'home') window.history.pushState({urlPath: '/index.html'}, '', '/index.html'); // Index shit
  else window.history.pushState({urlPath: '/' + page}, '', '/' + page + '.html');            // Other pages
  setTimeout(function() { locked = false; }, bgDelay); // Release lock after page transition
}

/* Called by travelBar buttons to transition to a travel page */
function travelTo(page, backPressed, switchPage) {
  if (locked || currentPage == page) return;
  locked = true;
  currentPage = page;           // Update global page variable to whatever the new page is
  pageType = 'travel';
  toggleTravelBar(page);        // Set travelBar visibility depending on page being loaded
  setBG(page + '/bg0.jpg');     // Set the new background
  $('.button').unbind();        // No mouseover effects on the buttons while transitioning pages
  $('.button.active').animate({ // Fade out old active button
    color: '#CFD8DC', backgroundColor: 'rgba(80, 85, 90, 0.2)'}, bgDelay).removeClass('active');
  $('#' + page).animate({       // Fade in new active button
    color: '#FFB74D', backgroundColor: 'rgba(35, 35, 35, 0.9)'}, bgDelay).addClass('active');
  setTravelContent(page, switchPage);
  if (backPressed != true) window.history.pushState({urlPath: '/' + page}, '', '/' + page + '.html');
  setTimeout(function() { 
    setTravelBar(page); 
    setTimeout(function() { locked = false; }, bgDelay); // Release lock after page transition
  }, bgDelay);
}

/* Instant page transition to a normal page, called by back/forward browser buttons */
function fastNavLink(page) {
  currentPage = page;
  pageType = 'normal';
  $('#content').html('');
  var bgImg = getRandomBG(page);
  $('#bgTop, #bgBot').css({'background-image': 'url(' + bgImg + ')'});
  $('#content').load(page + 'Content');
  $('body').css({'height': '100%'});
  toggleTravelBar(page);
  setTravelBar(page);     
  setNavBar(page);
}

/* Instant page transition to a travel pgae, called by back/forward browser buttons */
function fastTravelTo(page) {
  currentPage = page;
  pageType = 'travel';
  $('#content').html('');
  $('#bgtop, #bgBot').css({'background-image': 'url(' + page + '/bg0.jpg)'});
  $('#content').load(page + 'Content');
  toggleTravelBar('travel');
  setTravelBar(page);
  setNavBar('travel');
  setTimeout(function() {
    numDivs = $('.bg').length - 1;
    $('body').height(String((scrollMultiplier * numDivs + 1) * 100 - 1) + 'vh');
    $('#bg1').css({'opacity': '0'});
    $('#bg1').css('background', 'url(./' + page + '/bg1.jpg) no-repeat center center').css('background-size', 'cover');
    $('#divStack').css({'display': 'block'});
  }, textDelay);
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Background and text content transition helper functions ---------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------ */

/* Function to fade from one background image to another during page transitions */
function setBG(bgImg) {
  var $bgTop = $('#bgTop');
  var $bgBot = $('#bgBot');
  $bgBot.css({'background-image': 'url(' + bgImg + ')'});
  $bgTop.stop().animate({opacity: 0}, bgDelay);
  setTimeout(function() { $bgTop.css({'background-image': $bgBot.css('background-image')})}, bgDelay);
  setTimeout(function() { $bgTop.css({'opacity': 1}) }, bgDelay + 50); 
}

/* BG generator for each page (returns 'bgN.jpg') */
function getRandomBG(page) {
  if (page == 'home') return page + '/bg' + String(Math.floor(1 + Math.random() * 5)) + '.jpg';          // 5 BG images
  else if (page == 'travel') return page + '/bg' + String(Math.floor(1 + Math.random() * 6)) + '.jpg';   // 6 BG images
  else if (page == 'projects') return page + '/bg' + String(Math.floor(1 + Math.random() * 3)) + '.jpg'; // 3 BG images
  else if (page == 'contact') return page + '/bg' + String(Math.floor(1 + Math.random() * 2)) + '.jpg';  // 2 BG images
}

/* Set content on a normal page during transition */
function setContent(page, switchPage) {
  var $content = $('#content');
  var $tempDiv = $('<div>');        // Create temporary div stored in memory
  $tempDiv.load(page + 'Content');  // Load new content into $tempDiv first b/c ajax load is laggy/slow
  if (switchPage == true) $content.stop().animate({opacity: 0}, textDelay); // Fade out current content
  setTimeout(function() { $content.html($tempDiv.html()).stop().animate({opacity: 1}, textDelay + 50) }, textDelay - 50);
}   

/* Set content on a travel page during transition */
function setTravelContent(page, switchPage) {
  setContent(page, switchPage);    // Load the HTML with ajax
  setTimeout(function() {
    numDivs = $('.bg').length - 1; // Get # of bgDivs to set body height
    $('body').height(String((scrollMultiplier * numDivs + 1) * 100 - 1) + 'vh');
  }, textDelay);
  setTimeout(function() { 
    $('#divStack').css({'display': 'block'}); 
    var $bg1 = $('#bg1');
    $bg1.css({'opacity': '0'});
    $bg1.css('background', 'url(./' + page + '/bg1.jpg) no-repeat center center').css('background-size', 'cover');
  }, textDelay + 50);
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Button animation and visibility related -------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------ */
// soooo i think i need to somehow consolidate setButtonhover, toggleTravelBar, and setTravelBar into setTravelBar, this shit is retarded
/* Enable the mouseover and mouseout hover effect for the travelBar buttons */
function setButtonHover() {
  $('.button').mouseover(function() {
    $(this).stop().animate({color: '#DFCDAC', backgroundColor: 'rgba(40, 40, 40, 0.7)'}, 150)});
  $('.button').mouseout(function() {
    $(this).stop().animate({color: '#CFD8DC', backgroundColor: 'rgba(80, 85, 90, 0.2)'}, 400)});
}

/* Display travelBar if currentPage is travel, or if pageType is travel */
function toggleTravelBar() {
  var $travelBar = $('#travelBar');
  if (currentPage == 'travel' || pageType == 'travel') {
    $travelBar.css({'display': 'block'}).animate({opacity: 1}, textDelay);
  }     
  else {
    $travelBar.animate({opacity: 0}, textDelay);
    setTimeout(function() { $travelBar.css({'display': 'none'}); }, textDelay);
  }
}

/* Sets an active navButton and resets the others */
function setNavBar(page) {
  $('.navButton').mouseover(function() { $(this).stop().animate({color: '#DFCDAC'}, 150); });
  $('.navButton').mouseout(function() { $(this).stop().animate({color: '#CFD8DC'}, 300); });
  $('.navButton.active').css({'color': '#CFD8DC'}).removeClass('active');
  $('#' + page).addClass('active').unbind().css({'color': '#FFB74D'});
  $('.navButton:not(.active)').css({'color': '#CFD8DC', 'cursor': 'pointer'});
}

/* Sets an active button and resets the others */
function setTravelBar(page) {
  $('.button').mouseover(function() {
    $(this).stop().animate({color: '#DFCDAC', backgroundColor: 'rgba(40, 40, 40, 0.7)'}, 150)});
  $('.button').mouseout(function() {
    $(this).stop().animate({color: '#CFD8DC', backgroundColor: 'rgba(80, 85, 90, 0.2)'}, 400)});
  $('.button.active').css({'color': '#CFD8DC', 'background-color': 'rgba(80, 85, 90, 0.2)'}).removeClass('active');
  $('#' + page).addClass('active').unbind().css({'color': '#FFB74D', 'background-color': 'rgba(35, 35, 35, 0.9)'});
  $('.button:not(.active').css({'color': '#CFD8DC', 'background-color': 'rgba(80, 85, 90, 0.2)'});
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Travel page scroll effect ---------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------ */

/* Global variables for travel pages */
var scrollPosition = 0;     // $(window).scrollTop() initialized to 0 (scrollbar at top of page)
var windowHeight;           // $(window).height()
var lowerBound;             // Lower bound of transition range
var upperBound;             // Upper bound of transition range...
var divIndex = 0;           // Starts at 0 always because I'm forcing scrollTop(0) on refresh
var numDivs;

/* Need to account for the change in scrollbar position on window resize */
$(window).resize(function() { 
  setOpacity();
  setText();
});

/* Set the opacity whenever scrollbar location changes */
$(window).scroll(function() { 
  setOpacity(); 
  setText();
});

/* Fade effect between backgrounds */
function setOpacity() {
  setVariables(); 
  var $currentBG = $('#bg' + (divIndex)); // String + Int lol.
  var $belowBG = $('#bg' + (divIndex + 1));
  var $2xbelowBG = $('#bg' + (divIndex + 2));
  if ($currentBG.css('background-size') == 'auto') $currentBG.css({
    'background': 'url(./' + currentPage + '/bg' + String(divIndex) + '.jpg) no-repeat center center', 
    'background-size': 'cover',
  });
  if ($belowBG.css('background-size') == 'auto') $belowBG.css({
    'background': 'url(./' + currentPage + '/bg' + String(divIndex + 1) + '.jpg) no-repeat center center', 
    'background-size': 'cover',
  });
  if ($2xbelowBG.css('background-size') == 'auto' && divIndex + 2 <= numDivs) $2xbelowBG.css({
    'background': 'url(./' + currentPage + '/bg' + String(divIndex + 2) + '.jpg) no-repeat center center', 
    'background-size': 'cover',
  });
  /* For loop probably bad performance wise but only way I can think of to get around super fast scrolling edge case
     which happens if user grabs the scrollbar and drags it to the bottom of the screen too fast, things won't load
     Also need to set z-index b/c it will be out of order if user scrolls too quickly. I really hate this edge case. */
  for (var i = 0; i <= numDivs; i++) {
    if (i < divIndex) $('#bg' + String(i)).css({'opacity': '0', 'display': 'none', 'z-index': -i});
    else if (i == divIndex + 1) $('#bg' + String(i)).css({'opacity': '1', 'display': 'block', 'z-index': -i});
    else if (i > divIndex + 1) $('#bg' + String(i)).css({'opacity': '1', 'display': 'none', 'z-index': -i});
  }
  /* If (in bounds of transition range && not the last div), calculate the opacity, if not leave it as 1 */
  if (scrollPosition >= lowerBound && scrollPosition <= upperBound && divIndex != numDivs) 
    $currentBG.css({'opacity': 1 - (scrollPosition - lowerBound) / (upperBound - lowerBound), 'display': 'block'});
  else $currentBG.css({'opacity': '0', 'display': 'block'});
}

/* Set global variables here to keep setOpacity shorter (Note: these are globally declared) */
function setVariables() {
  scrollPosition = $(window).scrollTop();
  windowHeight = $(window).height();
  divIndex = Math.floor(scrollPosition / (windowHeight * scrollMultiplier)); 
  lowerBound = divIndex * windowHeight * scrollMultiplier;
  upperBound = lowerBound + windowHeight;
}

function setText() {
  if (scrollPosition < windowHeight) return $('#textBar').hide();
  else if (scrollPosition >= windowHeight) $('#textBar').show();
  var textIndex = Math.floor((scrollPosition / (windowHeight * scrollMultiplier) - 0.3));
  $('#imageTitle').load(currentPage + '/text' + String(textIndex));
}
