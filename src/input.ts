const enum KeyCode {
    W = "KeyW",
    A = "KeyA",
    S = "KeyS",
    D = "KeyD",

    LeftShift = "ShiftLeft",
    Space = "Space"
}

let keys = new Set<string>();
let keyDown = new Set<string>();
let keyUp = new Set<string>();

let leftDown = false;
let rightDown = false;
let middleDown = false;

document.body.addEventListener("keydown", (e) => {
    keyDown.add(e.code);
    keys.add(e.code);
});
document.body.addEventListener("keyup", (e) => {
    keyUp.add(e.code);
    keys.delete(e.code);
});
document.addEventListener("mousedown", (e) => {
    switch (e.button) {
        case 0: leftDown = true; break;
        case 1: middleDown = true; break;
        case 2: rightDown = true; break;
    }
});
document.addEventListener("mouseup", (e) => {
    switch (e.button) {
        case 0: leftDown = false; break;
        case 1: middleDown = false; break;
        case 2: rightDown = false; break;
    }
});

function GetKey(code: KeyCode) {
    return keys.has(code);
}

function GetKeyDown(code: KeyCode) {
    return keyDown.has(code);
}

function GetKeyUp(code: KeyCode) {
    return keyUp.has(code);
}

export function UpdateKeys() {
    keyDown.clear();
    keyUp.clear();
}


/**
 * Returns whether the given mouse button is held down.
 * @param button 
 * 0 = left \
 * 1 = right \
 * 2 = middle
 */
function GetMouseButton(button: 0 | 1 | 2) {
    switch (button) {
        case 0: return leftDown;
        case 1: return rightDown;
        case 2: return middleDown;
        default: throw "Invalid mouse button number";
    }
}

export {
    GetKey,
    GetKeyDown,
    GetKeyUp,
    KeyCode,

    GetMouseButton
}