import { createOrtho, mul } from "./matrix.js";

interface Mesh {
    vao: WebGLVertexArrayObject;
    vert: WebGLBuffer;
    uv: WebGLBuffer;
    col: WebGLBuffer;

    type: GLenum;

    vertices: number;
}

class RenderObject {
    public mesh: Mesh;
    public texture?: WebGLTexture;
    public visible = true;

    public position: Vector3;
    public scale: Vector2;

    public onUpdate?: () => void;

    private _parent?: RenderObject;
    private _children: Set<RenderObject> = new Set();

    private _rotation = 0;
    /** rotation in radians */
    get rotation() { return this._rotation; }
    set rotation(v: number) {
        if (this._rotation != v) {
            this._rotation = v;
            this._staleMatrix = true;
        }
    }

    private _matrix;
    private _staleMatrix = true;

    public get parent() { return this._parent; }
    public set parent(v: RenderObject) {
        if (this._parent == v) return;

        if (this._parent) {
            this._parent._children.delete(this);
        }

        this._parent = v;
        this._parent._children.add(this);
        this._staleMatrix = true;
    }

    get matrix() {
        if (this.staleMatrix) {
            this._staleMatrix = false;

            /*this._matrix = mul(mul(
                translate(this.position.x, this.position.y, this.position.z),
                rotateZ(this._rotation)),
                scale(this.scale.x, this.scale.y, 1), 
            );*/

            // reduce matrix multiplication cost by precalculating
            let sin = Math.sin(this._rotation);
            let cos = Math.cos(this._rotation);

            this._matrix = [
                cos * this.scale.x, sin * this.scale.x, 0, 0,
                -sin * this.scale.y, cos * this.scale.y, 0, 0,
                0, 0, 1, 0,
                this.position.x, this.position.y, this.position.z, 1
            ];

            if (this._parent) {
                this._matrix = mul(this._parent.matrix, this._matrix);
            }

            for (const child of this._children) {
                child._staleMatrix = true
            }
        }

        return this._matrix;
    }

    private get staleMatrix() { return this._staleMatrix || this._parent?.staleMatrix; }

    constructor();
    constructor(vertices: number[], uvs: number[], color: number[]);
    constructor(vertices?: number[], uvs?: number[], color?: number[]) {
        const ref = this;
        this.position = {
            _x: 0,
            _y: 0,
            _z: 0,
            get x() { return this._x; },
            get y() { return this._y; },
            get z() { return this._z; },
            set x(v: number) {
                if (this._x != v) {
                    this._x = v;
                    ref._staleMatrix = true;
                }
            },
            set y(v: number) {
                if (this._y != v) {
                    this._y = v;
                    ref._staleMatrix = true;
                }
            },
            set z(v: number) {
                if (this._z != v) {
                    this._z = v;
                    ref._staleMatrix = true;
                }
            },
        };

        this.scale = {
            _x: 1,
            _y: 1,
            get x() { return this._x; },
            get y() { return this._y; },
            set x(v: number) {
                if (this._x != v) {
                    this._x = v;
                    ref._staleMatrix = true;
                }
            },
            set y(v: number) {
                if (this._y != v) {
                    this._y = v;
                    ref._staleMatrix = true;
                }
            },
        };

        if (!vertices && !uvs) {
            // Empty object
            return;
        }

        if (vertices.length != uvs.length) {
            throw "Vertices and Uvs have to have the same length";
        }
        if (vertices.length * 2 != color.length) {
            throw "Each vertex requires a color with 4 elements";
        }

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        // Create a buffer for the square's positions.
        const vert = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vert);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        const uv = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uv);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

        gl.vertexAttribPointer(programInfo.attribLocations.vertexUv, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexUv);

        const col = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, col);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);

        gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

        this.mesh = {
            vao,
            vert,
            uv,
            col,
            vertices: vertices.length / 2,
            type: gl.TRIANGLES
        };
    }

    updateData(vertices: number[], uvs: number[], color: number[]) {
        throw "Not implemented";
    }
}

