import { Base64 } from "js-base64";

export class RuntimeError extends Error {
    constructor(msg: string) {
        super(`Runtime Error: ${msg}`);
    }
}

export class CompileError extends Error {
    constructor(msg: string) {
        super(`Compile Error: ${msg}`);
    }
}

export enum Instruction {
    PUSH,
    PUSH_ARG,
    POP,

    ADD,
    SUBTRACT,
    MULTIPLY,
    DIVIDE,
    MODULO,
    EXPONENT,
    ABS,
    FLOOR,
    CEIL,

    SET_LINE_CAP,
    SET_LINE_DASH_OFFSET,
    SET_LINE_JOIN,
    SET_LINE_WIDTH,
    SET_MITER_LIMIT,

    SET_SHADOW_BLUR,
    SET_SHADOW_COLOR,
    SET_SHADOW_OFFSET,

    SET_FILL_COLOR,
    SET_STROKE_COLOR,

    SET_GLOBAL_ALPHA,
    SET_GLOBAL_COMPOSITE_OPERATION,
    SET_IMAGE_SMOOTHING_ENABLED,

    SET_FONT,
    SET_TEXT_ALIGN,
    SET_TEXT_BASELINE,

    ARC,
    RECT,
    ELLIPSE,

    ARC_TO,
    BEZIER_TO,
    QUADRATIC_TO,

    DRAW_IMAGE,

    FILL_TEXT,
    STROKE_TEXT,

    LINE_TO,
    MOVE_TO,

    ROTATE,
    SCALE,
    TRANSFORM,
    TRANSLATE,

    MEASURE_TEXT,

    BEGIN_PATH,
    CLOSE_PATH,
    RESTORE,
    CLIP,
    FILL,
    STROKE
}

export enum Enum {
    BUTT,
    ROUND,
    SQUARE,
    BEVEL,
    MITER,
    LEFT,
    RIGHT,
    CENTER,
    START,
    END,
    TOP,
    HANGING,
    MIDDLE,
    ALPHABETIC,
    IDEOGRAPHIC,
    BOTTON,
    SOURCE_OVER,
    SOURCE_IN,
    SOURCE_OUT,
    SOURCE_ATOP,
    DESTINATION_OVER,
    DESTINATION_IN,
    DESTINATION_OUT,
    DESTINATION_ATOP,
    LIGHTER,
    COPY,
    XOR,
    MULTIPLY,
    SCREEN,
    OVERLAY,
    DARKEN,
    LIGHTEN,
    COLOR_DODGE,
    COLOR_BURN,
    HARD_LIGHT,
    SOFT_LIGHT,
    DIFFERENCE,
    EXCLUSION,
    HUE,
    SATURATION,
    COLOR,
    LUMINOSITY
}

