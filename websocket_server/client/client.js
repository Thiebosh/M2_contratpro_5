$(function () {
  let socket = new WebSocket("ws://127.0.0.1:8001");

  const input_msg = $("#message_input");
  const output_msg = $("#message_output");

  let inRoom = false;

  socket.onopen = function(e) {
    console.log("[open] Connection established");
    console.log("Sending to server");
  };

  socket.onmessage = function(event) {
    console.log(`[message] Data received from server: ${event.data}`);
    (event.data.split("\n").map((msg) => $(`<p>- serveur : ${msg}</p>`).appendTo(output_msg)));
  };

  socket.onclose = function(event) {
    inRoom = false;
    if (event.wasClean) {
      console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      // e.g. server process killed or network down
      // event.code is usually 1006 in this case
      console.log('[close] Connection died');
    }
  };

  socket.onerror = function(error) {
    console.log(`[error] ${error.message}`);
  };

  input_msg.change(() => {
    if (!inRoom) return;
    socket.send(input_msg.val());
    $(`<p>- client : ${input_msg.val()}</p>`).appendTo(output_msg);
  });

  $("#createNewScreenButton").on("click", function(){
    json = {
      "action":"create",
      "path":"root/screen",
      "content":{ "name": ""}
  }

  // {
  //   "action":"update",
  //   "path":"root",
  //   "content":{'screen':[]}
  // }

  socket.send(JSON.stringify(json))
  });

  $("#createButton2").on("click", function(){
    json = {
      "action":"update",
      "path":"root/screen/0",
      "content":{
        'style':{
          "color": "#6897bb",
          "align": "center"
        }
      }
  }
  socket.send(JSON.stringify(json))
  });

  $("#connectionButton").on("click", function(){
    let roomName = $("#roomNameInput").val(); 
    msg = JSON.stringify({"action":"connectRoom", "roomName" : roomName})
    socket.send(msg);
    inRoom = true;

    $("#connectionButton").css("display","None");
    $("#createNewScreenButton").css("display","");
    $("#createButton2").css("display","");
    $("#saveButton").css("display","");
    $("#exitRoomButton").css("display","");
    $("#message_input").css("display","");
    $("#roomNameInput").css("display","None");
  });

  $("#exitRoomButton").on("click", function(){
    msg = JSON.stringify({"action":"exitRoom"})
    socket.send(msg)
    inRoom = false;

    $("#message_output").empty();
    $("#connectionButton").css("display","");
    $("#createNewScreenButton").css("display","None");
    $("#createButton2").css("display","None");
    $("#saveButton").css("display","None");
    $("#exitRoomButton").css("display","None");
    $("#message_input").css("display","None");
    $("#roomNameInput").css("display","");
  });

  $("#saveButton").on("click", function(){
    msg = JSON.stringify({"action":"save"})
    socket.send(msg)
  });
});