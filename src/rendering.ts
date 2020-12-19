import { mul, rotateX, rotateY, rotateZ, scale, translate } from "./matrix.js";

class Mesh {
    public vao: WebGLVertexArrayObject;

    public vert: WebGLBuffer;
    public uv: WebGLBuffer;
    public col: WebGLBuffer;

    public vertices: number;

    public type: GLenum;

    constructor(shader: ShaderProgram, vertices: number[], uvs: number[], color: number[]) {
        if (vertices.length / shader.vertexSize != uvs.length / shader.uvSize) {
            throw "Vertices and Uvs have to have the same length";
        }
        if (vertices.length / shader.vertexSize != color.length / 4) {
            throw "Each vertex requires a color with 4 elements";
        }

        let gl = shader.gl;
        let attribLocations = shader.attribLocations;

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // Create a buffer for the square's positions.
        this.vert = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vert);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        gl.vertexAttribPointer(attribLocations.vertex, shader.vertexSize, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribLocations.vertex);

        this.uv = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uv);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

        gl.vertexAttribPointer(attribLocations.uv, shader.uvSize, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribLocations.uv);

        this.col = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.col);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);

        gl.vertexAttribPointer(attribLocations.color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribLocations.color);

        this.vertices = vertices.length / 2;
        this.type = gl.TRIANGLES;
    }
}

interface IVector3 {
    x: number;
    y: number;
    z: number;
}

class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    sub(other: Vector3) {
        return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    mul(val: number): Vector3;
    mul(val: Vector3): Vector3;
    mul(val: number | Vector3): Vector3 {
        if (val instanceof Vector3) {
            return new Vector3(this.x * val.x, this.y * val.y, this.z * val.z);
        } else {
            return new Vector3(this.x * val, this.y * val, this.z * val);
        }
    }

    rotateX(angle: number) {
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        [this.y, this.z] = [this.y * cos - this.z * sin, this.y * sin + this.z * cos];
    }
    rotateY(angle: number) {
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        [this.x, this.z] = [this.x * cos - this.z * sin, this.x * sin + this.z * cos];
    }
    rotateZ(angle: number) {
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        [this.x, this.y] = [this.x * cos - this.y * sin, this.x * sin + this.y * cos];
    }

    copy() {
        return new Vector3(this.x, this.y, this.z);
    }

    toString() {
        return `(${this.x}, ${this.y}, ${this.z})`
    }
}

class RenderObject {
    private _px = 0;
    private _py = 0;
    private _pz = 0;

    private _sx = 1;
    private _sy = 1;
    private _sz = 1;

    private _rx = 0;
    private _ry = 0;
    private _rz = 0;

    private _parent?: RenderObject;
    // private _children: Set<RenderObject> = new Set();
    private _children: RenderObject[] = [];

    private _staleMatrix = true;
    private _matrix: Float32Array;


    public visible = true;

    public mesh?: Mesh;
    public texture?: WebGLTexture;

    public onUpdate?: () => void;

    public position: IVector3;
    public rotation: IVector3;
    public scale: IVector3;

    get parent() { return this._parent; }
    set parent(v: RenderObject) {
        if (this._parent == v) return;

        if (this._parent) {
            // this._parent._children.delete(this);
            this._parent._children.splice(this._parent._children.indexOf(this));
        }

        this._parent = v;
        // this._parent._children.add(this);
        this._parent._children.push(this);
        this._staleMatrix = true;
    }

    get children() { return this._children; }

    private get staleMatrix() { return this._staleMatrix || this._parent?.staleMatrix; }
    get matrix() {
        if (this.staleMatrix) {
            this._matrix = mul(
                translate(this._px, this._py, this._pz),
                rotateZ(this._rz),
                rotateY(this._ry),
                rotateX(this._rx),
                scale(this._sx, this._sy, this._sz)
            );

            // reduce matrix multiplication cost by precalculating
            /*let sin = Math.sin(this._rx);
            let cos = Math.cos(this._rx);

            this._matrix = [
                cos * this.scale.x, -sin * this.scale.x, 0, this.position.x,
                sin * this.scale.y, cos * this.scale.y, 0, this.position.y,
                0, 0, 1, this.position.z,
                0, 0, 0, 1
            ];*/

            if (this._parent) {
                this._matrix = mul(this._parent.matrix, this._matrix);
            }

            for (const child of this._children) {
                child._staleMatrix = true
            }
            this._staleMatrix = false;
        }

        return this._matrix;
    }

