import { Context, Framebuffer, ShaderProgram } from '..';
import Camera from '../../camera';
import readFileAsync from '../../io/File';
import { FramebufferOptions } from '../framebuffer';
import { ShaderProgramConfig } from '../shaderProgram';
import RenderPass from './renderPass';
import PbrBufferPass from './pbrBufferPass';
import PbrLightingPass from './PbrLightingPass';
import DrawQuadRenderPass from './drawQuadRenderPass';
import { LightManager } from '../data/lightManager';
import { AssetManager } from '../data/assetManager';

export enum RenderPassType {
    // eslint-disable-next-line no-unused-vars
    DrawQuadRenderPass = 'DrawQuadRenderPass',
    // eslint-disable-next-line no-unused-vars
    PbrBufferGenerationPass = 'PbrBufferGenerationPass',
    // eslint-disable-next-line no-unused-vars
    PbrLightingPass = 'PbrLightingPass',
}

export interface RenderState {
    assetManager: AssetManager;
    context: Context;
    lightManager: LightManager;
}

export interface RenderPipelineStageConfig {
    name: string;
    passType: RenderPassType;
    shaderProgram: ShaderProgramConfig;
}

export interface RenderPipelineOptions {
    framebuffer: FramebufferOptions;
    stages: RenderPipelineStageConfig[];
}

export default class RenderPipeline {
    private constructor(
        readonly drawQuadRenderPass: DrawQuadRenderPass | undefined,
        readonly pbrBufferGenerationRenderPass: PbrBufferPass | undefined,
        readonly pbrLightingPass: PbrLightingPass | undefined,
        readonly framebuffer: Framebuffer,
    ) {}

    static async create(context: Context, options: RenderPipelineOptions) {
        const frameBuffer = Framebuffer.create(context, options.framebuffer);

        context.gl.enable(context.gl.DEPTH_TEST);

        context.gl.depthFunc(context.gl.LEQUAL);

        return new RenderPipeline(
            <DrawQuadRenderPass>(
                await this.locateRenderPass(
                    context,
                    options.stages,
                    RenderPassType.DrawQuadRenderPass,
                )
            ),
            <PbrBufferPass>(
                await this.locateRenderPass(
                    context,
                    options.stages,
                    RenderPassType.PbrBufferGenerationPass,
                )
            ),
            <PbrLightingPass>(
                await this.locateRenderPass(
                    context,
                    options.stages,
                    RenderPassType.PbrLightingPass,
                )
            ),
            frameBuffer,
        );
    }

    render(camera: Camera, state: RenderState) {
        state.context.gl.bindFramebuffer(
            state.context.gl.FRAMEBUFFER,
            this.framebuffer.backingFramebuffer,
        );

        this.pbrBufferGenerationRenderPass?.render(camera, state);

        state.context.gl.bindFramebuffer(state.context.gl.FRAMEBUFFER, null);

        const textures = this.framebuffer.attachments.map((a) => a.texture);

        this.pbrLightingPass?.render(state.context, {
            camera,
            lightManager: state.lightManager,
            geometryBufferTextures: textures,
        });
    }

    private static async locateRenderPass(
        context: Context,
        stages: RenderPipelineStageConfig[],
        renderPassType: RenderPassType,
    ): Promise<RenderPass | null> {
        const renderPassConfig = stages.find(
            (s) => s.passType === renderPassType,
        );

        if (!renderPassConfig) {
            return null;
        }

        return await this.loadRenderPass(context, renderPassConfig);
    }

    private static async loadRenderPass(
        context: Context,
        config: RenderPipelineStageConfig,
    ): Promise<RenderPass> {
        const shaderProgram = await this.createShaderProgram(
            context,
            config.shaderProgram,
        );

        switch (config.passType) {
        case RenderPassType.DrawQuadRenderPass:
            return DrawQuadRenderPass.create(
                context,
                config.name,
                shaderProgram,
            );
        case RenderPassType.PbrBufferGenerationPass:
            return new PbrBufferPass(config.name, shaderProgram);
        case RenderPassType.PbrLightingPass:
            return PbrLightingPass.create(
                context,
                config.name,
                shaderProgram,
            );
        default:
            throw new Error(
                `Failed to locate constructor of the type:
                    ${config.passType} for ${config.name}`,
            );
        }
    }

    static async createShaderProgram(
        context: Context,
        options: ShaderProgramConfig,
    ): Promise<ShaderProgram> {
        const { attributes, fragmentShaderPath, uniforms, vertexShaderPath } =
            options;

        const vertexShaderSource = await readFileAsync(vertexShaderPath);

        const fragmentShaderSource = await readFileAsync(fragmentShaderPath);

        return ShaderProgram.create(context, {
            attributes,
            fragmentShaderSource,
            uniforms,
            vertexShaderSource,
        });
    }
}
