let keys = new Set();
let leftDown = false;
let rightDown = false;
let middleDown = false;
document.body.addEventListener("keydown", (e) => {
    keys.add(e.code);
});
document.body.addEventListener("keyup", (e) => {
    keys.delete(e.code);
});
document.addEventListener("mousedown", (e) => {
    switch (e.button) {
        case 0:
            leftDown = true;
            break;
        case 1:
            middleDown = true;
            break;
        case 2:
            rightDown = true;
            break;
    }
});
document.addEventListener("mouseup", (e) => {
    switch (e.button) {
        case 0:
            leftDown = false;
            break;
        case 1:
            middleDown = false;
            break;
        case 2:
            rightDown = false;
            break;
    }
});
function GetKey(code) {
    return keys.has(code);
}
function GetKeyDown(code) {
    throw "Not implemented";
}
function GetKeyUp(code) {
    throw "Not implemented";
}
function GetMouseButton(button) {
    switch (button) {
        case 0: return leftDown;
        case 1: return rightDown;
        case 2: return middleDown;
        default: throw "Invalid mouse button number";
    }
}
export { GetKey, GetKeyDown, GetKeyUp, GetMouseButton };
