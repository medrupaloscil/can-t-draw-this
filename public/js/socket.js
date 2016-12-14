var ws = null;
var canvas = document.getElementById("can");
var ctx = canvas.getContext("2d");
var pseudo = "";
var ulPseudos = document.getElementById("users");

function myWebsocketStart() {

  if (document.getElementById("message").value != "") {
    if (ws === null) {
      ws = new WebSocket("ws://localhost:3001/websocket");
      pseudo = document.getElementById("message").value;

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
            var list = document.getElementById("messages");
            var li = document.createElement("li");
            var p = document.createElement("p");
            var content = data["Content"];
            var split = content.split(" ");
            if (split[0] == "/color") {
              p.style.color = split[1];
              content = content.replace(split[0] + " " + split[1], "");
            } else if (split[0] == "/private") {
              content = content.replace(split[0] + " " + split[1], "");
            }
            p.innerHTML = content;
            var h = document.createElement("h4");
            h.innerHTML = data["Author"];
            li.appendChild(h);
            li.appendChild(p);
            list.appendChild(li);
            break;
          case "private":
            var list = document.getElementById("messages");
            var li = document.createElement("li");
            var p = document.createElement("p");
            li.className = "private";
            var content = data["Content"];
            var split = content.split(" ");
            content = content.replace(split[0] + " " + split[1], "");
            p.innerHTML = content;
            var h = document.createElement("h4");
            h.innerHTML = data["Author"] + "->" + data["To"];
            li.appendChild(h);
            li.appendChild(p);
            list.appendChild(li);
            break;
          case "connect":
            document.getElementById("message").value = "";
            document.getElementById("message").placeholder = "Message...";
            document.getElementById("send").innerHTML = "Send Message";
            canvas.style.display = "block";
            document.getElementById("colorPicker").style.display = "block";
            document.getElementById("penSize").style.display = "block";
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
          case "bad_connect":
            alert("Pseudo already used");
            pseudo = "";
            ws = null;
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
          case "users":
            var content = JSON.parse(data["Content"]);
            var lis = "";
            for (var i = content.length - 1; i >= 0; i--) {
              var userPseudo = content[i];
              lis += "<li>"+userPseudo+"</li>";
            };
            ulPseudos.innerHTML = lis;
          default:
            break;
        }
      };

      ws.onclose = function() {
        var myTextArea = document.getElementById("message");
        myTextArea.value = myTextArea.value + "\n" + "Connection closed";
      };
    } else {
      var msg = document.getElementById("message");
      var value = msg.value;
      var type = "message";
      var to = "";
      var split = value.split(" ");
      if (split[0] == "/private") {
        type = "private";
        to = split[1];
      } else if (split[0] == "/nick") {
        type = "nick";
        to = pseudo;
        pseudo = split[1];
      }
      ws.send(JSON.stringify({
          type: type,
          content: value,
          author: pseudo,
          to: to
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