export function Compile(
    code: string,
    userConstants: Map<string, number> = new Map<string, number>()
) {
    enum Type {
        Keyword,
        Number,
        String
    }

    SpriteScript.Constants.forEach((val, name) => {
        if (!userConstants.has(name)) userConstants.set(name, val);
    });

    var tokens: [Type, string][] = [];
    var i: number = 0;

    code = code.replace(/\r\n/g, "\n"); // windows line endings
    code += "\n"; // guarantee termination
    while (i < code.length) {
        let first = code[i];
        let current = "";
        let type: Type = Type.Keyword;

        if (first == '"') {
            i++;
            type = Type.String;
            while (code[i] != '"' && code[i] != "\n") {
                current += code[i];
                i++;
            }
        }

        if (first == "#") {
            i++;
            while (code[i] != "\n") i++;
        }

        if (/^[a-zA-Z]+$/.test(first)) {
            type = Type.Keyword;
            while (/^[a-zA-Z0-9_]+$/.test(code[i])) {
                current += code[i];
                i++;
            }
            current = current.toUpperCase();
        }

        if (/^[0-9\-]+$/.test(first)) {
            type = Type.Number;
            while (/^[0-9\-.]+$/.test(code[i])) {
                current += code[i];
                i++;
            }
        }

        i++;
        if (current) tokens.push([type, current]);
    }

    var labelIndex: number = 0;
    var labelIndexStore: { [key: string]: number } = {};
    var labels: number[] = [];
    var commands: number[] = [];
    var i: number = 0;

    function getStrictType(idx: number, type: Type): [Type, string] {
        let token = tokens[idx];
        if (token[0] != type)
            throw new CompileError(
                `Expecting a ${Type[type]}, got ${Type[token[0]]}`
            );
        return token;
    }

    function parseKeyword(keyword: string) {
        if (keyword == "TRUE") return 1;
        else if (keyword == "FALSE") return 0;
        else if (Object.values(Enum).includes(keyword))
            return Enum[keyword as keyof typeof Enum];
        else if (userConstants.has(keyword))
            return userConstants.get(keyword) as number;
        return labelIndexStore[keyword];
    }

    function getArgNumber(keyword: string) {
        var m = keyword.match(/ARG([0-9]+)/);
        if (m && m.length == 2) return Number(m[1]);
        else return -1;
    }

    while (i < tokens.length) {
        let first: [Type, string] = getStrictType(i, Type.Keyword);

        switch (first[1]) {
            case "LABEL":
                let title: string = getStrictType(++i, Type.Keyword)[1];
                let content: string = getStrictType(++i, Type.String)[1];

                if (title in labelIndexStore)
                    throw new CompileError(`Label ${title} already exists`);

                labelIndexStore[title] = labelIndex++;
                labels.push(content.length);

                for (let q = 0; q < content.length; q++)
                    labels.push(content.charCodeAt(q));

                break;
            case "PUSH":
                let value = tokens[++i];
                let number = new Float32Array(1);
                let argNumber = getArgNumber(value[1]);

                if (argNumber != -1) {
                    commands.push(Instruction.PUSH_ARG);
                    commands.push(argNumber);
                    break;
                }
                if (value[0] == Type.Keyword)
                    number[0] = parseKeyword(value[1]);
                else number[0] = Number(value[1]);

                commands.push(Instruction.PUSH);
                commands.push(...new Uint8Array(number.buffer));
                break;
            default:
                var instr = Instruction[first[1] as keyof typeof Instruction];
                if (!instr)
                    throw new CompileError(`${first[1]} is not defined`);
                commands.push(instr);
                break;
        }

        i++;
    }

    var length: number = 1 + labels.length + commands.length;
    var data: number[] = [labelIndex].concat(labels).concat(commands);
    return new Uint8Array(data);
}

export type ScriptOptions = {
    cache?: boolean;
    width?: number;
    height?: number;
};

export class SpriteScript {
    public readonly bytecode: Uint8Array;
    public readonly labels: string[];
    public readonly startIndex: number;
    public canvas: HTMLCanvasElement | null = null;

    public static Debug: boolean = false;
    public static readonly Constants = new Map<string, number>([
        ["PI", Math.PI]
    ]);

    constructor(
        bytecode: Uint8Array,
        options: ScriptOptions = {
            cache: false
        }
    ) {
        this.bytecode = bytecode;

        var ld = SpriteScript.GetLabels(this.bytecode);
        this.labels = ld[1];
        this.startIndex = ld[0];

        if (options.cache) {
            if (!options.width || !options.height)
                throw new Error(
                    "Width and height must be specified when using cache"
                );

            this.canvas = document.createElement("canvas");
            this.canvas.width = options.width;
            this.canvas.height = options.height;
        }
    }

    render(
        ctx: CanvasRenderingContext2D,
        posn: { x: number; y: number },
        args: (number | string)[] = []
    ) {
        if (this.canvas) {
            if (args.length != 0)
                throw new Error(
                    "Args not permitted when using cache, use renderCache instead"
                );
            ctx.drawImage(this.canvas, posn.x, posn.y);
        } else {
            SpriteScript.Render(
                this.bytecode,
                this.labels,
                args,
                this.startIndex,
                ctx,
                posn
            );
        }
    }

