import { Matrix4, Vector3 } from '@math.gl/core';

export interface Node {
    id: number;
    children: number[] | undefined;
    meshId: number | undefined;
    rotationMatrix: Matrix4;
    scaleVector: Vector3;
    translationVector: Vector3;
    cachedWorldTransform: Matrix4 | undefined;
}

export function calculateNodeWorldTransform(
    node: Node,
    parentWorldTransform: Matrix4,
): Matrix4 {
    return new Matrix4(parentWorldTransform)
        .translate(node.translationVector)
        .multiplyRight(node.rotationMatrix)
        .scale(node.scaleVector);
}
