$(function () {
  $.ajax({
    url: "http://localhost:8001/project/search_by_user",
    type: "POST",
    data: {
      id: "61e1519c4a9b46d72791e0e7",
    },
    success: function (resp) {
      $("pre").text(JSON.stringify(resp, null, 2));
    },
    error: function () {
      $("pre").text("failure");
    },
  });
});