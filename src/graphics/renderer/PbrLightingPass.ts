import { Matrix4, Vector3 } from '@math.gl/core';
import { Context, DrawableMesh, ShaderProgram, Texture } from '..';
import Camera from '../../camera';
import { LightManager } from '../data/lightManager';
import QuadPrimitive from '../primitives/quad';
import { bindCamera, bindTextures, bindVertices, draw } from './renderOps';
import RenderPass from './renderPass';

interface PbrLightingRenderState {
    camera: Camera;
    lightManager: LightManager;
    geometryBufferTextures: Texture[];
}

export default class PbrLightingPass extends RenderPass {
    private constructor(
        readonly name: string,
        readonly shaderProgram: ShaderProgram,
        readonly quadModel: DrawableMesh,
    ) {
        super(name, shaderProgram);
    }

    static create(
        context: Context,
        name: string,
        shaderProgram: ShaderProgram,
    ) {
        const quadModel = QuadPrimitive.create(context);

        return new PbrLightingPass(name, shaderProgram, quadModel.quadModel);
    }

    render(context: Context, renderState: PbrLightingRenderState) {
        const { geometryBufferTextures, camera, lightManager } = renderState;

        context.gl.useProgram(this._shaderProgram.program);

        context.clear();

        bindCamera(context, this._shaderProgram, camera, new Matrix4());

        bindVertices(
            context,
            this._shaderProgram,
            this.quadModel.primitives[0].vertexBuffer,
            this.quadModel.primitives[0].indexBuffer,
            null,
        );

        const eyePosition = new Vector3(
            camera.viewMatrix.invert().getColumn(3),
        );

        context.gl.uniform3fv(
            this._shaderProgram.uniformLocations['uEyePosition'],
            eyePosition,
        );

        context.gl.uniform3fv(
            this._shaderProgram.uniformLocations['uLight.color'],
            lightManager.lights[0].color,
        );

        context.gl.uniform3fv(
            this._shaderProgram.uniformLocations['uLight.position'],
            lightManager.lights[0].position,
        );

        if (this.quadModel.primitives[0].textureCoordBuffer) {
            bindTextures(
                context,
                this._shaderProgram,
                this.quadModel.primitives[0].textureCoordBuffer,
                [
                    {
                        attributeLocationName: 'uSamplerVertexPosition',
                        texture: geometryBufferTextures[0],
                    },
                    {
                        attributeLocationName: 'uSamplerDiffuseAlbedo',
                        texture: geometryBufferTextures[1],
                    },
                    {
                        attributeLocationName: 'uSamplerNormal',
                        texture: geometryBufferTextures[2],
                    },
                    {
                        attributeLocationName:
                            'uSamplerOcclusionMetallicRoughness',
                        texture: geometryBufferTextures[3],
                    },
                ],
            );
        }

        draw(context, this.quadModel.primitives[0].indexBuffer.indexCount);
    }
}
