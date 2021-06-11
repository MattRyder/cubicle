#version 300 es
precision mediump float;

const int MAX_TEXTURE_COUNT = 4;

in vec4 vPosition;
in vec2 vTextureCoord;
in vec3 vNormal;

uniform sampler2D uSampler[MAX_TEXTURE_COUNT];

layout(location = 0) out vec4 outColor0;
layout(location = 1) out vec4 outColor1;
layout(location = 2) out vec4 outColor2;

void main() {
    vec2 uv = vec2(vTextureCoord.x, vTextureCoord.y);

    vec4 diffuseColor = texture(uSampler[0], uv);

    if(diffuseColor.a < 0.2) {
        discard;
    }

    outColor0 = vPosition;
    outColor1 = texture(uSampler[0], uv);
    outColor2 = vec4(vNormal, 1.0);
}
