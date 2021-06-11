import { Context, Framebuffer, DrawableMesh, ShaderProgram } from '..';
import Camera from '../../camera';
import QuadPrimitive from '../primitives/quad';
import Texture from '../texture';
import { bindTextures, bindVertices, draw } from './renderOps';
import RenderPass from './renderPass';

export interface DrawQuadRenderPassOptions {
    framebuffer: Framebuffer | null;
    program: ShaderProgram;
}

export interface RenderState {
    context: Context;
    texture: Texture;
}

export default class DrawQuadRenderPass extends RenderPass {
    private readonly _quadModel: DrawableMesh;

    private constructor(
        name: string,
        shaderProgram: ShaderProgram,
        quadModel: DrawableMesh,
    ) {
        super(name, shaderProgram);

        this._quadModel = quadModel;
    }

    static create(
        context: Context,
        name: string,
        shaderProgram: ShaderProgram,
    ) {
        const quadModel = QuadPrimitive.create(context);

        return new DrawQuadRenderPass(name, shaderProgram, quadModel.quadModel);
    }

    render(camera: Camera, state: RenderState) {
        const { context } = state;

        context.gl.useProgram(this._shaderProgram.program);

        context.clear();

        const quadPrimitive = this._quadModel.primitives[0];

        bindVertices(
            context,
            this._shaderProgram,
            quadPrimitive.vertexBuffer,
            quadPrimitive.indexBuffer,
            null,
        );

        if (quadPrimitive.textureCoordBuffer) {
            bindTextures(
                context,
                this._shaderProgram,
                quadPrimitive.textureCoordBuffer,
                [
                    {
                        attributeLocationName: 'uSampler[0]',
                        texture: state.texture,
                    },
                ],
            );
        }

        draw(context, quadPrimitive.indexBuffer.indexCount);
    }
}
