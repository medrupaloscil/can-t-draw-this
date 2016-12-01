var ws = null;

  function myWebsocketStart() {

    if (document.getElementById("message").value != "") {
      if (ws === null) {
        ws = new WebSocket("ws://localhost:3000/websocket");
        document.getElementById("message").value = "";
        document.getElementById("send").innerHTML = "Send Message";

        ws.onopen = function() {
          ws.send("ping");
        };

        ws.onmessage = function (evt) {
          var list = document.getElementById("messages");
          var li = document.createElement("li");
          var p = document.createElement("p");
          p.innerHTML = evt.data;
          li.appendChild(p);
          list.appendChild(li);
          if(evt.data == "pong") {
            setTimeout(function(){ws.send("ping");}, 2000);
          }
        };

        ws.onclose = function() {
          var myTextArea = document.getElementById("message");
          myTextArea.value = myTextArea.value + "\n" + "Connection closed";
        };
      } else {
        var msg = document.getElementById("message");
        var list = document.getElementById("messages");
        var li = document.createElement("li");
        var p = document.createElement("p");
        p.innerHTML = msg.value;
        var h = document.createElement("h4");
        h.innerHTML = "You";
        li.appendChild(h);
        li.appendChild(p);
        list.appendChild(li);
        msg.value = "";
      }
    }
  }