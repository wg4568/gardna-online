import { exception } from "console";
import { S_IWOTH } from "constants";
import { captureRejectionSymbol } from "events";
import WebSocket from "ws";
import { Color } from "../common/helpers/color";
import {
    DecodeMulti,
    DecodeString,
    EncodeMulti,
    EncodeUint16,
    Type
} from "../common/helpers/encoding";
import { Vector2 } from "../common/helpers/vector";
import { JoinPacket, PacketType, SplitPacket } from "../common/packets";
import { GameState } from "./game";

export class Client {
    static LAST_CLIENT = 0;

    public socket: WebSocket;
    public game: GameState;
    public id: number;

    public mousePosn = Vector2.Empty();
    public mouseState = new Map<number, boolean>();
    public keyState = new Map<string, boolean>();

    constructor(socket: WebSocket, game: GameState) {
        this.id = Client.LAST_CLIENT++;

        this.socket = socket;
        this.game = game;

        this.socket.on("message", (msg: Buffer) => {
            this.message(new Uint8Array(msg));
        });
    }

    message(msg: Uint8Array) {
        var { type, packet } = SplitPacket(msg);
        // console.log(PacketType[type], packet);

        switch (type) {
            case PacketType.MouseDown: {
                let [button, x, y] = DecodeMulti(packet, [
                    Type.Uint8,
                    Type.Uint16,
                    Type.Uint16
                ]);
                this.mousePosn.x = x as number;
                this.mousePosn.y = y as number;
                this.mouseState.set(button as number, true);
                break;
            }
            case PacketType.MouseUp: {
                let [button, x, y] = DecodeMulti(packet, [
                    Type.Uint8,
                    Type.Uint16,
                    Type.Uint16
                ]);
                this.mousePosn.x = x as number;
                this.mousePosn.y = y as number;
                this.mouseState.set(button as number, false);
                break;
            }
            case PacketType.MouseMove: {
                let [x, y] = DecodeMulti(packet, [Type.Uint16, Type.Uint16]);
                this.mousePosn.x = x as number;
                this.mousePosn.y = y as number;
                break;
            }
            case PacketType.KeyDown: {
                let key = DecodeString(packet);
                this.keyState.set(key as string, true);
                break;
            }
            case PacketType.KeyUp: {
                let key = DecodeString(packet);
                this.keyState.set(key as string, false);
                break;
            }
        }
        // console.log(DecodeString(new Uint8Array([5, 83, 112, 97, 99, 101])));
        console.log(this.mousePosn, this.mouseState, this.keyState);
    }
}
