import { Color } from "../lib/color";
import { Renderer } from "./renderer";
import { Connection } from "../common/connection";

import config from "../../config.json";
import { KeyDownPacket, KeyUpPacket } from "../common/packets";
import { KeyNumber } from "../lib/keys";

var url = `${config.wss ? "wss" : "ws"}://${config.host}:${config.port}`;

const socket = new Connection(new WebSocket(url));
const renderer = new Renderer("canvas", true);

socket.open(() => {});

document.onkeydown = (e) => {
    socket.send(KeyDownPacket, [KeyNumber(e.code)]);
};

document.onkeyup = (e) => {
    socket.send(KeyUpPacket, [KeyNumber(e.code)]);
};

socket.listen(KeyDownPacket, (data) => {
    console.log(data);
});

export const background = Color.RandomPastel();
setInterval(() => {
    renderer.fill(background);
}, 1000 / config.client_fps);
