precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSamplerAlbedo;
uniform sampler2D uSamplerPosition;
uniform sampler2D uSamplerNormal;

void main() {
    gl_FragColor = texture2D(uSamplerAlbedo, vTextureCoord);
}
