import { Color } from "../common/helpers/color";
import { Renderer } from "./renderer";
import { Connection } from "../common/connection";

import config from "../../config.json";
import { KeyDownPacket } from "../common/packets";

var url = `${config.wss ? "wss" : "ws"}://${config.host}:${config.port}`;

const socket = new Connection(new WebSocket(url));
const renderer = new Renderer("canvas", true);

socket.listen(KeyDownPacket, (data) => {
    console.log(data);
});

export const background = Color.RandomPastel();
setInterval(() => {
    renderer.fill(background);
}, 1000 / config.client_fps);
