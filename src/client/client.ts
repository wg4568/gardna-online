import { Color } from "../common/helpers/color";
import { DecodeArray, DecodeMulti, Type } from "../common/helpers/encoding";
import { Vector2 } from "../common/helpers/vector";
import { PacketType, SplitPacket } from "../common/packets";
import { InitInputs } from "./input";

import config from "../../config.json";
import { Renderer } from "./renderer";

const socket = new WebSocket(
    `${config.wss ? "wss" : "ws"}://${config.host}:${config.port}`
);
socket.binaryType = "arraybuffer";
InitInputs(socket);

socket.onopen = () => {};

var players: { id: number; posn: Vector2 }[] = [];
var renderer = new Renderer("canvas", true);

socket.onmessage = (msg) => {
    var { type, packet } = SplitPacket(new Uint8Array(msg.data));
    switch (type) {
        case PacketType.Positions: {
            players = DecodeArray(packet).map((d) => {
                let [id, x, y] = DecodeMulti(d, [
                    Type.Uint16,
                    Type.Uint16,
                    Type.Uint16
                ]);
                return {
                    id: id as number,
                    posn: new Vector2(x as number, y as number)
                };
            });
        }
    }
};

const background = Color.RandomPastel();
setInterval(() => {
    renderer.fill(background);

    players.forEach((p) => {
        renderer.ctx.fillStyle = "black";
        renderer.ctx.fillRect(p.posn.x, p.posn.y, 10, 10);
    });
}, 1000 / config.client_fps);
