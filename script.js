var bgDelay = 500;          // Transition delay between pages in miliseconds
var textDelay = 225;        // Transition delay for text (should be < bgDelay / 2 for full fade out and fade in)
var scrollMultiplier = 1.9; // Multiplier for how much scroll height each bg div gets
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
  else if (page == 'travel' || page == 'projects' || page == 'contact') fastNavLink(page);
  else fastTravelTo(page);
});

/* If a user refresh, force them to top of page (unfortunately also called when leaving the page) */
$(window).on('beforeunload', function() { $(window).scrollTop(0); });

/* Initial load called from body of HTML */
function initialLoad(page, pageType) {
  setTravelBar();                             // Set mouseover and mouseout for travel buttons
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
    setTimeout(function() { $('body').css({'overflow-y': '', 'height': '100%'}); }, textDelay);
    if (scrollPosition >= 1000) {        // Drop the overlay div down while transitioning (looks kinda cool?)
      $('#overlay, .bgTransition').css({'position': 'fixed', 'top': '-100%'}).animate({top: '0px'}, textDelay);
      setContent(page, true);
      setBG(getRandomBG(page));
    }
    else if (scrollPosition < 1000) {    // If you're near the top, just scroll to the top before transitioning
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
      setTravelBar();                    // No parameters means all buttons are reset unless pageType == travel
    }, bgDelay); 
  }
  else {
    setContent(page, true);
    setBG(getRandomBG(page));
  }
  pageType = 'normal';      // Transition is done, now set the new page type
  toggleTravelBar();        // Set travelBar visibility depending on page being loaded
  $('.navButton').unbind(); // Disable hover effects for navBar during page transition
  if (page != $('.navButton.active').prop('id')) {                                // No animate if already active
    $('.navButton.active').stop().animate({color: '#CFD8DC'}, bgDelay);           // Fade out current active link
    $('#' + page).css({'color': '#DFCDAC'}).animate({color: '#FFB74D'}, bgDelay); // Fade in new active link
  }
  setTimeout(function() { setNavBar(page); }, bgDelay);                           // Re-enable hover effects for navBar
  if (page == 'home') window.history.pushState({urlPath: '/index'}, '', '/index'); // Index shit
  else window.history.pushState({urlPath: '/' + page}, '', '/' + page + '');            // Other pages
  setTimeout(function() { locked = false; }, bgDelay); // Release lock after page transition
}

/* Called by travelBar buttons to transition to a travel page */
function travelTo(page, backPressed, switchPage) {
  if (locked || currentPage == page) return;
  locked = true;
  currentPage = page;             // Update global page variable to whatever the new page is
  pageType = 'travel';            // Fadey-transitioney scroll pages
  var scrollToTopDelay = 0;
  if (scrollPosition > 0) scrollToTopDelay = textDelay;
  $('html, body').animate({scrollTop: 0}, textDelay);
  setTimeout(function() {         // Scroll to the top of the page before page transition
    $('#divStack').css({'display': 'none'});
    toggleTravelBar();            // Set travelBar visibility depending on page being loaded
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
  }, scrollToTopDelay);
}

/* Instant page transition to a normal page, called by back/forward browser buttons */
function fastNavLink(page) {
  currentPage = page;
  pageType = 'normal';
  $('#content').html('');
  var bgImage = getRandomBG(page); // .jpg is added by getRandomBG(page)
  $('#bgTop, #bgBot').css({'background-image': 'url(' + bgImage + ')'});
  $('#content').load(page + 'Content');
  $('body').css({'height': '100%'});
  toggleTravelBar();
  setTravelBar(page);     
  setNavBar(page);
}

