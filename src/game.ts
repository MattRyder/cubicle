import { Vector3 } from '@math.gl/core';
import { Key } from 'w3c-keys';
import Camera from './camera';
import RenderPipeline, { RenderState } from './graphics/renderer/pipeline';
import { Keyboard } from './input';

interface GameState {
    renderState: RenderState;
    keyboard: Keyboard;
    camera: Camera;
}

export default class Game {
    private _lastFrameTime: number;

    private _gameState: GameState;

    private _renderPipeline: RenderPipeline;

    private _yaw: number;

    private _pitch: number;

    constructor(
        renderState: RenderState,
        keyboard: Keyboard,
        camera: Camera,
        renderPipeline: RenderPipeline,
    ) {
        this._lastFrameTime = 0;

        this._renderPipeline = renderPipeline;

        this._gameState = {
            renderState,
            keyboard,
            camera,
        };

        this._yaw = 0;

        this._pitch = 0;
    }

    frame(currentTime: number) {
        const deltaTime = this.getDeltaTime(currentTime);

        this._renderPipeline.render(
            this._gameState.camera,
            this._gameState.renderState,
        );

        this.update(deltaTime);

        // do shit here

        this._lastFrameTime = currentTime;

        const bindFrame = this.frame.bind(this);

        window.requestAnimationFrame((currentTime) => bindFrame(currentTime));
    }

    updateCamera(deltaTime: number) {
        const { keyboard } = this._gameState;

        const dir = new Vector3();

        const movespeed = 0.05;

        if (keyboard.isKeyDown(Key.w)) {
            dir[2] = movespeed;
        } else if (keyboard.isKeyDown(Key.s)) {
            dir[2] = -movespeed;
        }

        if (keyboard.isKeyDown(Key.a)) {
            dir[0] = movespeed;
        } else if (keyboard.isKeyDown(Key.d)) {
            dir[0] = -movespeed;
        }

        if (keyboard.isKeyDown(Key.q)) {
            this._yaw += -5 * (0.025 * deltaTime);
        } else if (keyboard.isKeyDown(Key.e)) {
            this._yaw += 5 * (0.025 * deltaTime);
        }

        this._gameState.camera.update(deltaTime, dir, this._pitch, this._yaw);
    }

    update(deltaTime: number) {
        this.updateCamera(deltaTime);

        this._gameState.renderState.lightManager.update();
    }

    private getDeltaTime(currentTime: number): number {
        return currentTime - this._lastFrameTime;
    }
}
