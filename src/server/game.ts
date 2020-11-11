import WS from "ws";
import LoadSprites from "./sprites";

import {
    KeyDownPacket,
    KeyUpPacket,
    MouseDownPacket,
    MouseMovePacket,
    MouseUpPacket,
    SpritePacket
} from "../common/packets";
import { Connection } from "../common/connection";

const server = new WS.Server({ noServer: true });
const sprites = LoadSprites("sprites");

class Client {
    public static LAST_ID = 0;

    public socket: Connection;
    public id: number;

    constructor(socket: WebSocket) {
        this.id = Client.LAST_ID++;
        this.socket = new Connection(socket);

        this.socket.listen(KeyDownPacket, ([keycode]) => {});
        this.socket.listen(KeyUpPacket, ([keycode]) => {});
        this.socket.listen(MouseDownPacket, ([button, x, y]) => {});
        this.socket.listen(MouseUpPacket, ([button, x, y]) => {});
        this.socket.listen(MouseMovePacket, ([x, y]) => {});
    }
}

server.on("connection", (socket: WebSocket) => {
    var client = new Client(socket);

    sprites.forEach((sprite, name) => {
        client.socket.send(SpritePacket, [name, sprite]);
    });
});

export default server;
