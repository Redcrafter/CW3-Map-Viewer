import { addTab } from "../mapEditor.js";
import { genUnitMesh } from "./cw4Display.js";
import { GetMouseButton } from "../input.js";
import { loadTexture } from "../util.js";
import * as THREE from 'three';
export class MeshViewer {
    tab;
    canvas;
    renderer;
    camera;
    scene;
    boom;
    running = false;
    constructor(name) {
        this.tab = addTab({
            name,
            onClose: () => this.running = false
        });
        this.tab.style.width = "100%";
        this.canvas = document.createElement("canvas");
        this.tab.appendChild(this.canvas);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
        this.scene = new THREE.Scene();
        const light = new THREE.AmbientLight(0x808080);
        this.scene.add(light);
        {
            this.camera = new THREE.OrthographicCamera();
            this.camera.position.set(0, 1000, 0);
            this.camera.lookAt(0, 0, 0);
            this.boom = new THREE.Group();
            this.boom.add(this.camera);
            this.scene.add(this.boom);
            this.boom.rotation.order = "ZYX";
            this.boom.rotation.x = 0.7853982;
            this.boom.scale.set(0.015, 0.015, 0.015);
        }
        {
            const geometry = new THREE.PlaneGeometry(9, 9);
            geometry.rotateX(-Math.PI / 2);
            const material = new THREE.MeshBasicMaterial({
                map: loadTexture("cw4/img/Grid9x9.png"),
                side: THREE.DoubleSide,
                transparent: true
            });
            const plane = new THREE.Mesh(geometry, material);
            plane.position.y = -0.0001;
            this.scene.add(plane);
        }
        this.canvas.addEventListener("mousemove", (e) => {
            if (GetMouseButton(0)) {
                this.boom.rotation.x -= e.movementY / 200;
                this.boom.rotation.y -= e.movementX / 200;
                this.boom.rotation.x = Math.min(Math.max(this.boom.rotation.x, 0), Math.PI);
            }
            if (GetMouseButton(1)) {
            }
        });
        this.canvas.addEventListener("wheel", (e) => {
            let factor = e.deltaY > 0 ? 1 / 1.1 : 1.1;
            this.boom.scale.x *= factor;
            this.boom.scale.y *= factor;
            this.boom.scale.z *= factor;
        });
    }
    addModel(model) {
        const geometry = genUnitMesh(model);
        const material = new THREE.MeshMatcapMaterial({ flatShading: true });
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
    }
    addObject(object) {
        this.scene.add(object);
    }
    start() {
        this.running = true;
        requestAnimationFrame(() => this.update());
    }
    update() {
        if (this.tab.clientWidth != this.canvas.width || this.tab.clientHeight != this.canvas.height) {
            this.renderer.setSize(this.tab.clientWidth, this.tab.clientHeight);
            this.camera.left = -this.tab.clientWidth / 2;
            this.camera.right = this.tab.clientWidth / 2;
            this.camera.top = this.tab.clientHeight / 2;
            this.camera.bottom = -this.tab.clientHeight / 2;
            this.camera.updateProjectionMatrix();
        }
        this.renderer.render(this.scene, this.camera);
        if (this.running)
            requestAnimationFrame(() => this.update());
    }
}
