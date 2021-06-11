import { Context, Texture } from '.';

type FramebufferAttachmentType = number;

export interface FramebufferOptions {
    width: number;
    height: number;
    attachments: FramebufferAttachmentOptions[];
}

export interface FramebufferAttachmentOptions {
    attachment: FramebufferAttachmentType;
    width: number;
    height: number;
}

export interface FramebufferAttachment {
    attachment: FramebufferAttachmentType;
    texture: Texture;
}

export default class Framebuffer {
    private readonly _framebuffer: WebGLFramebuffer;
    private readonly _attachments: FramebufferAttachment[];
    private readonly _width: number;
    private readonly _height: number;

    constructor(
        framebuffer: WebGLFramebuffer,
        attachments: FramebufferAttachment[],
        width: number,
        height: number,
    ) {
        this._framebuffer = framebuffer;
        this._attachments = attachments;
        this._width = width;
        this._height = height;
    }

    get backingFramebuffer(): WebGLFramebuffer {
        return this._framebuffer;
    }

    get attachments(): FramebufferAttachment[] {
        return this._attachments;
    }

    static create(context: Context, options: FramebufferOptions) {
        const framebuffer = context.gl.createFramebuffer();

        if (framebuffer == null) {
            throw new Error('The context failed to create a framebuffer.');
        }

        context.gl.bindFramebuffer(context.gl.FRAMEBUFFER, framebuffer);

        const attachments = options.attachments.map((attachmentOptions) =>
            this.createAttachment(context, attachmentOptions),
        );

        context.gl.drawBuffers(
            attachments.map((a) => context.gl.COLOR_ATTACHMENT0 + a.attachment),
        );

        this.createDepthRenderbuffer(context, options.width, options.height);

        const res = context.gl.checkFramebufferStatus(context.gl.FRAMEBUFFER);

        if (res != context.gl.FRAMEBUFFER_COMPLETE) {
            const errorMessage = function(status: number) {
                switch (status) {
                case context.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                    return 'FRAMEBUFFER_INCOMPLETE_ATTACHMENT';
                case context.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                    return 'FRAMEBUFFER_INCOMPLETE_DIMENSIONS';
                case context.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                    return 'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT';
                case context.gl.FRAMEBUFFER_UNSUPPORTED:
                    return 'FRAMEBUFFER_UNSUPPORTED';
                default:
                    return `Couldn't locate the error code for this one: 
                            ${status}`;
                }
            };
            throw new Error(
                `Failed to create a complete framebuffer. ${errorMessage(res)}`,
            );
        }

        context.gl.bindFramebuffer(context.gl.FRAMEBUFFER, null);
        context.gl.bindRenderbuffer(context.gl.RENDERBUFFER, null);
        context.gl.bindTexture(context.gl.TEXTURE_2D, null);

        return new Framebuffer(
            framebuffer,
            attachments,
            options.width,
            options.height,
        );
    }

    private static createDepthRenderbuffer(
        context: Context,
        width: number,
        height: number,
    ) {
        const depthBuffer = context.gl.createRenderbuffer();

        context.gl.bindRenderbuffer(context.gl.RENDERBUFFER, depthBuffer);

        context.gl.getExtension('EXT_color_buffer_float');

        context.gl.renderbufferStorage(
            context.gl.RENDERBUFFER,
            context.gl.DEPTH_COMPONENT16,
            width,
            height,
        );

        context.gl.framebufferRenderbuffer(
            context.gl.FRAMEBUFFER,
            context.gl.DEPTH_ATTACHMENT,
            context.gl.RENDERBUFFER,
            depthBuffer,
        );
    }

    private static createAttachment(
        context: Context,
        options: FramebufferAttachmentOptions,
    ): FramebufferAttachment {
        const { width, height, attachment } = options;

        const targetTexture = Texture.createEmpty(context, width, height);

        context.gl.framebufferTexture2D(
            context.gl.FRAMEBUFFER,
            context.gl.COLOR_ATTACHMENT0 + attachment,
            context.gl.TEXTURE_2D,
            targetTexture.texture,
            0,
        );

        return {
            attachment,
            texture: targetTexture,
        };
    }
}
