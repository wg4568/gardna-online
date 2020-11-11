import { Vector2 } from "../lib/vector";

// Tracks input state from event feed and makes it more accessible
export class InputState {
    public keyboard = new Map<string, boolean>();
    public mouse = new Map<number, boolean>();
    public cursor = new Vector2(0, 0);

    constructor() {}

    recordKeyDown(key: string) {
        this.keyboard.set(key, true);
    }

    recordKeyUp(key: string) {
        this.keyboard.set(key, false);
    }

    recordMouseDown(btn: number) {
        this.mouse.set(btn, true);
    }

    recordMouseUp(btn: number) {
        this.mouse.set(btn, false);
    }

    recordMouseMove(posn: Vector2) {
        this.cursor = posn;
    }
}
