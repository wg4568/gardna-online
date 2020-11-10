import { EncodeMulti, EncodeString, Type } from "../common/helpers/encoding";
import { JoinPacket, PacketType, SplitPacket } from "../common/packets";

export function InitInputs(socket: WebSocket) {
    window.onkeydown = (e: KeyboardEvent) => {
        socket.send(JoinPacket(PacketType.KeyDown, EncodeString(e.code)));
    };

    window.onkeyup = (e: KeyboardEvent) => {
        socket.send(JoinPacket(PacketType.KeyUp, EncodeString(e.code)));
    };

    window.onmousedown = (e: MouseEvent) => {
        var p = JoinPacket(
            PacketType.MouseDown,
            EncodeMulti(
                [e.button, e.clientX, e.clientY],
                [Type.Uint8, Type.Uint16, Type.Uint16]
            )
        );
        console.log(p);
        socket.send(p);
    };

    window.onmouseup = (e: MouseEvent) => {
        socket.send(
            JoinPacket(
                PacketType.MouseUp,
                EncodeMulti(
                    [e.button, e.clientX, e.clientY],
                    [Type.Uint8, Type.Uint16, Type.Uint16]
                )
            )
        );
    };

    let lastUpdate = Date.now();
    window.onmousemove = (e: MouseEvent) => {
        if (Date.now() - lastUpdate > 1000 / 60) {
            socket.send(
                JoinPacket(
                    PacketType.MouseMove,
                    EncodeMulti(
                        [e.clientX, e.clientY],
                        [Type.Uint16, Type.Uint16]
                    )
                )
            );
            lastUpdate = Date.now();
        }
    };
}
