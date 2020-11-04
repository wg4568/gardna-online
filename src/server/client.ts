import { SIGCHLD } from "constants";

class Client {
    public socket: WebSocket;

    constructor(socket: WebSocket) {
        this.socket = socket;
    }
}
