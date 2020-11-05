import WebSocket from "ws";

export class Client {
    public socket: WebSocket;

    constructor(socket: WebSocket) {
        this.socket = socket;
    }
}
