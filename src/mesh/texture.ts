export interface Texture {
    id: number;
    sampler: number | undefined;
    sourceImageReference: number | undefined;
}

export interface Image {
    id: number;
    uri: string | undefined;
    imageData: TexImageSource;
}
