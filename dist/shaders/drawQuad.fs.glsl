precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler[1];

void main() {
    gl_FragColor = texture2D(uSampler[0], vTextureCoord);
}
