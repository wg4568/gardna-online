import WS from "ws";
import LoadSprites from "./sprites";

import {
    CreatePacket,
    DisconnectPacket,
    OnboardPacket,
    PacketType,
    PlayerPacket,
    PlayersPacket,
    SpritePacket
} from "../common/packets";
import { Client } from "./client";
import config from "../../config.json";

const server = new WS.Server({ noServer: true });
const sprites = LoadSprites("sprites");
const clients: Client[] = [];

server.on("connection", (socket: WebSocket) => {
    var client = new Client(socket);
    client.socket.send(OnboardPacket, [
        client.id,
        client.posn.x,
        client.posn.y
    ]);

    clients.push(client);

    sprites.forEach((sprite, name) => {
        client.socket.send(SpritePacket, [name, sprite]);
    });
});

var last_frame = Date.now();
setInterval(() => {
    var delta = Date.now() - last_frame;
    last_frame = Date.now();

    if (clients.length) {
        var players_packet = CreatePacket(PlayersPacket, [
            clients
                .filter((c) => !c.closed)
                .map((c) =>
                    CreatePacket(PlayerPacket, [
                        c.id,
                        c.angle,
                        c.posn.x,
                        c.posn.y
                    ])
                )
        ]);

        clients.forEach((e) => {
            if (e.socket.socket.readyState == WS.CLOSED) {
                if (!e.closed) {
                    clients.forEach((q) =>
                        q.socket.send(DisconnectPacket, [e.id])
                    );
                    e.closed = true;
                }
            } else {
                e.step(delta);
                e.socket.sendraw(players_packet);
            }
        });
    }
}, 1000 / config.server_tps);

export default server;
