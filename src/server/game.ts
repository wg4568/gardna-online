import WebSocket from "ws";
import { Client } from "./client";
import LoadSprites from "./sprites";

const server = new WebSocket.Server({ noServer: true });
const sprites = LoadSprites("sprites");

console.log(sprites);

export class GameState {
    public clients: Client[] = [];

    constructor() {}

    addClient(socket: WebSocket) {
        var client = new Client(socket, this);
        this.clients.push(client);
        client.sendConnect();
    }

    removeClient(client: Client) {
        var idx = this.clients.indexOf(client);
        if (idx != -1) this.clients.splice(idx, 1);
        client.sendDisconnect();
    }
}

var game = new GameState();

server.on("connection", (socket) => {
    game.addClient(socket);
});

export default server;
