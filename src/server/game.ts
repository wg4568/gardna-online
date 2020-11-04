import WebSocket from "ws";
import LoadSprites from "./sprites";

const server = new WebSocket.Server({ noServer: true });
const sprites = LoadSprites("sprites");

console.log(sprites);

server.on("connection", (socket) => {
    socket.on("message", (message) => console.log(message));
});

export default server;
