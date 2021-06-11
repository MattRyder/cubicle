import { Context } from '.';

interface TextureParams {
    level: number;
    internalFormat: number;
    width: number;
    height: number;
    border: number;
    srcFormat: number;
    srcType: number;
    data: Uint8Array | null;
}

const DEFAULT_TEX_COLOR = [0, 0xff, 0, 0xff];

export default class Texture {
    private readonly _glTexture: WebGLTexture;

    private constructor(glTexture: WebGLTexture) {
        this._glTexture = glTexture;
    }

    get texture(): WebGLTexture {
        return this._glTexture;
    }

    static createEmpty(
        context: Context,
        width: number,
        height: number,
    ): Texture {
        const texture = context.gl.createTexture();

        // this might not be right...
        const format = context.gl.RGBA16F;

        const srcType = context.gl.FLOAT;

        // const format = context.gl.RGBA;

        // const srcType = context.gl.UNSIGNED_BYTE;

        if (!texture) {
            throw new Error('The GL context failed to create the Texture.');
        }

        context.gl.bindTexture(context.gl.TEXTURE_2D, texture);

        this.setTextureData(context, width, height, null, format, srcType);

        context.gl.bindTexture(context.gl.TEXTURE_2D, null);

        return new Texture(texture);
    }

    static createFromTexImageSource(
        context: Context,
        texImageSource: TexImageSource,
    ): Texture {
        const texture = context.gl.createTexture();

        if (!texture) {
            throw new Error('The GL context failed to create the Texture.');
        }

        context.gl.bindTexture(context.gl.TEXTURE_2D, texture);

        this.setTextureImage(context, texImageSource);

        this.setTextureParameters(
            context,
            texImageSource.width,
            texImageSource.height,
        );

        return new Texture(texture);
    }

    static createFromImage(context: Context, url: string): Texture {
        const texture = context.gl.createTexture();

        if (!texture) {
            throw new Error('The GL context failed to create the Texture.');
        }

        context.gl.bindTexture(context.gl.TEXTURE_2D, texture);

        this.setTextureData(
            context,
            1,
            1,
            new Uint8Array(DEFAULT_TEX_COLOR),
            context.gl.RGBA,
            context.gl.UNSIGNED_BYTE,
        );

        this.loadImageFromUrl(context, texture, url);

        context.gl.bindTexture(context.gl.TEXTURE_2D, null);

        return new Texture(texture);
    }

    private static loadImageFromUrl(
        context: Context,
        glTexture: WebGLTexture,
        url: string,
    ) {
        const image = new Image();

        const onLoad = () => {
            context.gl.bindTexture(context.gl.TEXTURE_2D, glTexture);

            this.setTextureImage(context, image);

            this.setTextureParameters(context, image.width, image.height);
        };

        image.onload = onLoad;

        image.src = url;
    }

    private static isPowerOfTwo(value: number): boolean {
        return (value & (value - 1)) == 0;
    }

    private static setTextureParameters(
        context: Context,
        width: number,
        height: number,
    ) {
        if (this.isPowerOfTwo(width) && this.isPowerOfTwo(height)) {
            context.gl.generateMipmap(context.gl.TEXTURE_2D);
        } else {
            context.gl.texParameteri(
                context.gl.TEXTURE_2D,
                context.gl.TEXTURE_WRAP_S,
                context.gl.CLAMP_TO_EDGE,
            );
            context.gl.texParameteri(
                context.gl.TEXTURE_2D,
                context.gl.TEXTURE_WRAP_T,
                context.gl.CLAMP_TO_EDGE,
            );
            context.gl.texParameteri(
                context.gl.TEXTURE_2D,
                context.gl.TEXTURE_MAG_FILTER,
                context.gl.LINEAR,
            );
        }
    }

    private static setTextureImage(context: Context, image: TexImageSource) {
        const texParams: TextureParams = {
            border: 0,
            height: 0,
            internalFormat: context.gl.RGBA,
            level: 0,
            srcFormat: context.gl.RGBA,
            srcType: context.gl.UNSIGNED_BYTE,
            width: 0,
            data: null,
        };

        context.gl.texImage2D(
            context.gl.TEXTURE_2D,
            texParams.level,
            texParams.internalFormat,
            texParams.srcFormat,
            texParams.srcType,
            image,
        );
    }

    private static setTextureData(
        context: Context,
        width: number,
        height: number,
        data: Uint8Array | null,
        format: number,
        srcType: number,
    ) {
        const texParams = {
            border: 0,
            height,
            internalFormat: format,
            level: 0,
            srcFormat: context.gl.RGBA,
            srcType: srcType,
            width,
            data,
        };

        context.gl.texImage2D(
            context.gl.TEXTURE_2D,
            texParams.level,
            texParams.internalFormat,
            texParams.width,
            texParams.height,
            texParams.border,
            texParams.srcFormat,
            texParams.srcType,
            data,
        );

        // if (srcType != context.gl.FLOAT) {
        context.gl.texParameteri(
            context.gl.TEXTURE_2D,
            context.gl.TEXTURE_WRAP_S,
            context.gl.CLAMP_TO_EDGE,
        );
        context.gl.texParameteri(
            context.gl.TEXTURE_2D,
            context.gl.TEXTURE_WRAP_T,
            context.gl.CLAMP_TO_EDGE,
        );
        context.gl.texParameteri(
            context.gl.TEXTURE_2D,
            context.gl.TEXTURE_MIN_FILTER,
            context.gl.LINEAR,
        );
        // }
    }
}
