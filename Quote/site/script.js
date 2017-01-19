$(document).ready(function() {
  $.ajax({
    url: "..\oe-trod-sched.json",
    success: function (data) {
      var obj = JSON.parse(data);
    }
  });
});
