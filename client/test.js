$(function () {
  $.ajax({
    url: "http://localhost:8001/project/search",
    type: "POST",
    data: {
      id: "61e0001f02b4ea8d11c6c775"
    },
    success: function (resp) {
      $("pre").text(JSON.stringify(resp, null, 2));
    },
    error: function () {
      $("pre").text("failure");
    },
  });
});