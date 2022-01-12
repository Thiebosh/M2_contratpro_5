$(function () {
  let socket = new WebSocket("ws://127.0.0.1:20002");

  const input_msg = $("#message_input");
  const output_msg = $("#message_output");

  let ready = false;

  socket.onopen = function(e) {
    console.log("[open] Connection established");
    console.log("Sending to server");
    socket.send("projet_test");
    ready = true;
  };

  socket.onmessage = function(event) {
    console.log(`[message] Data received from server: ${event.data}`);
    (event.data.split("\n").map((msg) => $(`<p>- serveur : ${msg}</p>`).appendTo(output_msg)));
  };

  socket.onclose = function(event) {
    ready = false;
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
    if (!ready) return;
    socket.send(input_msg.val());
    $(`<p>- client : ${input_msg.val()}</p>`).appendTo(output_msg);
  });
});