attribute vec2 vertex;
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
}
