import { Data, DecodeMulti, EncodeMulti, Type } from "../lib/encoding";
import { JoinBuffers } from "../lib/helpers";

export class PacketMismatchError extends Error {
    constructor(actual: PacketType, attempted: PacketType) {
        super(
            `Packet mismatch, cannot decode ${PacketType[actual]} as ${PacketType[attempted]}`
        );
    }
}

export type PacketFormat = { type: PacketType; schema: Type[] };

export function CreatePacket(fmt: PacketFormat, data: Data[]) {
    return JoinPacket(fmt.type, EncodeMulti(data, fmt.schema));
}

export function ParsePacket(fmt: PacketFormat, data: Uint8Array) {
    var { type, packet } = SplitPacket(data);
    if (type != fmt.type) throw new PacketMismatchError(type, fmt.type);

    return DecodeMulti(packet, fmt.schema);
}

export function SplitPacket(
    data: Uint8Array
): { type: PacketType; packet: Uint8Array } {
    return { type: data[0] as PacketType, packet: data.slice(1) };
}

function JoinPacket(
    type: PacketType,
    packet: Uint8Array = new Uint8Array(0)
): Uint8Array {
    return JoinBuffers([new Uint8Array([type]), packet]);
}

// Packet Definitions
export enum PacketType {
    KeyDown,
    KeyUp,
    MouseDown,
    MouseUp,
    MouseMove
}

export const KeyDownPacket = {
    type: PacketType.KeyDown,
    schema: [Type.String]
};

export const KeyUpPacket = {
    type: PacketType.KeyUp,
    schema: [Type.String]
};

export const MouseDownPacket = {
    type: PacketType.MouseDown,
    schema: [Type.Uint8, Type.Uint16, Type.Uint16]
};

export const MouseUpPacket = {
    type: PacketType.MouseUp,
    schema: [Type.Uint8, Type.Uint16, Type.Uint16]
};

export const MouseMovePacket = {
    type: PacketType.MouseMove,
    schema: [Type.Uint16, Type.Uint16]
};
