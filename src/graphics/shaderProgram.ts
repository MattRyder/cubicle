import { Context, Shader } from '.';

export interface ShaderProgramConfig {
    vertexShaderPath: string;
    fragmentShaderPath: string;
    attributes: string[];
    uniforms: string[];
}

export interface ShaderProgramOptions {
    vertexShaderSource: string;
    fragmentShaderSource: string;
    attributes: string[];
    uniforms: string[];
}

interface AttributeLocationDictionary {
    [key: string]: GLuint;
}

interface UniformLocationDictionary {
    [key: string]: WebGLUniformLocation;
}

export default class ShaderProgram {
    private readonly _program: WebGLProgram;
    private readonly _attributeLocations: AttributeLocationDictionary;
    private readonly _uniformLocations: UniformLocationDictionary;

    private constructor(
        program: WebGLProgram,
        attributeLocations: AttributeLocationDictionary,
        uniformLocations: UniformLocationDictionary,
    ) {
        this._program = program;
        this._attributeLocations = attributeLocations;
        this._uniformLocations = uniformLocations;
    }

    get program(): WebGLProgram {
        return this._program;
    }

    get attributeLocations(): AttributeLocationDictionary {
        return this._attributeLocations;
    }

    get uniformLocations(): UniformLocationDictionary {
        return this._uniformLocations;
    }

    public static create(
        context: Context,
        options: ShaderProgramOptions,
    ): ShaderProgram {
        const {
            attributes,
            fragmentShaderSource,
            uniforms,
            vertexShaderSource,
        } = options;

        const vertexShader = Shader.create(context, {
            source: vertexShaderSource,
            type: context.gl.VERTEX_SHADER,
        });

        const fragmentShader = Shader.create(context, {
            source: fragmentShaderSource,
            type: context.gl.FRAGMENT_SHADER,
        });

        const program = context.gl.createProgram();

        if (!program) {
            throw new Error('Failed to create program.');
        }

        context.gl.attachShader(program, vertexShader.shader);

        context.gl.attachShader(program, fragmentShader.shader);

        context.gl.linkProgram(program);

        this.assertProgramLinkStatus(context.gl, program);

        context.gl.validateProgram(program);

        this.assertProgramValidateStatus(context.gl, program);

        const attributeDict = this.findAttributeLocations(
            context.gl,
            program,
            attributes,
        );

        const uniformDict = this.findUniformLocations(
            context.gl,
            program,
            uniforms,
        );

        return new ShaderProgram(program, attributeDict, uniformDict);
    }

    private static findAttributeLocations(
        gl: WebGLRenderingContext,
        program: WebGLProgram,
        attributes: string[],
    ) {
        const ID_NOT_FOUND = -1;

        const attributeDict: AttributeLocationDictionary = {};

        attributes.forEach((attribute) => {
            const id = (attributeDict[attribute] = gl.getAttribLocation(
                program,
                attribute,
            ));

            if (id == ID_NOT_FOUND) {
                console.warn(
                    `Could not find attribute location for: ${attribute}`,
                );
            }
        });

        return attributeDict;
    }

    private static findUniformLocations(
        gl: WebGLRenderingContext,
        program: WebGLProgram,
        uniforms: string[],
    ): UniformLocationDictionary {
        const uniformDict: UniformLocationDictionary = {};

        uniforms.forEach((uniform) => {
            const id = gl.getUniformLocation(program, uniform);

            if (id != null) {
                uniformDict[uniform] = id;
            } else {
                console.warn(`Could not find uniform location for: ${uniform}`);
            }
        });

        return uniformDict;
    }

    private static assertProgramLinkStatus(
        gl: WebGLRenderingContext,
        program: WebGLProgram,
    ) {
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Failed to link program.');
        }
    }

    private static assertProgramValidateStatus(
        gl: WebGLRenderingContext,
        program: WebGLProgram,
    ) {
        if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
            throw new Error('Failed to link program.');
        }
    }
}
