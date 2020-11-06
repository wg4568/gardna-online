import { exception } from "console";
import { S_IWOTH } from "constants";
import WebSocket from "ws";
import { Color } from "../common/helpers/color";
import {
    DecodeMulti,
    EncodeMulti,
    EncodeUint16,
    Type
} from "../common/helpers/encoding";
import { JoinPacket, PacketType, SplitPacket } from "../common/packets";
import { GameState } from "./game";

export class Client {
    static LAST_CLIENT = 0;

    public socket: WebSocket;
    public game: GameState;
    public id: number;
    public username: string;
    public color: Color;

    constructor(socket: WebSocket, game: GameState) {
        this.socket = socket;
        this.game = game;
        this.id = Client.LAST_CLIENT++;
        this.username = `Anon${this.id}`;
        this.color = Color.RandomNeon();

        this.socket.on("message", (msg: Buffer) => {
            this.message(new Uint8Array(msg));
        });
    }

    message(msg: Uint8Array) {
        var { type, packet } = SplitPacket(msg);
        switch (type) {
            case PacketType.PlayerData: {
                let [username, r, g, b] = DecodeMulti(packet, [
                    Type.String,
                    Type.Uint8,
                    Type.Uint8,
                    Type.Uint8
                ]);
                this.username = username as string;
                this.color.red = r as number;
                this.color.green = r as number;
                this.color.blue = r as number;
            }
        }
        console.log("recv", this);
    }

    send(type: PacketType, data: Uint8Array = new Uint8Array(0)) {
        this.socket.send(JoinPacket(type, data));
    }

    sendDisconnect() {
        this.send(PacketType.Disconnect);
    }

    sendConnect() {
        this.send(PacketType.Connect);
        this.sendPlayerData();
    }

    sendPlayerData() {
        this.send(
            PacketType.PlayerData,
            EncodeMulti(
                [
                    this.id,
                    this.username,
                    this.color.red,
                    this.color.green,
                    this.color.blue
                ],
                [Type.Uint16, Type.String, Type.Uint8, Type.Uint8, Type.Uint8]
            )
        );
    }
}
