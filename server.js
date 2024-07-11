const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  //client address
  cors: "http://localhost:3000/"
});

const allUsers = {};


//get a connection call form client
io.on("connection", (socket) => {

 
  //saving current user into the allUsers
  allUsers[socket.id] = {
    socket: socket,
    online: true,
  }

  //got a call to save username of the player
  socket.on("request_to_play", (data) => {
    const currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;
    let opponentPlayer;

 //after saving player name, finding if an opponent if available or not
    for (const key in allUsers) {
      const user = allUsers[key];

      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }

    //console.log(opponentPlayer);
    if (opponentPlayer) {
      //sending opponent info to the client
      currentUser.socket.emit("opponentFound",{
        opponentName : opponentPlayer.playerName,
        playingAs:"circle"
      });
     //sending current player info to the opponent client
      opponentPlayer.socket.emit("opponentFound",{
        opponentName: currentUser.playerName,
        playingAs:"cross"
      });
     //get a call that current player moved please give this updates to the opponent
      currentUser.socket.on("playerMoveFromClient", (data)=>{

        //sending update to the opponent client
            opponentPlayer.socket.emit("playerMoveFromServer",{
              ...data
            });
      });
     //got a call from opponent ,that opponent is moved please update your state
      opponentPlayer.socket.on("playerMoveFromClient", (data)=>{
        //sending update to the current player client
        currentUser.socket.emit("playerMoveFromServer",{
          ...data
        });
      });
    } else {
      //sending req to client that opponent not found yet
      currentUser.socket.emit("opponentNotFound");
    }

  })
   
  //get a call from client to disconnect 
  socket.on("disconnect", function () {
      const currentUser=allUsers[socket.id];
      currentUser.online=false;
  });

});

httpServer.listen(4000);