$(function () {
    $.ajax({
        url:"http://localhost:8001/account/connect",
        type:"POST",
        data:{
            name:"test",
            password:"test"
        },
        success: function(resp) {
            console.log(resp.id);
        },
        error: function(){
            console.log("failure");
        }
    });
});