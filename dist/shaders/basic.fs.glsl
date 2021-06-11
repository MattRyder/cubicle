precision mediump float;

const int MAX_TEXTURE_COUNT = 4;

varying vec2 vTextureCoord;

uniform sampler2D uSampler[MAX_TEXTURE_COUNT];
uniform int uTextureCount;

void main() {
  for(int i = 0; i < MAX_TEXTURE_COUNT; i++) {
    if(i < uTextureCount) {
      gl_FragColor = texture2D(uSampler[i], vTextureCoord);
    }
  }
}
