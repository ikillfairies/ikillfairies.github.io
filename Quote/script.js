var title;
var content;
var source;

$(document).ready(function() {
  getQuote();
  $('#getQuote').click();
});

function getQuote() {
  $.ajax( {
    url: 'http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1&callback=',
    success: function(data) {
      var post = data[0]
      title = post.title;
      content = post.content;
      // If the Source is available, use it. Otherwise hide it.
      if (typeof post.custom_meta !== 'undefined' && typeof post.custom_meta.Source !== 'undefined') {
        source = post.custom_meta.Source;
      } else {
        source = 'not available';
      }
    },
    cache: false
  });
}

$('#getQuote').on('click', function() {
  $('#quote').animate({'opacity': 0}, 75);
  setTimeout(function() { 
    $('#quoteTitle').html(title);
    $('#quoteContent').html(content);
    $('#quoteSource').html('Source: ' + source);
  }, 75);
  $('#quote').delay(75).animate({'opacity': 1}, 150);
  getQuote();
});