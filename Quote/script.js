$(document).ready(function() {
  $('#getQuote').on('click', function(e) {
    e.preventDefault();
    $.ajax( {
      url: '/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1',
      success: function(data) {
        var post = data.shift(); // The data is an array of posts. Grab the first one.
        $('#quoteTitle').text(post.title);
        $('#quoteContent').html(post.content);
        // If the Source is available, use it. Otherwise hide it.
        if (typeof post.custom_meta !== 'undefined' && typeof post.custom_meta.Source !== 'undefined') {
          $('#quoteSource').html('Source:' + post.custom_meta.Source);
        } else {
          $('#quoteSource').text('');
        }
      },
      cache: false
    });
  });
});