import WebSocket from "ws";
import LoadSprites from "./sprites";
import { Client } from "./client";

import config from "../../config.json";
import { JoinPacket, PacketType } from "../common/packets";
import { EncodeArray, EncodeMulti, Type } from "../common/helpers/encoding";

const server = new WebSocket.Server({ noServer: true });
const sprites = LoadSprites("sprites");

console.log(sprites);

export class GameState {
    public clients: Client[] = [];

    constructor() {
        setInterval(() => {
            this.frame();
        }, 1000 / config.server_tps);
    }

    frame() {
        var dataArray = this.clients.map((c) => {
            return EncodeMulti(
                [c.id, c.mousePosn.x, c.mousePosn.y],
                [Type.Uint16, Type.Uint16, Type.Uint16]
            );
        });

        var positionsPacket = JoinPacket(
            PacketType.Positions,
            EncodeArray(dataArray)
        );

        this.clients.forEach((c) => {
            if (c.socket.readyState == WebSocket.CLOSED) this.removeClient(c);
            c.socket.send(positionsPacket);
        });
    }

    addClient(socket: WebSocket) {
        var client = new Client(socket, this);
        this.clients.push(client);
    }

    removeClient(client: Client) {
        var idx = this.clients.indexOf(client);
        if (idx != -1) this.clients.splice(idx, 1);
    }
}

var game = new GameState();

server.on("connection", (socket) => {
    game.addClient(socket);
});

export default server;
