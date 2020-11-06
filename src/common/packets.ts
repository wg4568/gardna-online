import { JoinBuffers } from "./helpers/helpers";

export enum PacketType {
    Connect,
    Disconnect,
    PlayerData
}

export function SplitPacket(
    data: Uint8Array
): { type: PacketType; packet: Uint8Array } {
    return { type: data[0] as PacketType, packet: data.slice(1) };
}

export function JoinPacket(
    type: PacketType,
    packet: Uint8Array = new Uint8Array(0)
): Uint8Array {
    return JoinBuffers([new Uint8Array([type]), packet]);
}
