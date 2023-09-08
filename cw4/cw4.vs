in vec3 position;
in vec3 uv;
in vec4 color;

out vec3 out_uv;
out vec4 out_color;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);

    out_uv = uv;
    out_color = color;
}
