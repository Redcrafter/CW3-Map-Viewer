import { produceHighlighted } from "../highlighter.js";
import { addTab, selectTopTab } from "../mapEditor.js";
import { FlyCam } from "./FlyCam.js";
import { getModel, getTexture, getUnit } from "./assets.js";
import { MeshViewer } from "./meshViewer.js";
import { loadTexture } from "../util.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import * as THREE from 'three';
async function loadAtlas() {
    let img = new Image();
    img.src = "./cw4/img/atlas.png";
    await new Promise(resolve => img.onload = resolve);
    let tempCanvas = document.createElement("canvas");
    tempCanvas.width = 256;
    tempCanvas.height = 256;
    let context = tempCanvas.getContext("2d");
    var data = new Uint8Array(256 * 256 * 400 * 4);
    for (let x = 0; x < 20; x++) {
        for (let y = 0; y < 20; y++) {
            context.drawImage(img, x * 256, y * 256, 256, 256, 0, 0, 256, 256);
            let sub = context.getImageData(0, 0, 256, 256);
            data.set(sub.data, (x + y * 20) * 256 * 256 * 4);
        }
    }
    let tex = new THREE.DataArrayTexture(data, 256, 256, 400);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
    return tex;
}
async function genMapMesh(data) {
    let width = data.Width;
    let height = data.Height;
    let theme = data.World.Theme;
    let textureIds = theme.TextureId;
    let scales = theme.TextureScales;
    let colors = theme.TextureColor;
    let wallTexture = theme.WallTexture;
    let wallColor = theme.WallColor;
    let wallScale = 0.5 / theme.WallScale;
    let terrain = data.World.Terrain;
    let vertices = [];
    let uv = [];
    let color = [];
    function getUv(height, x, y) {
        let id = textureIds[height - 1];
        let scale = 0.5 / scales[height - 1];
        let x1 = x * scale;
        let y1 = y * scale;
        let x2 = x1 + scale;
        let y2 = y1 + scale;
        return {
            tl: [x1, y1, id],
            tr: [x2, y1, id],
            bl: [x1, y2, id],
            br: [x2, y2, id],
        };
    }
    function getH(x, y) {
        return terrain[x + (height - y - 1) * width];
    }
    let tempUv = [
        0, 0, wallTexture,
        1, 0, wallTexture,
        0, 1, wallTexture,
    ];
    function pushCol(count, col) {
        if (!col) {
            color.push(1, 1, 1, 1);
            return;
        }
        for (let i = 0; i < count; i++) {
            color.push(col.x, col.y, col.z, col.w);
        }
    }
    for (let x = 0; x < width - 1; x++) {
        for (let y = 0; y < height - 1; y++) {
            const tl = getH(x, y);
            const tr = getH(x + 1, y);
            const bl = getH(x, y + 1);
            const br = getH(x + 1, y + 1);
            let x1 = (x + y) * wallScale;
            let x2 = x1 + wallScale;
            let wallUv = {
                tl: [x1, 0, wallTexture],
                tr: [x2, 0, wallTexture],
                bl: [x1, wallScale, wallTexture],
                br: [x2, wallScale, wallTexture],
            };
            function tlt() {
                let uvs = getUv(tl, x, y);
                vertices.push(x, y, tl, x + 1, y, tl, x, y + 1, tl);
                uv.push(...uvs.tl, ...uvs.tr, ...uvs.bl);
            }
            function brt() {
                let uvs = getUv(br, x, y);
                vertices.push(x + 1, y, tr, x + 1, y + 1, br, x, y + 1, bl);
                uv.push(...uvs.tr, ...uvs.br, ...uvs.bl);
            }
            if (tl == tr && tl == bl && tl == br) {
                if (tl == 0) {
                    continue;
                }
                let col = colors[tl - 1];
                tlt();
                brt();
                pushCol(6, col);
                continue;
            }
            if (tl == tr && tl == bl) {
                if (tl != 0) {
                    tlt();
                    let col = colors[tl - 1];
                    pushCol(3, col);
                }
                vertices.push(x + 1, y, tr, x + 1, y + 1, br, x, y + 1, bl);
                uv.push(x1, tr * wallScale, wallTexture, x2, br * wallScale, wallTexture, x2, bl * wallScale, wallTexture);
                pushCol(3, wallColor);
                continue;
            }
            if (tl == tr && tl == br) {
                if (tl != 0) {
                    let uvs = getUv(tr, x, y);
                    vertices.push(x, y, tl, x + 1, y, tr, x + 1, y + 1, br);
                    uv.push(...uvs.tl, ...uvs.tr, ...uvs.br);
                    let col = colors[tl - 1];
                    pushCol(3, col);
                }
                vertices.push(x, y, tl, x + 1, y + 1, br, x, y + 1, bl);
                uv.push(x1, tl * wallScale, wallTexture, x2, br * wallScale, wallTexture, x2, bl * wallScale, wallTexture);
                pushCol(3, wallColor);
                continue;
            }
            if (tl == br && tl == bl) {
                if (tl != 0) {
                    let uvs = getUv(bl, x, y);
                    vertices.push(x, y, tl, x + 1, y + 1, br, x, y + 1, bl);
                    uv.push(...uvs.tl, ...uvs.br, ...uvs.bl);
                    let col = colors[tl - 1];
                    pushCol(3, col);
                }
                vertices.push(x, y, tl, x + 1, y, tr, x + 1, y + 1, br);
                uv.push(x1, tl * wallScale, wallTexture, x2, tr * wallScale, wallTexture, x2, br * wallScale, wallTexture);
                pushCol(3, wallColor);
                continue;
            }
            if (tr == br && tr == bl) {
                if (tr != 0) {
                    brt();
                    let col = colors[tr - 1];
                    pushCol(3, col);
                }
                vertices.push(x, y, tl, x + 1, y, tr, x, y + 1, bl);
                uv.push(x1, tl * wallScale, wallTexture, x2, tr * wallScale, wallTexture, x1, bl * wallScale, wallTexture);
                pushCol(3, wallColor);
                continue;
            }
            if (tl == tr || tr == br || br == bl || bl == tl) {
                vertices.push(x, y, tl, x + 1, y, tr, x + 1, y + 1, br, x, y, tl, x + 1, y + 1, br, x, y + 1, bl);
                if (tl == tr || bl == br) {
                    uv.push(x1, tl * wallScale, wallTexture, x2, tr * wallScale, wallTexture, x2, br * wallScale, wallTexture, x1, tl * wallScale, wallTexture, x2, br * wallScale, wallTexture, x1, bl * wallScale, wallTexture);
                }
                else {
                    uv.push(x2, tl * wallScale, wallTexture, x2, tr * wallScale, wallTexture, x1, br * wallScale, wallTexture, x2, tl * wallScale, wallTexture, x1, br * wallScale, wallTexture, x1, bl * wallScale, wallTexture);
                }
                pushCol(6, wallColor);
                continue;
            }
            if (tl == br && tr == bl) {
                if (tl > tr) {
                    vertices.push(x, y, tl, x + 1, y, tr, x + 1, y + 1, br, x, y, tl, x + 1, y + 1, br, x, y + 1, bl);
                    uv.push(...tempUv);
                    uv.push(...tempUv);
                }
                else {
                    vertices.push(x, y, tl, x + 1, y, tr, x, y + 1, bl, x + 1, y, tr, x + 1, y + 1, br, x, y + 1, bl);
                    uv.push(...tempUv);
                    uv.push(...tempUv);
                }
                pushCol(6, wallColor);
                continue;
            }
            if (tl == br) {
                vertices.push(x, y, tl, x + 1, y, tr, x + 1, y + 1, br, x, y, tl, x + 1, y + 1, br, x, y + 1, bl);
                uv.push(x1, tl * wallScale, wallTexture, x2, tr * wallScale, wallTexture, x2, br * wallScale, wallTexture, x1, tl * wallScale, wallTexture, x2, br * wallScale, wallTexture, x1, bl * wallScale, wallTexture);
                pushCol(6, wallColor);
                continue;
            }
            if (tr == bl) {
                vertices.push(x, y, tl, x + 1, y, tr, x, y + 1, bl, x + 1, y, tr, x + 1, y + 1, br, x, y + 1, bl);
                uv.push(x2, tl * wallScale, wallTexture, x1, tr * wallScale, wallTexture, x2, bl * wallScale, wallTexture, x1, tr * wallScale, wallTexture, x1, br * wallScale, wallTexture, x2, bl * wallScale, wallTexture);
                pushCol(6, wallColor);
                continue;
            }
            vertices.push(x, y, tl, x + 1, y, tr, x + 1, y + 1, br, x, y, tl, x + 1, y + 1, br, x, y + 1, bl);
            uv.push(...tempUv);
            uv.push(...tempUv);
            pushCol(6, wallColor);
        }
        let x1 = x * wallScale;
        let x2 = x1 + wallScale;
        vertices.push(x, 0, 0, x + 1, 0, getH(x + 1, 0), x, 0, getH(x, 0), x, 0, 0, x + 1, 0, 0, x + 1, 0, getH(x + 1, 0), x, height - 1, getH(x, height - 1), x + 1, height - 1, getH(x + 1, height - 1), x, height - 1, 0, x + 1, height - 1, getH(x + 1, height - 1), x + 1, height - 1, 0, x, height - 1, 0);
        uv.push(x1, 0, wallTexture, x2, getH(x + 1, 0) * wallScale, wallTexture, x1, getH(x, 0) * wallScale, wallTexture, x1, 0, wallTexture, x2, 0, wallTexture, x2, getH(x + 1, 0) * wallScale, wallTexture, x1, getH(x, height - 1) * wallScale, wallTexture, x2, getH(x + 1, height - 1) * wallScale, wallTexture, x1, 0, wallTexture, x2, getH(x + 1, height - 1) * wallScale, wallTexture, x2, 0, wallTexture, x1, 0, wallTexture);
        pushCol(12, wallColor);
    }
    for (let y = 0; y < height - 1; y++) {
        let x1 = y * wallScale;
        let x2 = x1 + wallScale;
        vertices.push(0, y, getH(0, y), 0, y + 1, getH(0, y + 1), 0, y, 0, 0, y + 1, getH(0, y + 1), 0, y + 1, 0, 0, y, 0, width - 1, y, 0, width - 1, y + 1, getH(width - 1, y + 1), width - 1, y, getH(width - 1, y), width - 1, y, 0, width - 1, y + 1, 0, width - 1, y + 1, getH(width - 1, y + 1));
        uv.push(x1, getH(0, y) * wallScale, wallTexture, x2, getH(0, y + 1) * wallScale, wallTexture, x1, 0, wallTexture, x2, getH(0, y + 1) * wallScale, wallTexture, x2, 0, wallTexture, x1, 0, wallTexture, x1, 0, wallTexture, x2, getH(width - 1, y + 1) * wallScale, wallTexture, x1, getH(width - 1, y) * wallScale, wallTexture, x1, 0, wallTexture, x2, 0, wallTexture, x2, getH(width - 1, y + 1) * wallScale, wallTexture);
        pushCol(12, wallColor);
    }
    var geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 3));
    geom.setAttribute("color", new THREE.Float32BufferAttribute(color, 4));
    geom.computeVertexNormals();
    let mat = new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: await (await fetch("cw4/cw4.vs")).text(),
        fragmentShader: await (await fetch("cw4/cw4.fs")).text(),
        uniforms: {
            diffuse: {
                value: await loadAtlas()
            }
        }
    });
    mat.needsUpdate = true;
    return new THREE.Mesh(geom, mat);
}
export function genUnitMesh(model) {
    if (model.Mesh)
        return model.Mesh;
    let verts = new Float32Array(model.Inds.length * 3);
    let uvs = new Float32Array(model.Inds.length * 2);
    let color = new Float32Array(model.Inds.length * 4);
    let normals = new Float32Array(model.Inds.length * 3);
    if (model.Colors.length == 0) {
        color.fill(1);
    }
    else {
        for (let i = 0; i < model.Inds.length; i++) {
            const ind = model.Inds[i];
            const col = model.Colors[ind];
            color[i * 4 + 0] = col.x;
            color[i * 4 + 1] = col.y;
            color[i * 4 + 2] = col.z;
            color[i * 4 + 3] = col.w;
        }
    }
    for (let i = 0; i < model.Inds.length; i++) {
        const ind = model.Inds[i];
        const vert = model.Verts[ind];
        const uv = model.Uvs[ind];
        const norm = model.Normals[ind];
        verts[i * 3 + 0] = vert.x;
        verts[i * 3 + 1] = vert.y;
        verts[i * 3 + 2] = vert.z;
        uvs[i * 2 + 0] = uv.x;
        uvs[i * 2 + 1] = uv.y;
        normals[i * 3 + 0] = norm.x;
        normals[i * 3 + 1] = norm.y;
        normals[i * 3 + 2] = norm.z;
    }
    let geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geom.setAttribute("color", new THREE.Float32BufferAttribute(color, 4));
    geom.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    model.Mesh = geom;
    return geom;
}
async function createObj(pack, cpackUnit) {
    let tex = THREE.Texture.DEFAULT_IMAGE;
    if (cpackUnit.Texture) {
        tex = await getTexture(cpackUnit.Texture);
        if (!tex) {
            let texture = pack.Textures?.find(x => x.Name == cpackUnit.Texture);
            if (texture) {
                tex = loadTexture(texture.Data);
            }
            else {
                console.warn(`Missing texture "${cpackUnit.Texture}"`);
            }
        }
    }
    let obj;
    if (cpackUnit.Model) {
        let mat = new THREE.MeshBasicMaterial({
            map: tex,
            vertexColors: true,
            color: new THREE.Color(cpackUnit.Color.x * cpackUnit.ColorBrightness, cpackUnit.Color.y * cpackUnit.ColorBrightness, cpackUnit.Color.z * cpackUnit.ColorBrightness)
        });
        if (obj = await getModel(cpackUnit.Model)) {
            let m = obj.children[0];
            mat.vertexColors = m.material.vertexColors;
            m.material = mat;
        }
        else {
            let model = pack.Models?.find(x => x.Name == cpackUnit.Model);
            if (model) {
                let geom = genUnitMesh(model);
                obj = new THREE.Mesh(geom, mat);
            }
            else {
                console.warn(`Missing model "${cpackUnit.Model}" from "${pack.Name}"`);
            }
        }
    }
    if (!obj)
        obj = new THREE.Group();
    obj.position.x = -cpackUnit.Position.x;
    obj.position.y = cpackUnit.Position.y;
    obj.position.z = cpackUnit.Position.z;
    obj.rotation.x = cpackUnit.Rotation.x * (Math.PI / 180);
    obj.rotation.y = -cpackUnit.Rotation.y * (Math.PI / 180);
    obj.rotation.z = cpackUnit.Rotation.z * (Math.PI / 180);
    obj.scale.x = cpackUnit.Scale.x;
    obj.scale.y = cpackUnit.Scale.y;
    obj.scale.z = cpackUnit.Scale.z;
    for (const x of cpackUnit.Children) {
        obj.add(await createObj(pack, x));
    }
    return obj;
}
class ListThing {
    root;
    top;
    contents;
    constructor(name) {
        this.root = document.createElement("div");
        this.root.classList.add("listThing");
        this.top = document.createElement("div");
        this.top.textContent = name;
        this.contents = document.createElement("div");
        this.root.append(this.top, this.contents);
    }
    add(name, callback) {
        let el = document.createElement("div");
        el.innerText = name;
        el.onclick = callback;
        this.contents.append(el);
    }
    clear() {
        while (this.contents.firstChild) {
            this.contents.removeChild(this.contents.firstChild);
        }
    }
}
export class cw4MapViewer {
    container;
    canvas;
    scene;
    renderer;
    clock;
    stats;
    camera;
    controls;
    mixers = [];
    constructor(canvas, container) {
        this.canvas = canvas;
        this.container = container;
        this.scene = new THREE.Scene();
        const light = new THREE.AmbientLight(0x808080);
        this.scene.add(light);
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.camera.position.z = 250;
        this.renderer = new THREE.WebGLRenderer({ canvas });
        this.controls = new FlyCam(this.camera, this.canvas);
        this.clock = new THREE.Clock();
        this.stats = new Stats();
        this.stats.dom.style.top = "initial";
        this.stats.dom.style.left = "initial";
        this.container.appendChild(this.stats.dom);
    }
    start() {
        this.stats.begin();
        let f = () => {
            this.update();
            requestAnimationFrame(f);
        };
        requestAnimationFrame(f);
    }
    update() {
        if (this.container.clientWidth != this.canvas.width || this.container.clientHeight != this.canvas.height) {
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
        }
        let delta = this.clock.getDelta();
        this.controls.update(delta);
        this.stats.update();
        for (const item of this.mixers) {
            item.update(delta);
        }
        this.renderer.render(this.scene, this.camera);
    }
    async loadMap(data) {
        this.start();
        const scale = 4;
        this.camera.position.x = (data.Width * scale) / 2;
        this.camera.position.y = -(data.Height * scale) / 2;
        let map = await genMapMesh(data);
        map.scale.x = scale;
        map.scale.y = -scale;
        map.scale.z = scale;
        this.scene.add(map);
        addTab({
            name: "Map Editor",
            closeAble: false,
            mainEl: this.container
        });
        let units = new Map();
        if (data.CPacks) {
            new CPackWindow(data.CPacks);
            selectTopTab(0);
            for (const item of data.CPacks) {
                if (item.Units) {
                    for (const unit of item.Units) {
                        units.set(unit.Guid, [item, unit]);
                    }
                }
            }
        }
        let objRoot = new THREE.Group();
        objRoot.rotation.x = Math.PI / 2;
        objRoot.scale.x = scale;
        objRoot.scale.y = scale;
        objRoot.scale.z = -scale;
        objRoot.position.y = -data.Height * scale + 4;
        for (const unit of data.Units) {
            let obj;
            let temp = await getUnit(unit.Guid);
            if (temp) {
                obj = temp.obj;
                if (temp.mixer)
                    this.mixers.push(temp.mixer);
            }
            else {
                let el = units.get(unit.Guid);
                if (!el) {
                    console.warn(`Missing unit "${unit.Guid}"`);
                    continue;
                }
                obj = await createObj(el[0], el[1].ObjRoot);
            }
            obj.position.x += unit.Position.x;
            obj.position.y += unit.Position.y;
            obj.position.z += unit.Position.z;
            objRoot.add(obj);
        }
        this.scene.add(objRoot);
    }
}
class CPackWindow {
    packs;
    packSelect;
    unitsEl;
    meshesEl;
    texturesEl;
    scriptsEl;
    controlEl;
    get selected() {
        return this.packs[this.packSelect.selectedIndex];
    }
    constructor(packs) {
        this.packs = packs;
        let cpackTab = addTab({
            name: "CPacks",
            closeAble: false
        });
        cpackTab.classList.add("cpack_main");
        let topBar = document.createElement("div");
        topBar.classList.add("cpack_topbar");
        this.packSelect = document.createElement("select");
        cpackTab.appendChild(this.packSelect);
        for (const item of packs) {
            let selectOption = document.createElement("option");
            selectOption.text = item.Name;
            this.packSelect.appendChild(selectOption);
        }
        let wikiButton = document.createElement("button");
        wikiButton.innerText = "Wiki";
        wikiButton.classList.add("button");
        wikiButton.onclick = () => {
            window.open(`https://knucklecracker.com/wiki/doku.php?id=cw4:cpack:docs:${this.selected.Guid}`, "_blank");
        };
        let exportButton = document.createElement("button");
        exportButton.innerText = "Export";
        topBar.append(this.packSelect, exportButton, wikiButton);
        this.meshesEl = new ListThing("Meshes");
        this.texturesEl = new ListThing("Textures");
        this.scriptsEl = new ListThing("Scripts");
        this.unitsEl = new ListThing("Units");
        let mainDiv = document.createElement("div");
        mainDiv.classList.add("cpack_sub");
        cpackTab.append(topBar, this.meshesEl.root, this.texturesEl.root, this.scriptsEl.root, this.unitsEl.root);
        this.packSelect.onchange = () => this.update();
        this.update();
    }
    update() {
        let pack = this.selected;
        this.unitsEl.clear();
        this.meshesEl.clear();
        this.texturesEl.clear();
        this.scriptsEl.clear();
        pack.Units?.forEach(x => this.unitsEl.add(x.Name, () => {
            let m = new MeshViewer(`${pack.Name} - ${x.Name}`);
            createObj(pack, x.ObjRoot).then(x => {
                m.addObject(x);
                m.start();
            });
        }));
        pack.Models?.forEach(x => this.meshesEl.add(x.Name, () => {
            let m = new MeshViewer(`${pack.Name} - ${x.Name}`);
            m.addModel(x);
            m.start();
        }));
        pack.Textures?.forEach(x => this.texturesEl.add(x.Name, () => {
            let tab = addTab({ name: `${pack.Name} - ${x.Name}.png` });
            tab.style.imageRendering = "pixelated";
            tab.style.display = "flex";
            tab.style.justifyContent = "center";
            tab.style.width = "100%";
            let img = new Image();
            img.style.objectFit = "contain";
            img.src = URL.createObjectURL(new Blob([x.Data.buffer], { type: "image/png" }));
            tab.appendChild(img);
        }));
        pack.Scripts?.forEach(x => this.scriptsEl.add(x.Name, () => {
            let tab = addTab({ name: `${pack.Name} - ${x.Name}` });
            tab.classList.add("crplCode");
            let highlight = document.createElement("div");
            produceHighlighted(x.Code, highlight);
            tab.appendChild(highlight);
        }));
    }
}