/* Instant page transition to a travel page, called by back/forward browser buttons */
function fastTravelTo(page) {
  currentPage = page;
  pageType = 'travel';
  $('#content').html('');
  $('#bgTop, #bgBot').css({'background-image': 'url(' + currentPage + '/bg0.jpg)'});
  $('#content').load(page + 'Content');
  toggleTravelBar();
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

/* Set content on a page during transition by doing an Ajax load */
function setContent(page, switchPage) {
  var $content = $('#content');
  var $tempDiv = $('<div>');        // Create temporary div stored in memory
  $tempDiv.load(page + 'Content');  // Load new content into $tempDiv first b/c ajax load is laggy/slow
  if (switchPage == true) $content.stop().animate({opacity: 0}, textDelay); // Fade out current content for page switch
  setTimeout(function() { $content.html($tempDiv.html()).stop().animate({opacity: 1}, textDelay + 50) }, textDelay - 50);
}   

/* Set content on a travel page during transition */
function setTravelContent(page, switchPage) {
  setContent(page, switchPage);    // Load the HTML with ajax
  setTimeout(function() {          // Want this to run after the page transition
    var $bg1 = $('#bg1');
    numDivs = $('.bg').length - 1; // Get # of bgDivs to set body height
    $('body').height(String((scrollMultiplier * numDivs + 1) * 100 - 1) + 'vh');
    $('#divStack').css({'display': 'block'}); // Now that we can scroll, make the divStack visible
    // $bg1.css({'opacity': '0'}); // I don't think this is necessary... lets delete it
    $bg1.css('background', 'url(./' + page + '/bg1.jpg) no-repeat center center').css('background-size', 'cover');
    $('#expandTextBar').mouseover(function() {
      $(this).stop().animate({color: '#E0CDAC', backgroundColor: '#555'}, 150)});
    $('#expandTextBar').mouseout(function() {
      $(this).stop().animate({color: '#FFB74D', backgroundColor: '#393939'}, 300)});
  }, bgDelay);
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Button animation and visibility related -------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------ */

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
  $('.navButton').mouseover(function() { 
    $(this).stop().animate({color: '#E0CDAC'}, 150); });
  $('.navButton').mouseout(function() { 
    $(this).stop().animate({color: '#CFD8DC'}, 300); });
  $('.navButton.active').css({'color': '#CFD8DC'}).removeClass('active');
  $('#' + page).addClass('active').unbind().css({'color': '#FFB74D'});
  $('.navButton:not(.active)').css({'color': '#CFD8DC', 'cursor': 'pointer'});
}

/* Sets an active button and resets the others */
function setTravelBar(page) {
  $('.button').mouseover(function() {
    $(this).stop().animate({color: '#E0CDAC', backgroundColor: 'rgba(40, 40, 40, 0.7)'}, 150)});
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
var scrollPosition = 0; // $(window).scrollTop() initialized to 0 (scrollbar at top of page)
var windowHeight;       // $(window).height()
var lowerBound;         // Lower bound of transition range
var upperBound;         // Upper bound of transition range...
var divIndex = 0;       // Starts at 0 always because I'm forcing scrollTop(0) on refresh
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

/* Fade effect between backgrounds when scrolling */
function setOpacity() {
  scrollPosition = $(window).scrollTop();
  windowHeight = $(window).height();
  divIndex = Math.floor(scrollPosition / (windowHeight * scrollMultiplier)); 
  lowerBound = divIndex * windowHeight * scrollMultiplier;
  upperBound = lowerBound + windowHeight;
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
     which happens if user grabs the scrollbar and drags it to the bottom of the screen too fast (things won't load)
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

/* Load the text content from a text file based on current scrollbar position */
function setText() {
  var $textBar = $('#textBar');
  var $expandTextBar = $('#expandTextBar');
  if (scrollPosition < windowHeight && $('#textBar').css('display') == 'block') {
    $textBar.hide(250);
    $expandTextBar.hide(250);
  }
  else if (scrollPosition >= windowHeight) {
    if (window.matchMedia('(max-width: 749px)').matches) {
      $textBar.css({'height': '44px', 'padding-bottom': '0px'});
      $expandTextBar.hide().removeClass('fa fa-angle-down').addClass('fa fa-angle-up');
    }
    else $expandTextBar.show(200);
    $textBar.show(200);
    var textIndex = Math.floor((scrollPosition / (windowHeight * scrollMultiplier) - 0.3)) + 1;
    $('#textBar').load(currentPage + '/text' + String(textIndex));
  }
}

function expandContractTextBar() {
  var $textBar = $('#textBar');
  if ($textBar.height() == 44) { // textBar is currently minimized, expand it
    $('#expandTextBar').removeClass('fa fa-angle-up').addClass('fa fa-angle-down'); // Flip arrow to point down
    var tempHeight = $textBar.css({'height': 'auto'}).height();                     // Cuz of really stupid CSS bullshit
    $textBar.height('44px').animate({height: tempHeight + 'px', paddingBottom: '44px'}, 125); // BS jQuery/CSS shit here
    setTimeout(function() { $textBar.css({'height': 'auto'}); }, 150);              // 150 ms delay for expand
  }
  else { // textBar is currently expanded, contract it
    $('#expandTextBar').removeClass('fa fa-angle-down').addClass('fa fa-angle-up'); // Flip arrow to point up
    $textBar.animate({height: '44px', paddingBottom: '0px'}, 100);                  // 100 ms delay for contract
  }
}
