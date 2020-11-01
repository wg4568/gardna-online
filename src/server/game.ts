import WebSocket from "ws";

const server = new WebSocket.Server({ noServer: true });

server.on("connection", (socket) => {
    socket.on("message", (message) => console.log(message));
});

export default server;
