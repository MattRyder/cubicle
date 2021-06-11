#version 300 es
precision mediump float;

const int MAX_TEXTURE_COUNT = 4;

in vec4 vWorldPosition;
in vec2 vTextureCoord;
in vec3 vWorldNormal;

// uSampler[0]: diffuseAlbedo [r, g, b]
// uSampler[1]: normalMap [r, g, b]
// uSampler[2]: metallicRoughness [r = occlusion, g = metallic, b = roughness]
uniform sampler2D uDiffuseAlbedoSampler;
uniform sampler2D uNormalSampler;
uniform sampler2D uMetallicRoughnessSampler;

//       |  R        |      G      |     B      |   A   |
// RT #0 |       Fragment Position XYZ          |       |
// RT #1 |        Diffuse Albedo RGB            |       |
// RT #2 |             Normal                   |       |
// RT #3 | Occlusion | Roughness | Metallic     |       |
layout(location = 0) out vec4 outColor0;
layout(location = 1) out vec4 outColor1;
layout(location = 2) out vec4 outColor2;
layout(location = 3) out vec4 outColor3;

void main() {
    vec2 uv = vec2(vTextureCoord.x, vTextureCoord.y);

    vec4 diffuseAlbedoColor = texture(uDiffuseAlbedoSampler, uv);

    if(vWorldNormal.b == 1203999.0) {
        discard; // hold vWorldNormal in place
    }

    if(diffuseAlbedoColor.a < 0.2) {
        discard;
    }

    vec4 normalColor = texture(uNormalSampler, uv);

    vec4 metalRoughnessColor = texture(uMetallicRoughnessSampler, uv);

    outColor0 = vWorldPosition;
    outColor1 = diffuseAlbedoColor;
    outColor2 = normalColor;
    outColor3 = metalRoughnessColor;
}
