import * as Input from "../input.js";
import * as THREE from "three";

function clamp(v: number, min: number, max: number) {
    if (v < min) return min;
    if (v > max) return max;
    return v;
}

function GetBaseInput(): THREE.Vector3 { //returns the basic values, if it's 0 than it's not active.
    let p_Velocity = new THREE.Vector3();
    if (Input.GetKey(Input.KeyCode.W)) {
        p_Velocity.z += -1;
    }
    if (Input.GetKey(Input.KeyCode.S)) {
        p_Velocity.z += 1;
    }
    if (Input.GetKey(Input.KeyCode.A)) {
        p_Velocity.x += -1;
    }
    if (Input.GetKey(Input.KeyCode.D)) {
        p_Velocity.x += 1;
    }
    return p_Velocity;
}


export class FlyCam {
    private lastMouse = new THREE.Vector2();

    // regular speed
    private mainSpeed = 100;
    // multiplied by how long shift is held.  Basically running
    private shiftAdd = 250;
    // Maximum speed when holdin gshift
    private maxShift = 1000;
    // How sensitive it with mouse
    private camSens = 0.25;

    private totalRun = 1;

    private object: THREE.Object3D;

    private mousePosition = new THREE.Vector2();

    constructor(object: THREE.Object3D, element: HTMLElement) {
        this.object = object;

        element.addEventListener("mousemove", (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
        }, false);

        this.object.rotation.order = "ZYX";
    }

    update(delta: number) {
        if (Input.GetMouseButton(0)) {
            let dx = this.mousePosition.x - this.lastMouse.x;
            let dy = this.mousePosition.y - this.lastMouse.y;

            let x = (-dx * this.camSens) * Math.PI / 180;
            let y = (-dy * this.camSens) * Math.PI / 180;

            this.object.rotation.x = clamp(this.object.rotation.x + y, 0, Math.PI);
            this.object.rotation.z += x;
        }

        this.lastMouse.copy(this.mousePosition);
        // Mouse camera angle done.  

        //Keyboard commands
        var p = GetBaseInput();
        if (Input.GetKey(Input.KeyCode.LeftShift)) {
            this.totalRun += delta;
            p.multiplyScalar(this.totalRun * this.shiftAdd);
            p.x = clamp(p.x, -this.maxShift, this.maxShift);
            p.y = clamp(p.y, -this.maxShift, this.maxShift);
            p.z = clamp(p.z, -this.maxShift, this.maxShift);
        } else {
            this.totalRun = clamp(this.totalRun * 0.5, 1, 1000);
            p.multiplyScalar(this.mainSpeed);
        }

        p.applyEuler(this.object.rotation);
        p.multiplyScalar(delta);

        if (Input.GetKey(Input.KeyCode.Space)) { //If player wants to move on X and Z axis only
            let f = this.object.position.y;
            this.object.position.x += p.x;
            this.object.position.y = f;
            this.object.position.z += p.z;
        } else {
            this.object.position.x += p.x;
            this.object.position.y += p.y;
            this.object.position.z += p.z;
        }
    }
}