let container = document.getElementById("canvasContainer") as HTMLDivElement;
let canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
let gl: WebGL2RenderingContext;

let root = new Set<RenderObject>();

let width = 1024;
let height = 900;

let projectionMatrix;

let programInfo: {
    program: WebGLProgram,
    attribLocations: {
        vertexPosition: number,
        vertexUv: number,
        vertexColor: number,
    },
    uniformLocations: {
        projectionMatrix: WebGLUniformLocation,
        modelViewMatrix: WebGLUniformLocation
    }
};

const vsSource =
    `attribute vec2 vertex;
attribute vec2 uv;
attribute vec4 color;

varying vec2 Uv;
varying vec4 Color;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(vertex, 0, 1);

    Uv = uv;
    Color = color;
}`;

const fsSource =
    `precision mediump float;

varying vec2 Uv;
varying vec4 Color;

uniform sampler2D texture;

void main() {
    vec4 col = texture2D(texture, Uv) * Color;
    if(col.a < 0.1) {
        discard;
    }
    gl_FragColor = col;
}`;

class FontAtlas {
    private texture: WebGLTexture;
    private size: number;
    private height: number;

    private chars: Map<string, {
        width: number,
        offset: number[],
        rect: number[]
        uv: number[],
        code: string,
        kerning: Map<string, number>
    }>;

    calcLineWidth(text: string) {
        let x = 0;
        let width = [];

        for (let i = 0; i < text.length; i++) {
            let c = text.charAt(i);

            switch (c) {
                case "\t":
                    x += this.chars.get(" ").width * 4;
                    break;
                case "\n":
                    width.push(x);
                    x = 0;
                    break;
                case " ":
                    x += this.chars.get(" ").width;
                    break;
                default: {
                    let char = this.chars.get(c);
                    if (!char) {
                        throw `Unknown character: '${char}'`;
                    }
                    x += char.width;
                    break;
                }
            }
        }
        width.push(x);

        return width;
    }

    createTextObject(text: string, size: number, center = false, color = [1, 1, 1, 1]) {
        let verts = [];
        let uvs = [];
        let colors = [];

        let x = 0;
        let y = 0;

        let width = 0;

        let scale = (size / this.size) * 1.9;

        let lines: number[];
        let currentLine = 0;
        if (center) {
            lines = this.calcLineWidth(text);
            width = Math.max(...lines);
        }

        for (let i = 0; i < text.length; i++) {
            let c = text.charAt(i);

            if (c == "\t") {
                let char = this.chars.get(" ");
                x += char.width * 4;
                if (x > width) {
                    width = x;
                }
                continue;
            }
            if (c == "\n") {
                x = 0;
                y += this.height;
                currentLine++;
                continue;
            }

            let char = this.chars.get(c);
            if (!char) {
                throw `Unknown character: '${char}'`;
            }

            if (c == " ") {
                x += char.width;
                if (x > width) {
                    width = x;
                }
                continue;
            }

            let x1 = (x + char.offset[0]) * scale;
            let y1 = (y + char.offset[1]) * scale;
            let w = char.rect[2] * scale;
            let h = char.rect[3] * scale;

            if (center) {
                x1 += ((width - lines[currentLine]) / 2) * scale;
            }

            verts.push(
                x1, y1,
                x1 + w, y1,
                x1, y1 + h,

                x1 + w, y1,
                x1 + w, y1 + h,
                x1, y1 + h
            );

            uvs.push(...char.uv);

            colors.push(
                ...color,
                ...color,
                ...color,

                ...color,
                ...color,
                ...color,
            );

            // TODO kerning
            x += char.width;
            if (x > width) {
                width = x;
            }
        }

        let obj = new RenderObject(verts, uvs, colors);
        obj.texture = this.texture;
        return {
            obj,
            width: width * scale,
            height: (y + this.height) * scale
        };
    }

