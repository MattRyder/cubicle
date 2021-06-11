import { Material } from './material';
import { Mesh } from './mesh';
import { Node } from './node';
import { Image, Texture } from './texture';

export interface Scene {
    id: number;
    name: string;
    nodeIndices: number[];
}

export interface Asset {
    images: Image[];
    materials: Material[];
    meshes: Mesh[];
    nodes: Node[];
    scenes: Scene[];
    textures: Texture[];
    defaultSceneIndex: number;
}
