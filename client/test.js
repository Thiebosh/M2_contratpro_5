$(function () {
  $.ajax({
    url: "http://localhost:8001/project/update",
    type: "POST",
    data: {
      id: "621f800a3be54c21de916f1e",
      name: "autre que test"
    },
    success: function (resp) {
      $("pre").text(JSON.stringify(resp, null, 2));
    },
    error: function () {
      $("pre").text("failure");
    },
  });
});