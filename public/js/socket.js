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
            p.innerHTML = data["Content"];
            var h = document.createElement("h4");
            h.innerHTML = data["Author"];
            li.appendChild(h);
            li.appendChild(p);
            list.appendChild(li);
            break;
          case "connect":
            document.getElementById("message").value = "";
            document.getElementById("send").innerHTML = "Send Message";
            canvas.style.display = "block";
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
              lis += "<li style='color: "+getRandomColor()+";'>"+userPseudo+"</li>";
            };
            console.log(lis);
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

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}