import { Matrix4, toRadians, Vector2, Vector3 } from '@math.gl/core';

const VectorConstants: { [key: string]: Vector3 } = {
    Forward: new Vector3(0, 0, -1),
    Right: new Vector3(1, 0, 0),
    Up: new Vector3(0, 1, 0),
};

export interface CameraOptions {
    position: Vector3;
    lookAt: Vector3;
    width: number;
    height: number;
    zNear: number;
    zFar: number;
    fovDegrees: number;
    pitch: number;
    yaw: number;
}

interface Angles {
    value: number;
    rad: number;
    cos: number;
    sin: number;
}

function exportAngles(value: number): Angles {
    const rad = toRadians(value);

    return {
        value,
        rad,
        cos: Math.cos(rad),
        sin: Math.sin(rad),
    };
}

export default class Camera {
    private readonly _options: CameraOptions;

    private _projectionMatrix: Matrix4;

    private _positionCache: Vector3 | null;

    private _viewMatrix: Matrix4;

    private _forward: Vector3;

    private _up: Vector3;

    private _right: Vector3;

    private _lastYawPitch: Vector2;

    constructor(options: CameraOptions) {
        this._options = options;

        this._positionCache = null;

        this._viewMatrix = new Matrix4(Matrix4.IDENTITY);

        this._projectionMatrix = this.constructProjectionMatrix();

        this._forward = VectorConstants.Forward;

        this._right = VectorConstants.Right;

        this._up = VectorConstants.Up;

        this._lastYawPitch = new Vector2(Vector2.ZERO);
    }

    get projectionMatrix(): Matrix4 {
        return this._projectionMatrix;
    }

    get viewMatrix(): Matrix4 {
        return this._viewMatrix;
    }

    get position(): Vector3 {
        if (this._positionCache == null) {
            this._positionCache = new Vector3(
                this._viewMatrix[12],
                this._viewMatrix[13],
                this._viewMatrix[14],
            );
        }

        return this._positionCache;
    }

    set position(value: Vector3) {
        this._positionCache = null;

        this._viewMatrix[12] = value[0];
        this._viewMatrix[13] = value[1];
        this._viewMatrix[14] = value[2];
    }

    update(
        deltaTime: number,
        movementDirection: Vector3,
        pitch: number,
        yaw: number,
    ) {
        if (movementDirection.len() > 0) {
            const normalizedDirection = movementDirection.normalize();

            const appliedDirMovement = this.position.add(normalizedDirection);

            this.position = appliedDirMovement;
        }

        // Handle [x: Yaw, y: Pitch]
        const newYawPitch = new Vector2(yaw, pitch);
        const offset = this._lastYawPitch.sub(newYawPitch);

        const sensitivity = 0.0025 * deltaTime;
        offset.multiplyByScalar(sensitivity);

        this._options.yaw += offset.x;
        this._options.pitch += offset.y;

        this.constructViewMatrix(this._options.yaw, this._options.pitch);

        this._lastYawPitch = newYawPitch;
    }

    lookAt(target: Vector3) {
        this._viewMatrix.lookAt({
            eye: this.position,
            center: target,
            up: [0, 1, 0],
        });
    }

    private constructViewMatrix(yaw: number, pitch: number) {
        const yawAngles = exportAngles(yaw);
        const pitchAngles = exportAngles(pitch);

        const dx = yawAngles.cos * pitchAngles.cos;
        const dy = pitchAngles.sin;
        const dz = yawAngles.sin * pitchAngles.cos;

        this._forward = new Vector3(dx, dy, dz).normalize();

        const newTarget = new Vector3(this.position).add(this._forward);

        this.lookAt(newTarget);
    }

    private constructProjectionMatrix(): Matrix4 {
        const matrix = new Matrix4(Matrix4.IDENTITY);

        return matrix.perspective({
            aspect: this._options.width / this._options.height,
            far: this._options.zFar,
            near: this._options.zNear,
            fov: toRadians(this._options.fovDegrees),
        });
    }
}
