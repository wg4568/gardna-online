import { OpenEvent } from "ws";
import { Data } from "./helpers/encoding";
import {
    CreatePacket,
    PacketFormat,
    PacketType,
    ParsePacket,
    SplitPacket
} from "./packets";

export class Connection {
    public readonly socket: WebSocket;

    private bindings = new Map<
        PacketType,
        { func: (data: Data[]) => void; fmt: PacketFormat }
    >();

    constructor(socket: WebSocket) {
        this.socket = socket;
        this.socket.binaryType = "arraybuffer";

        this.socket.onmessage = (msg) => {
            var binary = new Uint8Array(msg.data);
            var { type } = SplitPacket(binary);

            var binding = this.bindings.get(type);
            if (binding) binding.func(ParsePacket(binding.fmt, binary));
        };
    }

    open(func: (this: WebSocket, ev: Event) => any) {
        this.socket.onopen = func;
    }

    close(func: (this: WebSocket, ev: CloseEvent) => any) {
        this.socket.onclose = func;
    }

    error(func: (this: WebSocket, ev: Event) => any) {
        this.socket.onerror = func;
    }

    listen(fmt: PacketFormat, func: (data: Data[]) => void) {
        this.bindings.set(fmt.type, { func, fmt });
    }

    send(fmt: PacketFormat, data: Data[]) {
        this.socket.send(CreatePacket(fmt, data));
    }
}
