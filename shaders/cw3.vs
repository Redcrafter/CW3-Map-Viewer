#version 300 es

in vec2 vertex;
in vec2 uv;
in vec4 color;

out vec2 Uv;
out vec4 Color;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(vertex, 0, 1);

    Uv = uv;
    Color = color;
}