    renderCache(args: (number | string)[] = []) {
        if (!this.canvas) throw new Error("Cache not enabled on this script");
        var ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

        SpriteScript.Render(
            this.bytecode,
            this.labels,
            args,
            this.startIndex,
            ctx,
            { x: 0, y: 0 }
        );
    }

    toBase64(): string {
        return Base64.fromUint8Array(this.bytecode);
    }

    static ToBase64(bytecode: Uint8Array) {
        return Base64.fromUint8Array(bytecode);
    }

    static FromBase64(b64: string, options?: ScriptOptions): SpriteScript {
        return new SpriteScript(Base64.toUint8Array(b64), options);
    }

    static FromScript(
        script: string,
        options?: {
            cache?: boolean;
            width?: number;
            height?: number;
        }
    ): SpriteScript {
        return new SpriteScript(
            Compile(script, SpriteScript.Constants),
            options
        );
    }

    static StackNumber(stack: number[], idx: number): number {
        if (idx >= stack.length)
            throw new RuntimeError(`Index ${idx} exceeds stack length`);

        return stack[stack.length - idx - 1];
    }

    static StackString(stack: number[], labels: string[], idx: number): string {
        let n = SpriteScript.StackNumber(stack, idx);
        if (n > labels.length)
            throw new RuntimeError(`Label with index ${n} does not exist`);

        return labels[n];
    }

    static StackEnum(stack: number[], idx: number): string {
        let n = SpriteScript.StackNumber(stack, idx);
        if (!Enum[n])
            throw new RuntimeError(`Enum with index ${n} does not exist`);

        return Enum[n].toLowerCase().replace("_", "-");
    }

    static GetLabels(binary: Uint8Array): [number, string[]] {
        var labels: string[] = [];
        var stack: number[] = [];
        var i: number = 0;

        var nLabels: number = binary[i];
        for (var j = 0; j < nLabels; j++) {
            let length = binary[++i];
            labels.push(
                String.fromCharCode(...binary.subarray(i + 1, i + length + 1))
            );
            i += length;
        }

        return [++i, labels];
    }

    static Render(
        binary: Uint8Array,
        labels: string[],
        args: (number | string)[],
        idx: number,
        ctx: CanvasRenderingContext2D,
        posn: { x: number; y: number }
    ) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(posn.x, posn.y);
        ctx.save();

        var stack: number[] = [];

        while (idx < binary.length) {
            idx = this.ExecuteInstruction(
                binary,
                stack,
                labels,
                args,
                idx,
                ctx
            );
        }

