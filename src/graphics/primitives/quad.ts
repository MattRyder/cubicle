import { Context } from '..';
import { Primitive, AttributeType, PrimitiveMode } from '../../mesh/mesh';
import DrawableMesh from '../drawableMesh';

/* eslint-disable */
// prettier-ignore
const vertices = [
    -1, -1, 0,  // bottom left corner
    -1,  1, 0,  // top left corner
     1,  1, 0,  // top right corner
     1, -1, 0   // bottom right corner
];

/* eslint-disable */
// prettier-ignore
const indices = [
    0,1,2, // first triangle (bottom left - top left - top right)
    0,2,3  // second triangle (bottom left - top right - bottom right)
];

/* eslint-disable */
// prettier-ignore
const texCoords = [
    0.0,  0.0,
    0.0,  1.0,
    1.0,  1.0,
    1.0,  0.0,
]

const primitive: Primitive = {
    id: 0,
    attributes: new Map<AttributeType, Float32Array>([
        [AttributeType.POSITION, new Float32Array(vertices)],
        [AttributeType.TEXCOORD_0, new Float32Array(texCoords)],
    ]),
    indices: new Uint16Array(indices),
    materialId: 0,
    mode: PrimitiveMode.TRIANGLES,
};

export default class QuadPrimitive {
    constructor(readonly quadModel: DrawableMesh) {}

    static create(context: Context): QuadPrimitive {
        const model = DrawableMesh.create(context, [primitive]);

        return new QuadPrimitive(model);
    }
}
