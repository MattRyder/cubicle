/* eslint-disable no-unused-vars */

export enum AttributeType {
    NORMAL = 'NORMAL',
    POSITION = 'POSITION',
    TANGENT = 'TANGENT',
    TEXCOORD_0 = 'TEXCOORD_0',
}

export enum PrimitiveMode {
    POINTS,
    LINES,
    LINE_LOOP,
    LINE_STRIP,
    TRIANGLES,
    TRIANGLE_STRIP,
    TRIANGLE_FAN,
}

export type AttributeMap = Map<AttributeType, Float32Array>;

export interface Primitive {
    id: number;
    attributes: AttributeMap;
    indices: Uint16Array | null;
    materialId: number;
    mode: PrimitiveMode;
}

export interface Mesh {
    primitives: Primitive[];
    name: string;
    id: number;
}