    constructor(mesh?: Mesh) {
        this.mesh = mesh;

        const ref = this;
        this.position = {
            get x() { return ref._px; },
            get y() { return ref._py; },
            get z() { return ref._pz; },
            set x(v: number) { if (v != ref._px) { ref._px = v; ref._staleMatrix = true; } },
            set y(v: number) { if (v != ref._py) { ref._py = v; ref._staleMatrix = true; } },
            set z(v: number) { if (v != ref._pz) { ref._pz = v; ref._staleMatrix = true; } },
        };
        this.rotation = {
            get x() { return ref._rx; },
            get y() { return ref._ry; },
            get z() { return ref._rz; },
            set x(v: number) { if (v != ref._rx) { ref._rx = v; ref._staleMatrix = true; } },
            set y(v: number) { if (v != ref._ry) { ref._ry = v; ref._staleMatrix = true; } },
            set z(v: number) { if (v != ref._rz) { ref._rz = v; ref._staleMatrix = true; } },
        };
        this.scale = {
            get x() { return ref._sx; },
            get y() { return ref._sy; },
            get z() { return ref._sz; },
            set x(v: number) { if (v != ref._sx) { ref._sx = v; ref._staleMatrix = true; } },
            set y(v: number) { if (v != ref._sy) { ref._sy = v; ref._staleMatrix = true; } },
            set z(v: number) { if (v != ref._sz) { ref._sz = v; ref._staleMatrix = true; } },
        };
    }

    Translate(pos: Vector3) {
        this._px += pos.x;
        this._py += pos.y;
        this._pz += pos.z;
        this._staleMatrix = true;
    }

    draw(canvasInfo: ShaderProgram) {
        if (this.onUpdate) {
            this.onUpdate();
        }

        if (!this.visible) {
            return;
        }

        let gl: WebGL2RenderingContext = canvasInfo.gl;

        if (this.mesh) {
            gl.uniformMatrix4fv(canvasInfo.uniformLocations.modelViewMatrix, true, this.matrix);
            gl.bindTexture(gl.TEXTURE_2D, this.texture); // shit array

            gl.bindVertexArray(this.mesh.vao);
            gl.drawArrays(this.mesh.type, 0, this.mesh.vertices);
        }

        for (const child of this._children) {
            child.draw(canvasInfo);
        }
    }
}

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

    createTextObject(canvasInfo, text: string, size: number, center = false, color = [1, 1, 1, 1]) {
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

        let obj = new RenderObject(new Mesh(canvasInfo, verts, uvs, colors));
        obj.texture = this.texture;
        return {
            obj,
            width: width * scale,
            height: (y + this.height) * scale
        };
    }

    static async createFont(gl: WebGL2RenderingContext, name: string, width: number, height: number) {
        let obj = new FontAtlas();
        obj.texture = loadTexture(gl, `./img/${name}.png`);

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

function loadShader(gl: WebGL2RenderingContext, type: GLenum, source: string) {
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

class ShaderProgram {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;

    attribLocations: { vertex: number, uv: number, color: number };
    uniformLocations: { projectionMatrix: WebGLUniformLocation, modelViewMatrix: WebGLUniformLocation };

    vertexSize = 3;
    uvSize = 2;

    constructor(gl: WebGL2RenderingContext, vsSource: string, fsSource: string) {
        this.gl = gl;

        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program

        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        // If creating the shader program failed, alert

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(this.program));
            throw "Error";
        }

        this.attribLocations = {
            vertex: gl.getAttribLocation(this.program, 'vertex'),
            uv: gl.getAttribLocation(this.program, 'uv'),
            color: gl.getAttribLocation(this.program, 'color')
        };
        this.uniformLocations = {
            projectionMatrix: gl.getUniformLocation(this.program, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(this.program, 'uModelViewMatrix')
        };
    }

    use() {
        this.gl.useProgram(this.program);
    }
}

abstract class Renderer {
    protected container: HTMLElement;
    protected canvas: HTMLCanvasElement;
    protected gl: WebGL2RenderingContext;

    protected root = new Set<RenderObject>();

    protected width: number;
    protected height: number;

    protected shader: ShaderProgram;

    protected mouseX: number;
    protected mouseY: number;
    protected mouseDown: number;

    protected Time = {
        deltaTime: 0,
        time: 0
    };

    constructor(canvas: HTMLCanvasElement, container: HTMLElement) {
        this.container = container;
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl2");

        /*canvas.addEventListener("mousemove", (e) => {
            this.mouseX = e.offsetX;
            this.mouseY = e.offsetY;
        });*/
    }

    start() {
        let ref = this;
        function draw() {
            let now = performance.now() / 1000;
            ref.Time.deltaTime = now - ref.Time.time;
            ref.Time.time = now;

            ref.update();

            if (ref.container.clientWidth != ref.width || ref.container.clientHeight != ref.height) {
                ref.resize(ref.container.clientWidth, ref.container.clientHeight);
            }

            ref.gl.clear(ref.gl.COLOR_BUFFER_BIT | ref.gl.DEPTH_BUFFER_BIT);

            for (const item of ref.root) {
                item.draw(ref.shader);
            }

            requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
    }
    resize(w: number, h: number) {
        this.width = w;
        this.height = h;

        this.canvas.width = w;
        this.canvas.height = h;

        this.gl.viewport(0, 0, w, h);
        let projectionMatrix = this.createProjection();
        this.gl.uniformMatrix4fv(this.shader.uniformLocations.projectionMatrix, true, projectionMatrix);
    }

    // called at the start of each frame
    update() { };
    abstract init(): any;
    abstract createProjection(): Float32Array;
}

function loadTexture(gl: WebGL2RenderingContext, src: string | HTMLImageElement) {
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

export { Mesh, RenderObject, FontAtlas, loadTexture, Vector3, ShaderProgram, Renderer }
