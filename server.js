const { createServer } =require("http") ;
const { Server } =require("socket.io") ;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: "http://localhost:3000/"
});

io.on("connection", (socket) => {
  console.log("New user joined " + socket.id);
});

httpServer.listen(4000);