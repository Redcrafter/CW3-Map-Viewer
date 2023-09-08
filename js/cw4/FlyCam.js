import * as Input from "../input.js";
import * as THREE from "three";
function clamp(v, min, max) {
    if (v < min)
        return min;
    if (v > max)
        return max;
    return v;
}
function GetBaseInput() {
    let p_Velocity = new THREE.Vector3();
    if (Input.GetKey("KeyW")) {
        p_Velocity.z += -1;
    }
    if (Input.GetKey("KeyS")) {
        p_Velocity.z += 1;
    }
    if (Input.GetKey("KeyA")) {
        p_Velocity.x += -1;
    }
    if (Input.GetKey("KeyD")) {
        p_Velocity.x += 1;
    }
    return p_Velocity;
}
export class FlyCam {
    lastMouse = new THREE.Vector2();
    mainSpeed = 100;
    shiftAdd = 250;
    maxShift = 1000;
    camSens = 0.25;
    totalRun = 1;
    object;
    mousePosition = new THREE.Vector2();
    constructor(object, element) {
        this.object = object;
        element.addEventListener("mousemove", (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
        }, false);
        this.object.rotation.order = "ZYX";
    }
    update(delta) {
        if (Input.GetMouseButton(0)) {
            let dx = this.mousePosition.x - this.lastMouse.x;
            let dy = this.mousePosition.y - this.lastMouse.y;
            let x = (-dx * this.camSens) * Math.PI / 180;
            let y = (-dy * this.camSens) * Math.PI / 180;
            this.object.rotation.x = clamp(this.object.rotation.x + y, 0, Math.PI);
            this.object.rotation.z += x;
        }
        this.lastMouse.copy(this.mousePosition);
        var p = GetBaseInput();
        if (Input.GetKey("ShiftLeft")) {
            this.totalRun += delta;
            p.multiplyScalar(this.totalRun * this.shiftAdd);
            p.x = clamp(p.x, -this.maxShift, this.maxShift);
            p.y = clamp(p.y, -this.maxShift, this.maxShift);
            p.z = clamp(p.z, -this.maxShift, this.maxShift);
        }
        else {
            this.totalRun = clamp(this.totalRun * 0.5, 1, 1000);
            p.multiplyScalar(this.mainSpeed);
        }
        p.applyEuler(this.object.rotation);
        p.multiplyScalar(delta);
        if (Input.GetKey("Space")) {
            let f = this.object.position.y;
            this.object.position.x += p.x;
            this.object.position.y = f;
            this.object.position.z += p.z;
        }
        else {
            this.object.position.x += p.x;
            this.object.position.y += p.y;
            this.object.position.z += p.z;
        }
    }
}
