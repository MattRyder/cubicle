import { PointLight } from '../../lighting/pointLight';

export class LightManager {
    private readonly _lights: PointLight[];
    private _movement: number;

    constructor() {
        this._lights = [];
        this._movement = 0;
    }

    addPointLight(pointLight: PointLight) {
        this._lights.push(pointLight);
    }

    get lights(): PointLight[] {
        return this._lights;
    }

    update() {
        this._movement += 0.025;

        this._lights.forEach((light) => {
            const { position } = light;

            position.y = 0.5 * Math.sin(this._movement);
        });
    }
}
