import { Matrix4 } from '@math.gl/core';
import { Context, DrawableMesh, ShaderProgram } from '..';
import Camera from '../../camera';
import { Material } from '../../mesh/material';
import { calculateNodeWorldTransform, Node } from '../../mesh/node';
import { CompleteAssetRecord } from '../data/assetManager';
import { DrawablePrimitive } from '../drawableMesh';
import Texture from '../texture';
import { RenderState } from './pipeline';
import {
    bindCamera,
    bindTextures,
    bindVertices,
    drawNew,
    TextureBindOptions,
} from './renderOps';
import RenderPass from './renderPass';

export default class PbrBufferPass extends RenderPass {
    constructor(name: string, shaderProgram: ShaderProgram) {
        super(name, shaderProgram);
    }

    render(camera: Camera, state: RenderState) {
        const { context, assetManager } = state;

        context.gl.useProgram(this._shaderProgram.program);

        context.clear();

        bindCamera(context, this._shaderProgram, camera, new Matrix4());

        assetManager.assets.forEach((asset) => {
            asset.asset.scenes.forEach((scene) => {
                const parentTransformMatrix = new Matrix4(Matrix4.IDENTITY);

                if (asset.asset.nodes) {
                    scene.nodeIndices.forEach((nodeIndex) => {
                        const currentNode = asset.asset.nodes.find(
                            (x) => x.id === nodeIndex,
                        );

                        if (currentNode) {
                            this.renderNode(
                                context,
                                this._shaderProgram,
                                asset,
                                parentTransformMatrix,
                                currentNode,
                            );
                        }
                    });
                }
            });
        });
    }

    private renderNode(
        context: Context,
        program: ShaderProgram,
        assetRecord: CompleteAssetRecord,
        parentWorldTransform: Matrix4,
        currentNode: Node,
    ) {
        if (!currentNode.cachedWorldTransform) {
            currentNode.cachedWorldTransform = calculateNodeWorldTransform(
                currentNode,
                parentWorldTransform,
            );
        }

        const nodeWorldTransform = currentNode.cachedWorldTransform;

        const drawableMeshRecord = assetRecord.drawableMeshRecords.find(
            (x) => x.id === currentNode.meshId,
        );

        if (drawableMeshRecord?.mesh) {
            this.drawMesh(
                context,
                program,
                assetRecord,
                nodeWorldTransform,
                drawableMeshRecord.mesh,
            );
        }

        currentNode.children?.forEach((childNodeIndex) => {
            const childNode = assetRecord.asset.nodes.find(
                (x) => x.id === childNodeIndex,
            );

            if (childNode) {
                this.renderNode(
                    context,
                    program,
                    assetRecord,
                    nodeWorldTransform,
                    childNode,
                );
            }
        });
    }

    private drawMesh(
        context: Context,
        program: ShaderProgram,
        assetRecord: CompleteAssetRecord,
        worldTransformMatrix: Matrix4,
        drawableMesh: DrawableMesh,
    ) {
        context.gl.uniformMatrix4fv(
            program.uniformLocations['uModelMatrix'],
            false,
            worldTransformMatrix,
        );

        drawableMesh.primitives.forEach((primitive) => {
            const material = assetRecord.asset.materials.find(
                (x) => x.id == primitive.materialId,
            );

            let textureBindOptions: TextureBindOptions[] = [];

            if (material) {
                textureBindOptions = this.generateTextureBindOptions(
                    material,
                    assetRecord.textures,
                );
            }

            this.drawPrimitive(context, program, primitive, textureBindOptions);
        });
    }

    private generateTextureBindOptions(
        material: Material,
        textures: Texture[],
    ): TextureBindOptions[] {
        const textureBindOptions: TextureBindOptions[] = [];

        const mrOptions = material.metallicRoughnessOptions;

        if (
            typeof mrOptions.baseColorTexture?.index === 'number' &&
            mrOptions.baseColorTexture?.index > -1
        ) {
            const texture = textures[mrOptions?.baseColorTexture?.index];
            textureBindOptions.push({
                attributeLocationName: `uDiffuseAlbedoSampler`,
                texture,
            });
        }

        if (
            typeof mrOptions.metallicRoughnessTexture?.index === 'number' &&
            mrOptions.metallicRoughnessTexture?.index > -1
        ) {
            const texture = textures[mrOptions.metallicRoughnessTexture.index];

            textureBindOptions.push({
                attributeLocationName: 'uMetallicRoughnessSampler',
                texture,
            });
        }

        if (
            typeof material.normalTexture?.index === 'number' &&
            material.normalTexture?.index > -1
        ) {
            const texture = textures[material.normalTexture.index];

            textureBindOptions.push({
                attributeLocationName: 'uNormalSampler',
                texture,
            });
        }

        return textureBindOptions;
    }

    private drawPrimitive(
        context: Context,
        program: ShaderProgram,
        primitive: DrawablePrimitive,
        textures: TextureBindOptions[],
    ) {
        bindVertices(
            context,
            program,
            primitive.vertexBuffer,
            primitive.indexBuffer,
            primitive.normalBuffer,
        );

        if (primitive.textureCoordBuffer) {
            bindTextures(
                context,
                program,
                primitive.textureCoordBuffer,
                textures,
            );
        }

        drawNew(context, primitive.indexBuffer.indexCount, primitive.mode);
    }
}
