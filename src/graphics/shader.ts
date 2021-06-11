import { Context } from '.';

export interface ShaderOptions {
    type: number;
    source: string;
}

export default class Shader {
    private readonly _source: string;
    private readonly _type: number;
    private readonly _shader: WebGLShader;

    private constructor(shader: WebGLShader, type: number, source: string) {
        this._shader = shader;
        this._type = type;
        this._source = source;
    }

    get shader(): WebGLShader {
        return this._shader;
    }

    static create(context: Context, options: ShaderOptions) {
        const { type, source } = options;

        const shader = context.gl.createShader(type);

        if (!shader) {
            throw new Error('Failed to create shader');
        }

        context.gl.shaderSource(shader, source);

        context.gl.compileShader(shader);

        this.assertShaderCompileStatus(context.gl, shader);

        return new Shader(shader, type, source);
    }

    private static assertShaderCompileStatus(
        gl: WebGLRenderingContext,
        shader: WebGLShader,
    ) {
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const shaderLog = gl.getShaderInfoLog(shader);

            gl.deleteShader(shader);

            throw new Error(
                `Failed to compile shader.\nShader Log:\n${shaderLog}`,
            );
        }
    }
}
