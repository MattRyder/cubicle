export interface TextureReference {
    index: number | undefined;
    scale: number | undefined;
    texCoords: number | undefined;
}

export class PbrMetallicRoughness {
    constructor(
        readonly baseColorFactor: number[] | undefined,
        readonly baseColorTexture: TextureReference | undefined,
        readonly metallicFactor: number | undefined,
        readonly metallicRoughnessTexture: TextureReference | undefined,
        readonly roughnessFactor: number | undefined,
    ) {
        if (
            typeof metallicFactor === 'number' &&
            (metallicFactor < 0 || metallicFactor > 1)
        ) {
            throw new Error('metallicFactor is out of range, must be 0.0-1.0.');
        }

        if (
            typeof roughnessFactor === 'number' &&
            (roughnessFactor < 0 || roughnessFactor > 1)
        ) {
            throw new Error('roughnessFactor is out of range, must be 0.0-1.0');
        }
    }
}

export interface Material {
    id: number;
    name: string;
    metallicRoughnessOptions: PbrMetallicRoughness;
    normalTexture: TextureReference;
    emissiveFactor: number[] | undefined;
}