    static async createFont(name = "aldrich_regular_64", width: number, height: number) {
        let obj = new FontAtlas();
        obj.texture = loadTexture(`./img/${name}.png`);

        let text = await (await (fetch(`./img/${name}.xml`))).text();
        let parser = new DOMParser();
        let xml = parser.parseFromString(text, "text/xml");

        let root = xml.querySelector("Font");

        obj.size = parseInt(root.getAttribute("size"));
        obj.height = parseInt(root.getAttribute("height"));

        obj.chars = new Map();

        function parseList(text: string) {
            return text.split(" ").map(x => parseInt(x));
        }

        for (const item of root.querySelectorAll("Char")) {
            let rect = parseList(item.getAttribute("rect"));
            let x = rect[0] / width;
            let y = rect[1] / height;
            let w = rect[2] / width;
            let h = rect[3] / height;

            let dat = {
                width: parseInt(item.getAttribute("width")),
                offset: parseList(item.getAttribute("offset")),
                uv: [
                    x, y,
                    x + w, y,
                    x, y + h,

                    x + w, y,
                    x + w, y + h,
                    x, y + h
                ],
                rect,
                code: item.getAttribute("code"),
                kerning: new Map<string, number>()
            };

            if (item.children.length != 0) {
                for (const kern of item.children) {
                    dat.kerning.set(kern.getAttribute("id"), parseInt(kern.getAttribute("advance")));
                }
            }

            obj.chars.set(dat.code, dat);
        }

        return obj;
    }
}

function loadShader(type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initShaderProgram(vsSource, fsSource) {
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadTexture(src: string | HTMLImageElement) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue

    let image: HTMLImageElement;

    if (src instanceof HTMLImageElement) {
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
        image = src;
    } else {
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
        image = new Image();
        image.src = src;
    }
    if (image.complete) {
        load();
    } else {
        image.onload = load;
    }

    function load() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);


        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        // gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        /*if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            throw "All textures should be power of 2";

            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }*/
    };

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

document.addEventListener("DOMContentLoaded", main);

function addObject(obj: RenderObject) {
    root.add(obj);
}
function removeObject(obj: RenderObject) {
    root.delete(obj);
}

function updateProjection() {
    projectionMatrix = createOrtho(0, width, 0, height, 10, -10);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
}

function resize(w: number, h: number) {
    width = w;
    height = h;

    canvas.width = w;
    canvas.height = h;

    gl.viewport(0, 0, w, h);
    updateProjection();
}

let rendering = false;
function startRenderLoop() {
    rendering = true;
    requestAnimationFrame(draw);
}

function stopRenderLoop() {
    rendering = false;
}

async function main() {
    gl = canvas.getContext("webgl2");

    const shaderProgram = initShaderProgram(vsSource, fsSource);

    programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'vertex'),
            vertexUv: gl.getAttribLocation(shaderProgram, "uv"),
            vertexColor: gl.getAttribLocation(shaderProgram, "color")
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };

    gl.useProgram(programInfo.program);

    gl.clearColor(0.5, 0.5, 0.5, 1.0);  // Clear to gray, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
    gl.enable(gl.BLEND);

    resize(container.clientWidth, container.clientHeight);

    // requestAnimationFrame(draw);
}

function draw() {
    if (container.clientWidth != width || container.clientHeight != height) {
        resize(container.clientWidth, container.clientHeight);
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (const item of root) {
        if (item.onUpdate) {
            item.onUpdate();
        }

        if (!item.visible) {
            continue;
        }

        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, item.matrix);

        if (item.texture != undefined) {
            gl.bindTexture(gl.TEXTURE_2D, item.texture);
        }

        gl.bindVertexArray(item.mesh.vao);
        gl.drawArrays(item.mesh.type, 0, item.mesh.vertices);
    }

    if (rendering) {
        requestAnimationFrame(draw);
    }
}

let canvasInfo = {
    get canvas() { return canvas; },
    get width() { return width; },
    get height() { return height; }
}

export { addObject, removeObject, RenderObject, loadTexture, canvasInfo, startRenderLoop, stopRenderLoop, FontAtlas }