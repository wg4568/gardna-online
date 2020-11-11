import WS from "ws";
import LoadSprites from "./sprites";

import {
    KeyDownPacket,
    KeyUpPacket,
    MouseDownPacket,
    MouseMovePacket,
    MouseUpPacket
} from "../common/packets";
import { Connection } from "../common/connection";
import { KeyName } from "../lib/keys";

const server = new WS.Server({ noServer: true });
const sprites = LoadSprites("sprites");

console.log(sprites);

class Client {
    public static LAST_ID = 0;

    public socket: Connection;
    public id: number;

    constructor(socket: WebSocket) {
        this.id = Client.LAST_ID++;
        this.socket = new Connection(socket);

        this.socket.listen(KeyDownPacket, ([data]) => {
            console.log(KeyName(data as number));
        });
        this.socket.listen(KeyUpPacket, (data) => {});
        this.socket.listen(MouseDownPacket, (data) => {});
        this.socket.listen(MouseUpPacket, (data) => {});
        this.socket.listen(MouseMovePacket, (data) => {});
    }
}

server.on("connection", (socket: WebSocket) => {
    var client = new Client(socket);
});

export default server;
