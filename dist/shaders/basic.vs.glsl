precision mediump float;

attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;

void main() {
  vTextureCoord = aTextureCoord;

  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
