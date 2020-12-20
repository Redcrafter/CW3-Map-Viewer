import { mul, rotateX, rotateY, rotateZ, scale, translate } from "./matrix.js";
class Mesh {
    constructor(shader, vertices, uvs, color) {
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
class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    sub(other) {
        return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
    }
    mul(val) {
        if (val instanceof Vector3) {
            return new Vector3(this.x * val.x, this.y * val.y, this.z * val.z);
        }
        else {
            return new Vector3(this.x * val, this.y * val, this.z * val);
        }
    }
    rotateX(angle) {
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        [this.y, this.z] = [this.y * cos - this.z * sin, this.y * sin + this.z * cos];
    }
    rotateY(angle) {
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        [this.x, this.z] = [this.x * cos - this.z * sin, this.x * sin + this.z * cos];
    }
    rotateZ(angle) {
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        [this.x, this.y] = [this.x * cos - this.y * sin, this.x * sin + this.y * cos];
    }
    copy() {
        return new Vector3(this.x, this.y, this.z);
    }
    toString() {
        return `(${this.x}, ${this.y}, ${this.z})`;
    }
}
class RenderObject {
    constructor(mesh) {
        this._px = 0;
        this._py = 0;
        this._pz = 0;
        this._sx = 1;
        this._sy = 1;
        this._sz = 1;
        this._rx = 0;
        this._ry = 0;
        this._rz = 0;
        this._children = [];
        this._staleMatrix = true;
        this.visible = true;
        this.mesh = mesh;
        const ref = this;
        this.position = {
            get x() { return ref._px; },
            get y() { return ref._py; },
            get z() { return ref._pz; },
            set x(v) { if (v != ref._px) {
                ref._px = v;
                ref._staleMatrix = true;
            } },
            set y(v) { if (v != ref._py) {
                ref._py = v;
                ref._staleMatrix = true;
            } },
            set z(v) { if (v != ref._pz) {
                ref._pz = v;
                ref._staleMatrix = true;
            } },
        };
        this.rotation = {
            get x() { return ref._rx; },
            get y() { return ref._ry; },
            get z() { return ref._rz; },
            set x(v) { if (v != ref._rx) {
                ref._rx = v;
                ref._staleMatrix = true;
            } },
            set y(v) { if (v != ref._ry) {
                ref._ry = v;
                ref._staleMatrix = true;
            } },
            set z(v) { if (v != ref._rz) {
                ref._rz = v;
                ref._staleMatrix = true;
            } },
        };
        this.scale = {
            get x() { return ref._sx; },
            get y() { return ref._sy; },
            get z() { return ref._sz; },
            set x(v) { if (v != ref._sx) {
                ref._sx = v;
                ref._staleMatrix = true;
            } },
            set y(v) { if (v != ref._sy) {
                ref._sy = v;
                ref._staleMatrix = true;
            } },
            set z(v) { if (v != ref._sz) {
                ref._sz = v;
                ref._staleMatrix = true;
            } },
        };
    }
    get parent() { return this._parent; }
    set parent(v) {
        if (this._parent == v)
            return;
        if (this._parent) {
            this._parent._children.splice(this._parent._children.indexOf(this));
        }
        this._parent = v;
        this._parent._children.push(this);
        this._staleMatrix = true;
    }
    get children() { return this._children; }
    get staleMatrix() { return this._staleMatrix || this._parent?.staleMatrix; }
    get matrix() {
        if (this.staleMatrix) {
            this._matrix = mul(translate(this._px, this._py, this._pz), rotateZ(this._rz), rotateY(this._ry), rotateX(this._rx), scale(this._sx, this._sy, this._sz));
            if (this._parent) {
                this._matrix = mul(this._parent.matrix, this._matrix);
            }
            for (const child of this._children) {
                child._staleMatrix = true;
            }
            this._staleMatrix = false;
        }
        return this._matrix;
    }
    Translate(pos) {
        this._px += pos.x;
        this._py += pos.y;
        this._pz += pos.z;
        this._staleMatrix = true;
    }
    draw(canvasInfo) {
        if (this.onUpdate) {
            this.onUpdate();
        }
        if (!this.visible) {
            return;
        }
        let gl = canvasInfo.gl;
        if (this.mesh) {
            gl.uniformMatrix4fv(canvasInfo.uniformLocations.modelViewMatrix, true, this.matrix);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.bindVertexArray(this.mesh.vao);
            gl.drawArrays(this.mesh.type, 0, this.mesh.vertices);
        }
        for (const child of this._children) {
            child.draw(canvasInfo);
        }
    }
}
class FontAtlas {
    calcLineWidth(text) {
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
    createTextObject(canvasInfo, text, size, center = false, color = [1, 1, 1, 1]) {
        let verts = [];
        let uvs = [];
        let colors = [];
        let x = 0;
        let y = 0;
        let width = 0;
        let scale = (size / this.size) * 1.9;
        let lines;
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
            verts.push(x1, y1, x1 + w, y1, x1, y1 + h, x1 + w, y1, x1 + w, y1 + h, x1, y1 + h);
            uvs.push(...char.uv);
            colors.push(...color, ...color, ...color, ...color, ...color, ...color);
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
    static async createFont(gl, name, width, height) {
        let obj = new FontAtlas();
        obj.texture = loadTexture(gl, `./img/${name}.png`);
        let text = await (await (fetch(`./img/${name}.xml`))).text();
        let parser = new DOMParser();
        let xml = parser.parseFromString(text, "text/xml");
        let root = xml.querySelector("Font");
        obj.size = parseInt(root.getAttribute("size"));
        obj.height = parseInt(root.getAttribute("height"));
        obj.chars = new Map();
        function parseList(text) {
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
                kerning: new Map()
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
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
class ShaderProgram {
    constructor(gl, vsSource, fsSource) {
        this.vertexSize = 3;
        this.uvSize = 2;
        this.gl = gl;
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
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
class Renderer {
    constructor(canvas, container) {
        this.root = new Set();
        this.Time = {
            deltaTime: 0,
            time: 0
        };
        this.container = container;
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl2");
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
    resize(w, h) {
        this.width = w;
        this.height = h;
        this.canvas.width = w;
        this.canvas.height = h;
        this.gl.viewport(0, 0, w, h);
        let projectionMatrix = this.createProjection();
        this.gl.uniformMatrix4fv(this.shader.uniformLocations.projectionMatrix, true, projectionMatrix);
    }
    update() { }
    ;
}
function loadTexture(gl, src) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);
    let image;
    if (src instanceof HTMLImageElement) {
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
        image = src;
    }
    else {
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
        image = new Image();
        image.src = src;
    }
    if (image.complete) {
        load();
    }
    else {
        image.onload = load;
    }
    function load() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    ;
    return texture;
}
export { Mesh, RenderObject, FontAtlas, loadTexture, Vector3, ShaderProgram, Renderer };
