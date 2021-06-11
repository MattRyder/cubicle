precision mediump float;

struct PointLight {
    vec3 position;
    vec3 color;
};

varying vec2 vTextureCoord;

//       |  R        |      G      |     B      |   A   |
// RT #0 |       Fragment Position XYZ          |       |
// RT #1 |        Diffuse Albedo RGB            |       |
// RT #2 |             Normal                   |       |
// RT #3 | Occlusion | Roughness | Metallic     |       |
uniform sampler2D uSamplerVertexPosition;
uniform sampler2D uSamplerDiffuseAlbedo;
uniform sampler2D uSamplerNormal;
uniform sampler2D uSamplerOcclusionMetallicRoughness;
uniform vec3 uEyePosition;
uniform PointLight uLight;

const float PI = 3.14159265359;
// ----------------------------------------------------------------------------
float DistributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;

    float nom = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return nom / max(denom, 0.0000001); // prevent divide by zero for roughness=0.0 and NdotH=1.0
}
// ----------------------------------------------------------------------------
float GeometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;

    float nom = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}
// ----------------------------------------------------------------------------
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}
// ----------------------------------------------------------------------------
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(max(1.0 - cosTheta, 0.0), 5.0);
}
// -----

void main() {
    vec4 texelVertexPosition = texture2D(uSamplerVertexPosition, vTextureCoord);
    vec4 texelDiffuseAlbedo = texture2D(uSamplerDiffuseAlbedo, vTextureCoord);
    vec4 texelNormal = texture2D(uSamplerNormal, vTextureCoord);
    vec4 texelORM = texture2D(uSamplerOcclusionMetallicRoughness, vTextureCoord);

    vec3 worldPosition = texelVertexPosition.rgb;
    float occlusion = texelORM.r;
    float roughness = texelORM.b;
    float metallic = texelORM.g;

    vec3 N = vec3(normalize(texelNormal));
    vec3 V = normalize(uEyePosition - worldPosition);

    // calculate the reflectance at normal incidence (or base reflectivity)
    // IF dia-electric (i.e. plastics) use F0 = 0.04
    // ELSE IF metal, use albedo color as F0
    vec3 F0 = vec3(0.4);
    // F0 = mix(F0, texelDiffuseAlbedo.rgb, metallic);

    // Outgoing reflectance equation
    vec3 Lo = vec3(0.0);

    // FOREACH light in lights
    {
        // Calculate per-light radiance
        vec3 L = normalize(uLight.position - worldPosition);

        // calculate half-way vector
        vec3 H = normalize(V + L);

        float distance = length(uLight.position - worldPosition);

        float attenuation = 1.0 / (distance * distance);

        vec3 radiance = uLight.color * attenuation;

        // Cook-Torrance BRDF 
        float NDF = DistributionGGX(N, H, roughness);
        float G = GeometrySmith(N, V, L, roughness);
        vec3 F = fresnelSchlick(clamp(dot(H, V), 0.0, 1.0), F0);

        vec3 numerator = NDF * G * F;
        float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
        vec3 specular = numerator / max(denominator, 0.001);

        // Ks = Fresnel
        vec3 kS = F;

        // The diffuse and specular can't be over 1.0 to conserve energy, these
        // will not be above 1.0 unless the surface emits light.
        vec3 kD = vec3(1.0) - kS;

        // multiply kD by the inverse metallic so that only non-metals will 
        // provide diffuse lighting, or a soft linear blend if partly metallic.
        kD *= 1.0 - metallic;

        float NdotL = max(dot(N, L), 0.0);

        // Add to outgoing radiance Lo
        Lo += (kD * texelDiffuseAlbedo.rgb / PI + specular) * radiance * NdotL;
    }

    vec3 ambient = vec3(0.03) * texelDiffuseAlbedo.rgb;

    vec3 color = ambient + Lo; //+ occlusion;

    // HDR tonemapping
    color = color / (color + vec3(1.0));
    // gamma correct
    color = pow(color, vec3(1.0 / 2.2));

    gl_FragColor = vec4(color, 1.0);
}
