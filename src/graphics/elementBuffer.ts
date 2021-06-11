import { Context } from '.';

export default class ElementBuffer {
    private readonly _buffer: WebGLBuffer;
    private readonly _indexCount: number;

    private constructor(buffer: WebGLBuffer, indexCount: number) {
        this._buffer = buffer;

        this._indexCount = indexCount;
    }

    get buffer(): WebGLBuffer {
        return this._buffer;
    }

    get indexCount(): number {
        return this._indexCount;
    }

    static create(context: Context, indices: Uint16Array) {
        const indexBuffer = context.gl.createBuffer();

        if (indexBuffer == null) {
            throw new Error('Context failed to create element buffer.');
        }

        context.gl.bindBuffer(context.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        context.gl.bufferData(
            context.gl.ELEMENT_ARRAY_BUFFER,
            indices,
            context.gl.STATIC_DRAW,
        );

        return new ElementBuffer(indexBuffer, indices.length);
    }
}