        ctx.restore();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    static ExecuteInstruction(
        binary: Uint8Array,
        stack: number[],
        labels: string[],
        args: (number | string)[],
        idx: number,
        ctx: CanvasRenderingContext2D
    ): number {
        let instr: Instruction = binary[idx];
        switch (instr) {
            case Instruction.PUSH: {
                let p = new Uint8Array(binary.subarray(idx + 1, idx + 5))
                    .buffer;
                let num = new Float32Array(p)[0];
                stack.push(num);
                idx += 4;
                break;
            }
            case Instruction.PUSH_ARG: {
                let argNum = binary[idx + 1];
                if (argNum >= args.length)
                    throw new RuntimeError(
                        `Cannot get arg ${argNum}, arglist too short`
                    );

                let arg = args[argNum];
                if (typeof args[argNum] == "number") {
                    arg = arg as number;
                    stack.push(arg);
                } else {
                    arg = arg as string;
                    let lbl = labels.indexOf(arg);
                    if (lbl == -1) {
                        stack.push(labels.length);
                        labels.push(arg);
                    } else {
                        stack.push(lbl);
                    }
                }

                idx++;
                break;
            }
            case Instruction.POP: {
                stack.pop();
                break;
            }
            case Instruction.ADD: {
                let a = SpriteScript.StackNumber(stack, 1);
                let b = SpriteScript.StackNumber(stack, 0);
                stack.pop();
                stack.pop();
                stack.push(a + b);
                break;
            }
            case Instruction.SUBTRACT: {
                let a = SpriteScript.StackNumber(stack, 1);
                let b = SpriteScript.StackNumber(stack, 0);
                stack.pop();
                stack.pop();
                stack.push(a - b);
                break;
            }
            case Instruction.MULTIPLY: {
                let a = SpriteScript.StackNumber(stack, 1);
                let b = SpriteScript.StackNumber(stack, 0);
                stack.pop();
                stack.pop();
                stack.push(a * b);
                break;
            }
            case Instruction.DIVIDE: {
                let a = SpriteScript.StackNumber(stack, 1);
                let b = SpriteScript.StackNumber(stack, 0);
                stack.pop();
                stack.pop();
                stack.push(a / b);
                break;
            }
            case Instruction.EXPONENT: {
                let a = SpriteScript.StackNumber(stack, 1);
                let b = SpriteScript.StackNumber(stack, 0);
                stack.pop();
                stack.pop();
                stack.push(Math.pow(a, b));
                break;
            }
            case Instruction.MODULO: {
                let a = SpriteScript.StackNumber(stack, 1);
                let b = SpriteScript.StackNumber(stack, 0);
                stack.pop();
                stack.pop();
                stack.push(a % b);
                break;
            }
            case Instruction.ABS: {
                let a = SpriteScript.StackNumber(stack, 0);
                stack.pop();
                stack.push(Math.abs(a));
                break;
            }
            case Instruction.FLOOR: {
                let a = SpriteScript.StackNumber(stack, 0);
                stack.pop();
                stack.push(Math.floor(a));
                break;
            }
            case Instruction.CEIL: {
                let a = SpriteScript.StackNumber(stack, 0);
                stack.pop();
                stack.push(Math.ceil(a));
                break;
            }
            case Instruction.FLOOR: {
                let a = SpriteScript.StackNumber(stack, 0);
                stack.pop();
                stack.push(Math.floor(a));
                break;
            }
            case Instruction.SET_LINE_CAP: {
                let cap = SpriteScript.StackEnum(stack, 0);
                ctx.lineCap = cap as CanvasLineCap;
                break;
            }
            case Instruction.SET_LINE_DASH_OFFSET: {
                let offset = SpriteScript.StackNumber(stack, 0);
                ctx.lineDashOffset = offset;
                break;
            }
            case Instruction.SET_LINE_JOIN: {
                let join = SpriteScript.StackEnum(stack, 0);
                ctx.lineJoin = join as CanvasLineJoin;
                break;
            }
            case Instruction.SET_LINE_WIDTH: {
                let width = SpriteScript.StackNumber(stack, 0);
                ctx.lineWidth = width;
                break;
            }
            case Instruction.SET_MITER_LIMIT: {
                let ml = SpriteScript.StackNumber(stack, 0);
                ctx.miterLimit = ml;
                break;
            }
            case Instruction.SET_SHADOW_BLUR: {
                let blur = SpriteScript.StackNumber(stack, 0);
                ctx.shadowBlur = blur;
                break;
            }
            case Instruction.SET_SHADOW_COLOR: {
                let r = SpriteScript.StackNumber(stack, 3);
                let g = SpriteScript.StackNumber(stack, 2);
                let b = SpriteScript.StackNumber(stack, 1);
                let a = SpriteScript.StackNumber(stack, 0);
                ctx.shadowColor = `rgba(${r},${g},${b},${a})`;
                break;
            }
            case Instruction.SET_SHADOW_OFFSET: {
                let x = SpriteScript.StackNumber(stack, 1);
                let y = SpriteScript.StackNumber(stack, 0);
                ctx.shadowOffsetX = x;
                ctx.shadowOffsetY = y;
                break;
            }
            case Instruction.SET_FILL_COLOR: {
                let r = SpriteScript.StackNumber(stack, 3);
                let g = SpriteScript.StackNumber(stack, 2);
                let b = SpriteScript.StackNumber(stack, 1);
                let a = SpriteScript.StackNumber(stack, 0);
                ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
                break;
            }
            case Instruction.SET_STROKE_COLOR: {
                let r = SpriteScript.StackNumber(stack, 3);
                let g = SpriteScript.StackNumber(stack, 2);
                let b = SpriteScript.StackNumber(stack, 1);
                let a = SpriteScript.StackNumber(stack, 0);
                ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
                break;
            }
            case Instruction.SET_GLOBAL_ALPHA: {
                let alpha = SpriteScript.StackNumber(stack, 0);
                ctx.globalAlpha = alpha;
                break;
            }
            case Instruction.SET_GLOBAL_COMPOSITE_OPERATION: {
                let oper = SpriteScript.StackEnum(stack, 0);
                ctx.globalCompositeOperation = oper;
                break;
            }
            case Instruction.SET_IMAGE_SMOOTHING_ENABLED: {
                let enabled: boolean = SpriteScript.StackNumber(stack, 0) != 0;
                ctx.imageSmoothingEnabled = enabled;
                break;
            }
            case Instruction.SET_FONT: {
                ctx.font = SpriteScript.StackString(stack, labels, 0);
                break;
            }
            case Instruction.SET_TEXT_ALIGN: {
                let align = SpriteScript.StackEnum(stack, 0);
                ctx.textAlign = align as CanvasTextAlign;
                break;
            }
            case Instruction.SET_TEXT_BASELINE: {
                let baseline = SpriteScript.StackEnum(stack, 0);
                ctx.textBaseline = baseline as CanvasTextBaseline;
                break;
            }
            case Instruction.ARC: {
                let x = SpriteScript.StackNumber(stack, 4);
                let y = SpriteScript.StackNumber(stack, 3);
                let radius = SpriteScript.StackNumber(stack, 2);
                let start = SpriteScript.StackNumber(stack, 1);
                let end = SpriteScript.StackNumber(stack, 0);
                ctx.arc(x, y, radius, start, end);
                break;
            }
            case Instruction.RECT: {
                let x = SpriteScript.StackNumber(stack, 3);
                let y = SpriteScript.StackNumber(stack, 2);
                let w = SpriteScript.StackNumber(stack, 1);
                let h = SpriteScript.StackNumber(stack, 0);
                ctx.rect(x, y, w, h);
                break;
            }
            case Instruction.ELLIPSE: {
                let x = SpriteScript.StackNumber(stack, 6);
                let y = SpriteScript.StackNumber(stack, 5);
                let radx = SpriteScript.StackNumber(stack, 4);
                let rady = SpriteScript.StackNumber(stack, 3);
                let rot = SpriteScript.StackNumber(stack, 2);
                let start = SpriteScript.StackNumber(stack, 1);
                let end = SpriteScript.StackNumber(stack, 0);
                ctx.ellipse(x, y, radx, rady, rot, start, end);
                break;
            }
            case Instruction.ARC_TO: {
                let x1 = SpriteScript.StackNumber(stack, 4);
                let y1 = SpriteScript.StackNumber(stack, 3);
                let x2 = SpriteScript.StackNumber(stack, 2);
                let y2 = SpriteScript.StackNumber(stack, 1);
                let radius = SpriteScript.StackNumber(stack, 0);
                ctx.arcTo(x1, y1, x2, y2, radius);
                break;
            }
            case Instruction.BEZIER_TO: {
                let cp1x = SpriteScript.StackNumber(stack, 5);
                let cp1y = SpriteScript.StackNumber(stack, 4);
                let cp2x = SpriteScript.StackNumber(stack, 3);
                let cp2y = SpriteScript.StackNumber(stack, 2);
                let x = SpriteScript.StackNumber(stack, 1);
                let y = SpriteScript.StackNumber(stack, 0);
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
                break;
            }
            case Instruction.QUADRATIC_TO: {
                let cpx = SpriteScript.StackNumber(stack, 3);
                let cpy = SpriteScript.StackNumber(stack, 2);
                let x = SpriteScript.StackNumber(stack, 1);
                let y = SpriteScript.StackNumber(stack, 0);
                ctx.quadraticCurveTo(cpx, cpy, x, y);
                break;
            }
            case Instruction.DRAW_IMAGE: {
                let url = SpriteScript.StackString(stack, labels, 8);
                let sx = SpriteScript.StackNumber(stack, 7);
                let sy = SpriteScript.StackNumber(stack, 6);
                let sw = SpriteScript.StackNumber(stack, 5);
                let sh = SpriteScript.StackNumber(stack, 4);
                let dx = SpriteScript.StackNumber(stack, 3);
                let dy = SpriteScript.StackNumber(stack, 2);
                let dW = SpriteScript.StackNumber(stack, 1);
                let dH = SpriteScript.StackNumber(stack, 0);

                var img = new Image(); // TODO: cache images
                img.src = url;
                ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dW, dH);
                break;
            }
            case Instruction.FILL_TEXT: {
                let txt = SpriteScript.StackString(stack, labels, 2);
                let x = SpriteScript.StackNumber(stack, 1);
                let y = SpriteScript.StackNumber(stack, 0);
                ctx.fillText(txt, x, y);
                break;
            }
            case Instruction.STROKE_TEXT: {
                let txt = SpriteScript.StackString(stack, labels, 2);
                let x = SpriteScript.StackNumber(stack, 1);
                let y = SpriteScript.StackNumber(stack, 0);
                ctx.strokeText(txt, x, y);
                break;
            }
            case Instruction.MEASURE_TEXT: {
                let txt = SpriteScript.StackString(stack, labels, 0);
                stack.pop();
                stack.push(ctx.measureText(txt).width);
                break;
            }
            case Instruction.LINE_TO: {
                let x = SpriteScript.StackNumber(stack, 1);
                let y = SpriteScript.StackNumber(stack, 0);
                ctx.lineTo(x, y);
                break;
            }
            case Instruction.MOVE_TO: {
                let x = SpriteScript.StackNumber(stack, 1);
                let y = SpriteScript.StackNumber(stack, 0);
                ctx.moveTo(x, y);
                break;
            }
            case Instruction.ROTATE: {
                let a = SpriteScript.StackNumber(stack, 0);
                ctx.rotate(a);
                break;
            }
            case Instruction.SCALE: {
                let x = SpriteScript.StackNumber(stack, 1);
                let y = SpriteScript.StackNumber(stack, 0);
                ctx.scale(x, y);
                break;
            }
            case Instruction.TRANSFORM: {
                let a = SpriteScript.StackNumber(stack, 5);
                let b = SpriteScript.StackNumber(stack, 4);
                let c = SpriteScript.StackNumber(stack, 3);
                let d = SpriteScript.StackNumber(stack, 2);
                let e = SpriteScript.StackNumber(stack, 1);
                let f = SpriteScript.StackNumber(stack, 0);
                ctx.transform(a, b, c, d, e, f);
                break;
            }
            case Instruction.TRANSLATE: {
                let x = SpriteScript.StackNumber(stack, 1);
                let y = SpriteScript.StackNumber(stack, 0);
                ctx.translate(x, y);
                break;
            }
            case Instruction.BEGIN_PATH: {
                ctx.beginPath();
                break;
            }
            case Instruction.CLOSE_PATH: {
                ctx.closePath();
                break;
            }
            case Instruction.RESTORE: {
                ctx.restore();
                ctx.save();
                break;
            }
            case Instruction.CLIP: {
                ctx.clip();
                break;
            }
            case Instruction.FILL: {
                ctx.fill();
                break;
            }
            case Instruction.STROKE: {
                ctx.stroke();
                break;
            }
        }
        if (SpriteScript.Debug) console.log(idx, Instruction[instr], stack);
        return ++idx;
    }
}
