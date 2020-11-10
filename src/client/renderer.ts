import { Color } from "../lib/color";

export class Renderer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(canvasId: string, fullscreen: boolean = false) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

        if (fullscreen) this.initFullscreen();
    }

    initFullscreen() {
        var parent = this;
        var resize = (event?: Event) => {
            parent.canvas.width = window.innerWidth;
            parent.canvas.height = window.innerHeight;
        };

        document.body.style.margin = "0px";
        window.addEventListener("resize", resize);

        resize();
    }

    fill(color: Color) {
        this.ctx.fillStyle = color.formatHEX();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
