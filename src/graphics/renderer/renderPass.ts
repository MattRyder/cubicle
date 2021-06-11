import { ShaderProgram } from '..';

export default abstract class RenderPass {
    protected readonly _name: string;
    protected readonly _shaderProgram: ShaderProgram;

    constructor(name: string, shaderProgram: ShaderProgram) {
        this._name = name;
        this._shaderProgram = shaderProgram;
    }
}
