import Camera, { CameraOptions } from './camera';
import { Keyboard } from './input';
import { Context } from './graphics';
import RenderPipeline, { RenderState } from './graphics/renderer/pipeline';
import { getCanvas } from './util/canvas';
import Game from './game';
import GlTFLoader from './mesh/loaders/gltfLoader';
import { Vector3 } from '@math.gl/core';
import { LightManager } from './graphics/data/lightManager';
import { PointLight } from './lighting/pointLight';
import { AssetManager } from './graphics/data/assetManager';
import { Timer } from './util/timer';

declare global {
    // eslint-disable-next-line no-unused-vars
    interface Window {
        game: Game;
    }
}

/* eslint-disable-next-line no-unused-vars */
enum ModelNames {
    /* eslint-disable-next-line no-unused-vars */
    CesiumMilkTruck = 'CesiumMilkTruck',
    /* eslint-disable-next-line no-unused-vars */
    Sponza = 'Sponza',
    /* eslint-disable-next-line no-unused-vars */
    Suzanne = 'Suzanne',
    /* eslint-disable-next-line no-unused-vars */
    Lantern = 'Lantern',
}

const config = require('./config.json');

function createContext(canvasId: string): Context {
    const canvas = getCanvas(canvasId);

    const context = new Context(canvas, config.canvas);

    return context;
}

function setupClear(context: Context) {
    context.setClearColor(
        config.renderer.clearColor[0],
        config.renderer.clearColor[1],
        config.renderer.clearColor[2],
        config.renderer.clearColor[3],
    );
}

function setupInput() {
    return new Keyboard();
}

async function loadAsset(
    context: Context,
    assetManager: AssetManager,
    modelName: string,
) {
    const asset = await GlTFLoader.loadModelFromUri(
        `http://localhost:5000/2.0/${modelName}/glTF/${modelName}.gltf`,
    );

    if (!asset) {
        console.warn(`Failed to load asset: ${modelName}`);

        return;
    }

    assetManager.addAsset(context, asset);
}

async function initRenderer(
    canvasId: string,
    assetManager: AssetManager,
    lightManager: LightManager,
): Promise<RenderState> {
    const context = createContext(canvasId);

    setupClear(context);

    await loadAsset(context, assetManager, ModelNames.Lantern);

    // await loadAsset(context, assetManager, ModelNames.Sponza);

    const light = new PointLight(
        new Vector3(0, -1, -1),
        new Vector3(300.0, 300.0, 300.0),
    );

    lightManager.addPointLight(light);

    return {
        context,
        lightManager,
        assetManager,
    };
}

function setupCamera(options: CameraOptions): Camera {
    const camera = new Camera(options);

    camera.position = new Vector3(
        config.camera.position[0],
        config.camera.position[1],
        config.camera.position[2],
    );

    camera.lookAt(config.camera.lookAt);

    return camera;
}

document.body.onload = async function() {
    console.log(`[cubicle.dev engine] ${config.motd}`);

    const initTimer = new Timer({ logToConsole: true, idenfier: 'Game Init' });

    const lightManager = new LightManager();

    const assetManager = new AssetManager();

    const renderState = await initRenderer(
        config.canvas.id,
        assetManager,
        lightManager,
    );

    const keyboard = setupInput();

    const camera = setupCamera(config.camera);

    const renderPipeline = await RenderPipeline.create(
        renderState.context,
        config.renderPipeline,
    );

    window.game = new Game(renderState, keyboard, camera, renderPipeline);

    initTimer.finish();

    window.game.frame(0);
};
