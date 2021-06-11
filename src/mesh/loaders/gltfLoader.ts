import { Matrix4, Vector3 } from '@math.gl/core';
import { GltfLoader, GltfAsset, gltf } from 'gltf-loader-ts';
import {
    AttributeMap,
    AttributeType,
    Mesh,
    Primitive,
    PrimitiveMode,
} from '../mesh';
import { Node } from '../node';
import { Asset, Scene } from '../scene';
import { Material, PbrMetallicRoughness, TextureReference } from '../material';
import { Image, Texture } from '../texture';

export default class GlTFLoader {
    static async loadModelFromUri(uri: string): Promise<Asset | null> {
        const loader = new GltfLoader();

        const asset: GltfAsset = await loader.load(uri);

        const result = await this.loadAsset(asset);

        return result ?? null;
    }

    private static async loadAsset(
        asset: GltfAsset,
    ): Promise<Asset | undefined> {
        const gltfModel: gltf.GlTf = asset.gltf;

        console.dir(gltfModel);

        const defaultSceneIndex = gltfModel.scene ?? 0;

        const nodes = gltfModel.nodes ?
            await this.parseNodes(gltfModel.nodes) :
            [];

        const meshes = gltfModel.meshes ?
            await this.parseMeshes(asset, gltfModel.meshes) :
            [];

        const scenes = gltfModel.scenes ?
            this.parseScenes(gltfModel.scenes) :
            [];

        const materials = gltfModel.materials ?
            this.parseMaterials(gltfModel.materials) :
            [];

        const textures = gltfModel.textures ?
            gltfModel.textures.map((texture, index) =>
                this.loadTexture(texture, index),
            ) :
            [];

        const images = gltfModel.images ?
            await this.parseImages(asset, gltfModel.images) :
            [];

        return {
            defaultSceneIndex,
            images,
            materials,
            meshes,
            nodes,
            textures,
            scenes,
        };
    }

    private static async parseNodes(nodes: gltf.Node[]): Promise<Node[]> {
        const resPromises: Promise<Node>[] = nodes.map(
            (gltfNode: gltf.Node, index: number): Promise<Node> =>
                this.loadNode(gltfNode, index),
        );

        const items = await Promise.all(resPromises);

        return items.length > 0 ? items : [];
    }

    private static parseScenes(scenes: gltf.Scene[]): Scene[] {
        return scenes.map((scene: gltf.Scene, index: number) =>
            this.loadScene(scene, index),
        );
    }

    private static async parseImages(
        asset: GltfAsset,
        images: gltf.Image[],
    ): Promise<Image[]> {
        return Promise.all(
            images.map((scene: gltf.Image, index: number) =>
                this.loadImage(asset, scene, index),
            ),
        );
    }

    private static parseMaterials(materials: gltf.Material[]): Material[] {
        return materials.map((material: gltf.Material, index: number) =>
            this.loadMaterial(material, index),
        );
    }

    private static async parseMeshes(
        asset: GltfAsset,
        meshes: gltf.Mesh[],
    ): Promise<Mesh[]> {
        const resPromises: Promise<Mesh>[] = meshes.map(
            (gltfMesh: gltf.Mesh, index: number): Promise<Mesh> =>
                this.loadMesh(asset, gltfMesh, index),
        );

        const items = await Promise.all(resPromises);

        return items.length > 0 ? items : [];
    }

    private static async loadImage(
        asset: GltfAsset,
        image: gltf.Image,
        imageIndex: number,
    ): Promise<Image> {
        const imageData = await asset.imageData.get(imageIndex);

        return {
            id: imageIndex,
            uri: image.uri,
            imageData,
        };
    }

    private static loadScene(scene: gltf.Scene, sceneIndex: number): Scene {
        return {
            id: sceneIndex,
            name: scene.name,
            nodeIndices: scene.nodes ?? [],
        };
    }

