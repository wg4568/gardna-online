import WS from "ws";
import LoadSprites from "./sprites";

import config from "../../config.json";
import { CreatePacket, KeyDownPacket } from "../common/packets";
import { Connection } from "../common/connection";

const server = new WS.Server({ noServer: true });
const sprites = LoadSprites("sprites");

console.log(sprites);

server.on("connection", (socket: WebSocket) => {
    var client = new Connection(socket);
    client.send(KeyDownPacket, ["Hello!!!!!"]);
});

export default server;
