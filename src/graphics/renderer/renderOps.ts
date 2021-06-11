import { Matrix4 } from '@math.gl/core';
import {
    Context,
    ElementBuffer,
    GenericBuffer,
    ShaderProgram,
    Texture,
} from '..';
import Camera from '../../camera';
import { PrimitiveMode } from '../../mesh/mesh';

export interface TextureBindOptions {
    attributeLocationName: string;
    texture: Texture;
}

export function bindTexture(
    context: Context,
    texture: WebGLTexture,
    uniformLocation: WebGLUniformLocation,
    slot: number,
) {
    context.gl.activeTexture(context.gl.TEXTURE0 + slot);

    context.gl.bindTexture(context.gl.TEXTURE_2D, texture);

    context.gl.uniform1i(uniformLocation, slot);
}

export function bindTextures(
    context: Context,
    program: ShaderProgram,
    textureCoordinateBuffer: GenericBuffer,
    textures: TextureBindOptions[],
) {
    const { buffer, numberOfComponents } = textureCoordinateBuffer;

    const textureVaoOpts = {
        numComponents: numberOfComponents,
        type: context.gl.FLOAT,
        normalized: false,
        stride: 0,
        offset: 0,
    };

    context.gl.bindBuffer(context.gl.ARRAY_BUFFER, buffer);

    context.gl.vertexAttribPointer(
        program.attributeLocations['aTextureCoord'],
        textureVaoOpts.numComponents,
        textureVaoOpts.type,
        textureVaoOpts.normalized,
        textureVaoOpts.stride,
        textureVaoOpts.offset,
    );

    context.gl.enableVertexAttribArray(
        program.attributeLocations['aTextureCoord'],
    );

    textures.forEach((tex, index) => {
        const { attributeLocationName, texture } = tex;

        const samplerLocation = program.uniformLocations[attributeLocationName];

        bindTexture(context, texture.texture, samplerLocation, index);
    });

    const texCountLocation = program.uniformLocations['uTextureCount'];
    if (texCountLocation) {
        context.gl.uniform1i(texCountLocation, textures.length);
    }
}

export function bindAttribute(
    context: Context,
    program: ShaderProgram,
    attribute: string,
    buffer: GenericBuffer,
) {
    const attributeLocation = program.attributeLocations[attribute];

    if (
        attributeLocation < 0 ||
        attributeLocation >= context.gl.MAX_VERTEX_ATTRIBS
    ) {
        console.log(`Attribute Location ${attribute} not present!`);

        return;
    }

    context.gl.bindBuffer(context.gl.ARRAY_BUFFER, buffer.buffer);

    const pointerOpts = {
        numComponents: buffer.numberOfComponents,
        type: context.gl.FLOAT,
        normalized: false,
        stride: 0,
        offset: 0,
    };

    context.gl.vertexAttribPointer(
        attributeLocation,
        pointerOpts.numComponents,
        pointerOpts.type,
        pointerOpts.normalized,
        pointerOpts.stride,
        pointerOpts.offset,
    );

    context.gl.enableVertexAttribArray(attributeLocation);
}

export function bindVertices(
    context: Context,
    program: ShaderProgram,
    vertexBuffer: GenericBuffer,
    indicesBuffer: ElementBuffer,
    normalBuffer: GenericBuffer | null,
) {
    bindAttribute(context, program, 'aVertexPosition', vertexBuffer);

    if (normalBuffer) {
        bindAttribute(context, program, 'aVertexNormal', normalBuffer);
    }

    context.gl.bindBuffer(
        context.gl.ELEMENT_ARRAY_BUFFER,
        indicesBuffer.buffer,
    );
}

export function bindCamera(
    context: Context,
    program: ShaderProgram,
    camera: Camera,
    modelViewMatrix: Matrix4,
) {
    context.gl.uniformMatrix4fv(
        program.uniformLocations['uProjectionMatrix'],
        false,
        camera.projectionMatrix,
    );

    context.gl.uniformMatrix4fv(
        program.uniformLocations['uViewMatrix'],
        false,
        camera.viewMatrix,
    );
}

export function draw(context: Context, indicesCount: number) {
    const params = {
        mode: context.gl.TRIANGLES,
        count: indicesCount,
        type: context.gl.UNSIGNED_SHORT,
        offset: 0,
    };

    context.gl.drawElements(
        params.mode,
        params.count,
        params.type,
        params.offset,
    );
}

export function drawNew(
    context: Context,
    indicesCount: number,
    mode: PrimitiveMode,
) {
    const glMode = (m: number) => {
        switch (m) {
        case PrimitiveMode.LINES:
            return context.gl.LINES;
        case PrimitiveMode.LINE_LOOP:
            return context.gl.LINE_LOOP;
        case PrimitiveMode.LINE_STRIP:
            return context.gl.LINE_STRIP;
        case PrimitiveMode.TRIANGLES:
            return context.gl.TRIANGLES;
        case PrimitiveMode.TRIANGLE_FAN:
            return context.gl.TRIANGLE_FAN;
        case PrimitiveMode.TRIANGLE_STRIP:
            return context.gl.TRIANGLE_STRIP;
        case PrimitiveMode.POINTS:
            return context.gl.POINTS;
        default:
            throw new Error(
                `Can't map this primitive mode to gl draw mode: ${m}`,
            );
        }
    };

    const params = {
        mode: glMode(mode),
        count: indicesCount,
        type: context.gl.UNSIGNED_SHORT,
        offset: 0,
    };

    context.gl.drawElements(
        params.mode,
        params.count,
        params.type,
        params.offset,
    );
}
