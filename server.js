const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: "http://localhost:3000/"
});

const allUsers = {};

io.on("connection", (socket) => {

  allUsers[socket.id] = {
    socket: socket,
    online: true,
  }


  socket.on("request_to_play", (data) => {
    const currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;
    let opponentPlayer;


    for (const key in allUsers) {
      const user = allUsers[key];
      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }

    //console.log(opponentPlayer);
    if (opponentPlayer) {
      currentUser.socket.emit("opponentFound",{
        opponentName : opponentPlayer.playerName
      });
      opponentPlayer.socket.emit("opponentFound",{
        opponentName: currentUser.playerName
      });
    } else {
      currentUser.socket.emit("opponentNotFound");
    }

  })

  socket.on("disconnect", function () {
      const currentUser=allUsers[socket.id];
      currentUser.online=false;
  });

});

httpServer.listen(4000);