import { Context, DrawableMesh, Texture } from '..';
import { Asset } from '../../mesh/scene';

export interface CompleteAssetRecord {
    asset: Asset;
    textures: Texture[];
    drawableMeshRecords: DrawableMeshRecord[];
}

export interface DrawableMeshRecord {
    id: number;
    mesh: DrawableMesh;
}

export class AssetManager {
    private readonly _assets: CompleteAssetRecord[];

    constructor() {
        this._assets = [];
    }

    get assets(): CompleteAssetRecord[] {
        return this._assets;
    }

    addAsset(context: Context, asset: Asset) {
        const record = this.createRecord(context, asset);

        record && this._assets.push(record);
    }

    private createRecord(context: Context, asset: Asset): CompleteAssetRecord {
        const textures = this.loadAssetTextures(context, asset);

        const drawableMeshRecords = this.loadAssetMeshes(context, asset);

        return {
            asset,
            drawableMeshRecords,
            textures,
        };
    }

    private loadAssetTextures(context: Context, asset: Asset): Texture[] {
        const textures: Texture[] = [];

        asset.textures.forEach((assetTexture) => {
            const image = asset.images.find(
                (x) => x.id == assetTexture.sourceImageReference,
            );

            if (!image) {
                throw new Error(
                    `Failed to find texture image with id: 
                    ${assetTexture.sourceImageReference}`,
                );
            }

            textures[assetTexture.id] = Texture.createFromTexImageSource(
                context,
                image.imageData,
            );
        });

        return textures;
    }

    private loadAssetMeshes(
        context: Context,
        asset: Asset,
    ): DrawableMeshRecord[] {
        const records: DrawableMeshRecord[] = [];

        asset.meshes.forEach((mesh) => {
            const drawableMesh = DrawableMesh.create(context, mesh.primitives);

            records[mesh.id] = {
                id: mesh.id,
                mesh: drawableMesh,
            };
        });

        return records;
    }
}
