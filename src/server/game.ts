import WebSocket from "ws";
import { Client } from "./client";
import LoadSprites from "./sprites";

const server = new WebSocket.Server({ noServer: true });
const sprites = LoadSprites("sprites");

console.log(sprites);

var clients: Client[] = [];

server.on("connection", (socket) => {
    clients.push(new Client(socket));
});

export default server;
