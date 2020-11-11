import {
    KeyDownPacket,
    KeyUpPacket,
    MouseDownPacket,
    MouseMovePacket,
    MouseUpPacket
} from "../common/packets";
import { Connection } from "../common/connection";
import { InputState } from "../common/inputstate";
import { Vector2 } from "../lib/vector";
import { KeyName } from "../lib/keys";
import { AngleBetween } from "../lib/helpers";

export class Client {
    public static LAST_ID = 0;

    public input: InputState;
    public socket: Connection;
    public id: number;
    public closed: boolean = false;

    public posn: Vector2 = Vector2.Random(100, 800, 100, 800);
    public angle: number = 0;

    constructor(socket: WebSocket) {
        this.id = Client.LAST_ID++;
        this.socket = new Connection(socket);
        this.input = new InputState();

        this.socket.listen(KeyDownPacket, ([keycode]) => {
            this.input.recordKeyDown(KeyName(keycode as number));
        });

        this.socket.listen(KeyUpPacket, ([keycode]) => {
            this.input.recordKeyUp(KeyName(keycode as number));
        });

        this.socket.listen(MouseDownPacket, ([button, x, y]) => {
            this.input.recordMouseDown(button as number);
            this.input.recordMouseMove(new Vector2(x as number, y as number));
        });

        this.socket.listen(MouseUpPacket, ([button, x, y]) => {
            this.input.recordMouseUp(button as number);
            this.input.recordMouseMove(new Vector2(x as number, y as number));
        });

        this.socket.listen(MouseMovePacket, ([x, y]) => {
            this.input.recordMouseMove(new Vector2(x as number, y as number));
        });
    }

    step(delta: number) {
        var speed = 0.5;
        this.angle = AngleBetween(this.posn, this.input.cursor);
        if (this.input.keyboard.get("KeyW")) this.posn.y -= speed * delta;
        if (this.input.keyboard.get("KeyS")) this.posn.y += speed * delta;
        if (this.input.keyboard.get("KeyA")) this.posn.x -= speed * delta;
        if (this.input.keyboard.get("KeyD")) this.posn.x += speed * delta;
    }
}
