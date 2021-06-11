import { Context, GenericBuffer, ElementBuffer } from '.';
import { AttributeType, Primitive, PrimitiveMode } from '../mesh/mesh';

export class DrawablePrimitive {
    constructor(
        readonly id: number,
        readonly mode: PrimitiveMode,
        readonly vertexBuffer: GenericBuffer,
        readonly indexBuffer: ElementBuffer,
        readonly normalBuffer: GenericBuffer | null,
        readonly textureCoordBuffer: GenericBuffer | null,
        readonly materialId: number,
    ) {}

    static create(
        context: Context,
        scenePrimitive: Primitive,
    ): DrawablePrimitive {
        const attributeVertex = scenePrimitive.attributes.get(
            AttributeType.POSITION,
        );

        if (!attributeVertex) {
            throw new Error('No vertex data');
        }

        let texCoordBuffer: GenericBuffer | null = null;

        const texCoordData = scenePrimitive.attributes.get(
            AttributeType.TEXCOORD_0,
        );

        if (texCoordData) {
            texCoordBuffer = GenericBuffer.create(context.gl, texCoordData, 2);
        } else {
            console.warn('No texcoord data');
        }

        const vertexBuffer = GenericBuffer.create(
            context.gl,
            attributeVertex,
            3,
        );

        let normalBuffer: GenericBuffer | null = null;

        const attributesNormal = scenePrimitive.attributes.get(
            AttributeType.NORMAL,
        );
        if (attributesNormal) {
            normalBuffer = GenericBuffer.create(
                context.gl,
                attributesNormal,
                3,
            );
        } else {
            console.warn('No normal data');
        }

        let indexBuffer: ElementBuffer | null = null;

        if (scenePrimitive.indices) {
            indexBuffer = ElementBuffer.create(context, scenePrimitive.indices);
        } else {
            throw new Error('No indices.');
        }

        return new DrawablePrimitive(
            scenePrimitive.id,
            scenePrimitive.mode,
            vertexBuffer,
            indexBuffer,
            normalBuffer,
            texCoordBuffer,
            scenePrimitive.materialId,
        );
    }
}

export default class DrawableMesh {
    constructor(readonly primitives: DrawablePrimitive[]) {}

    static create(context: Context, primitives: Primitive[]): DrawableMesh {
        const drawablePrimitives = primitives.map((prim) =>
            DrawablePrimitive.create(context, prim),
        );

        return new DrawableMesh(drawablePrimitives);
    }
}
