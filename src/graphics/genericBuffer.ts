export default class GenericBuffer {
    private readonly _buffer: WebGLBuffer;
    private readonly _elementCount: number;
    private readonly _numComponents: number;

    private constructor(
        buffer: WebGLBuffer,
        elementCount: number,
        numComponents: number,
    ) {
        this._buffer = buffer;

        this._elementCount = elementCount;

        this._numComponents = numComponents;
    }

    get buffer(): WebGLBuffer {
        return this._buffer;
    }

    get elementCount(): number {
        return this._elementCount;
    }

    get numberOfComponents(): number {
        return this._numComponents;
    }

    public static create(
        gl: WebGL2RenderingContext,
        elements: Float32Array,
        numberOfComponents: number,
    ): GenericBuffer {
        const buffer = this.createBuffer(gl);

        this.loadDataIntoBuffer(gl, buffer, elements);

        return new GenericBuffer(buffer, elements.length, numberOfComponents);
    }

    private static createBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
        const buffer = gl.createBuffer();

        if (!buffer) {
            throw new Error('Failed to create vertex buffer');
        }

        return buffer;
    }

    private static loadDataIntoBuffer(
        gl: WebGL2RenderingContext,
        buffer: WebGLBuffer,
        data: Float32Array,
    ) {
        if (data.length === 0) {
            console.warn('GenericBuffer: data is zero lengthed...');
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}
