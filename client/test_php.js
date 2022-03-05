$(function () {
  
  console.log("step1");
  $.ajax({
    url: "http://localhost:8003/?action=set_session",
    type: "POST",
    data: {
      session: JSON.stringify({
        test: "test"
      })
    },
    success: function (resp) {

      //$("body").text(resp);
      $("<p>"+resp+"</p>").appendTo($("body"));
      console.log("step2");
      $.ajax({
        url: "http://localhost:8003/?action=get_session",
        type: "GET",
    
        success: function (resp){
          $("<p>"+resp+"</p>").appendTo($("body"));
        },
        error: function(){
          $("<p>failure</p>").appendTo($("body"));
        }
      });

    },
    error: function () {
      $("<p>failure</p>").appendTo($("body"));
    },
  });
});