    private static loadMaterial(
        material: gltf.Material,
        materialIndex: number,
    ): Material {
        const pbrMetallicRoughness = material.pbrMetallicRoughness;

        if (!pbrMetallicRoughness) {
            throw new Error('No pbrMetallicRoughness');
        }

        const baseColorTexture: TextureReference = {
            index: pbrMetallicRoughness.baseColorTexture?.index,
            scale: undefined,
            texCoords: pbrMetallicRoughness.baseColorTexture?.texCoord,
        };

        const metallicRoughnessTexture: TextureReference = {
            index: pbrMetallicRoughness.metallicRoughnessTexture?.index,
            scale: undefined,
            texCoords: pbrMetallicRoughness.metallicRoughnessTexture?.texCoord,
        };

        const normalTexture: TextureReference = {
            index: material.normalTexture?.index,
            scale: material.normalTexture?.scale,
            texCoords: material.normalTexture?.texCoord,
        };

        return {
            emissiveFactor: material.emissiveFactor,
            id: materialIndex,
            metallicRoughnessOptions: new PbrMetallicRoughness(
                pbrMetallicRoughness.baseColorFactor,
                baseColorTexture,
                pbrMetallicRoughness.metallicFactor,
                metallicRoughnessTexture,
                pbrMetallicRoughness.roughnessFactor,
            ),
            name: material.name,
            normalTexture,
        };
    }

    private static loadTexture(texture: gltf.Texture, index: number): Texture {
        return {
            id: index,
            sampler: texture.sampler,
            sourceImageReference: texture.source,
        };
    }

    private static async loadNode(
        node: gltf.Node,
        nodeIndex: number,
    ): Promise<Node> {
        return {
            id: nodeIndex,
            meshId: node.mesh,
            children: node.children,
            cachedWorldTransform: undefined,
            rotationMatrix: new Matrix4().fromQuaternion(
                node.rotation ?? Matrix4.ZERO,
            ),
            scaleVector: new Vector3(node.scale ?? [1, 1, 1]),
            translationVector: new Vector3(node.translation ?? Vector3.ZERO),
        };
    }

    private static async loadPrimitive(
        asset: GltfAsset,
        primitive: gltf.MeshPrimitive,
        index: number,
    ): Promise<Primitive> {
        const attributes: AttributeMap = new Map();

        function convertToFloatArray(
            buffer: Uint8Array,
            bytesPerElement: number,
        ): Float32Array {
            let iter = 0;
            const outputData = new Float32Array(
                buffer.length / bytesPerElement,
            );

            for (let i = 0; i < buffer.length; i += bytesPerElement) {
                const buf = new ArrayBuffer(bytesPerElement);
                const view = new DataView(buf);

                const data = buffer.slice(i, i + bytesPerElement);

                data.forEach((byte, index) => view.setUint8(index, byte));

                outputData[iter] = view.getFloat32(0, true);

                iter += 1;
            }

            return outputData;
        }

        const attributePromises = Object.entries(primitive.attributes).map(
            ([key, index]: [string, number]) =>
                new Promise<[AttributeType, Float32Array]>(
                    async (res, _rej) => {
                        const attributeData = await asset.accessorData(index);

                        const typedAttrData = convertToFloatArray(
                            attributeData,
                            Float32Array.BYTES_PER_ELEMENT,
                        );

                        return res([<AttributeType>key, typedAttrData]);
                    },
                ),
        );

        const completed = await Promise.all(attributePromises);

        let indices: Uint16Array | null = null;

        function convertToShortArray(buffer: Uint8Array): Uint16Array {
            let iter = 0;
            const outputData = new Uint16Array(buffer.length / 2);

            for (let i = 0; i < buffer.length; i += 2) {
                const buf = new ArrayBuffer(2);
                const view = new DataView(buf);

                const data = buffer.slice(i, i + 2);

                data.forEach((byte, index) => view.setUint8(index, byte));

                outputData[iter] = view.getUint16(0, true);

                iter += 1;
            }

            return outputData;
        }

        if (typeof primitive.indices !== 'undefined') {
            const indicesUintArray = await asset.accessorData(
                primitive.indices,
            );

            indices = convertToShortArray(indicesUintArray);
        }

        completed.map(([key, value]) => attributes.set(key, value));

        return {
            id: index,
            attributes,
            indices,
            materialId: primitive.material ?? 0,
            mode: primitive.mode ?? PrimitiveMode.TRIANGLES,
        };
    }

    private static async loadMesh(
        asset: GltfAsset,
        mesh: gltf.Mesh,
        index: number,
    ): Promise<Mesh> {
        const primitivePromises: Promise<Primitive>[] = mesh.primitives.map(
            (primitive, index) => this.loadPrimitive(asset, primitive, index),
        );

        const primitives = await Promise.all(primitivePromises);

        return {
            name: mesh.name,
            primitives,
            id: index,
        };
    }
}
