$(function () {
    let socket = new WebSocket("ws://127.0.0.1:8002");

    const output_msg = $("#message_output");

    socket.onopen = function(event) {
        console.log("[open] Connection established");
        console.log("Sending to server");
        msg = JSON.stringify({"action":"connectRoom", "roomId" : "test", "author": "moi"})
        socket.send(msg);
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

    socket.onmessage = function(event) {
        $("#result").text(event.data);
      };

    $("a").on("click", function(event) {
        event.preventDefault(); 
        event.stopPropagation();
        msg = JSON.stringify({"action":"execute", "page": $("a").attr('href')});
        socket.send(msg);
    });
});