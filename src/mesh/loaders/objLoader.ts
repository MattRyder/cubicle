import { OBJ } from 'webgl-obj-loader';
import { Context, DrawableMesh } from '../../graphics';
import readFileAsync from '../../io/File';
import { AttributeType, Primitive, PrimitiveMode } from '../mesh';

// export interface ObjMesh {
//     mesh: Mesh;
//     material: MaterialLibrary;
//     workingDirectory: string;
// }

export default class ObjLoader {
    constructor() {}

    static async loadMesh(
        context: Context,
        workingDirectory: string,
        objFileName: string,
        mtlFileName: string,
    ): Promise<DrawableMesh> {
        const data = {
            obj: await readFileAsync(`${workingDirectory}/${objFileName}`),
            mtl: await readFileAsync(`${workingDirectory}/${mtlFileName}`),
        };

        const mesh = new OBJ.Mesh(data.obj);

        // / NEW
        const primitive: Primitive = {
            attributes: new Map<AttributeType, Float32Array>([
                [AttributeType.POSITION, new Float32Array(mesh.vertices)],
                [AttributeType.TEXCOORD_0, new Float32Array(mesh.textures)],
            ]),
            id: 1,
            indices: new Uint16Array(mesh.indices),
            materialId: 1,
            mode: PrimitiveMode.TRIANGLES,
        };

        return DrawableMesh.create(context, [primitive]);
        // / ./NEW

        // const material = new OBJ.MaterialLibrary(data.mtl);

        // return {
        //     workingDirectory,
        //     material,
        //     mesh,
        // };
    }
}
