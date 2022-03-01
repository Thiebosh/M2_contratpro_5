$(function () {
    $.ajax({
        url:"http//localhost:8001/account/connect",
        type:"POST",
        data:{
            name:"test",
            password:"test"
        },
        //contentType : 'application/json; charset=utf-8',

        success: function(resp) {
            console.log(resp);
        },
        error: function(){
            console.log("failure");
        }
    });
});