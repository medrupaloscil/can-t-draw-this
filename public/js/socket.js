var ws = null;
var canvas = document.getElementById("can");
var ctx = canvas.getContext("2d");
var pseudo = "";

function myWebsocketStart() {

  if (document.getElementById("message").value != "") {
    if (ws === null) {
      ws = new WebSocket("ws://localhost:3001/websocket");
      pseudo = document.getElementById("message").value;
      document.getElementById("message").value = "";
      document.getElementById("send").innerHTML = "Send Message";

      ws.onopen = function() {
        ws.send(JSON.stringify({
          type: "connect",
          content: "content",
          author: pseudo
        }));
      };

      ws.onmessage = function (evt) {
        var data = JSON.parse(evt.data);

        switch (data["Type"]) {
          case "message":
            console.log("message");
            var list = document.getElementById("messages");
            var li = document.createElement("li");
            var p = document.createElement("p");
            p.innerHTML = data["Content"];
            var h = document.createElement("h4");
            h.innerHTML = data["Author"];
            li.appendChild(h);
            li.appendChild(p);
            list.appendChild(li);
            break;
          case "connect":
            console.log("connect");
            var list = document.getElementById("messages");
            var li = document.createElement("li");
            var p = document.createElement("p");
            p.innerHTML = "Bienvenue";
            var h = document.createElement("h4");
            h.innerHTML = "Server";
            li.appendChild(h);
            li.appendChild(p);
            list.appendChild(li);
            break;
          case "canvas":
            var content = JSON.parse(data["Content"]);
            ctx.beginPath();
            ctx.moveTo(content["prevX"], content["prevY"]);
            ctx.lineTo(content["currX"], content["currY"]);
            ctx.strokeStyle = content["x"];
            ctx.lineWidth = content["y"];
            ctx.stroke();
            ctx.closePath();
            break;
          default:
            console.log(data);
            break;
        }
      };

      ws.onclose = function() {
        var myTextArea = document.getElementById("message");
        myTextArea.value = myTextArea.value + "\n" + "Connection closed";
      };
    } else {
      var msg = document.getElementById("message");
      ws.send(JSON.stringify({
          type: "message",
          content: msg.value,
          author: pseudo
        }));
      msg.value = "";
    }
  }
}

function didDraw(prevX, prevY, currX, currY, x, y) {
  var datas = JSON.stringify({
            prevX: prevX,
            prevY: prevY,
            currX: currX,
            currY: currY,
            x: x,
            y: y
          });
  ws.send(JSON.stringify({
          type: "canvas",
          content: datas,
          author: pseudo
        }));
}