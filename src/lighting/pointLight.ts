import { Vector3 } from '@math.gl/core';

export class PointLight {
    constructor(public position: Vector3, public color: Vector3) {}

    static create(position: Vector3, color: Vector3): PointLight {
        return new PointLight(position, color);
    }
}
