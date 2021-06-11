#version 300 es
precision mediump float;

in vec2 aTextureCoord;
in vec3 aVertexNormal;
in vec4 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec4 vPosition;
out vec2 vTextureCoord;
out vec3 vNormal;

void main() {
    vPosition = uModelMatrix * aVertexPosition;

    vTextureCoord = aTextureCoord;

    vNormal = aVertexNormal;

    gl_Position = uProjectionMatrix * uViewMatrix * vPosition;
}
