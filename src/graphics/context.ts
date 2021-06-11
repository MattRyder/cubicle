const WEBGL_CONTEXT = 'webgl2';

export interface ContextOptions {
    size: {
        width: number;
        height: number;
    };
}

/**
 * Class to hold the GL Context
 */
export default class Context {
    private readonly _canvas: HTMLCanvasElement;
    private readonly _options: ContextOptions;

    private _glContext: WebGL2RenderingContext | null;

    constructor(canvas: HTMLCanvasElement, options: ContextOptions) {
        this._canvas = canvas;

        this._options = options;

        this._glContext = null;

        this.applyOptions(this._options);
    }

    get gl(): WebGL2RenderingContext {
        if (!this._glContext) {
            this._glContext = this._canvas.getContext(WEBGL_CONTEXT);

            if (this._glContext == null) {
                throw new Error('Failed to get WebGL context.');
            }
        }

        return this._glContext;
    }

    setSize(width: number, height: number) {
        if (width <= 0 || height <= 0) {
            console.warn(
                `Ignoring canvas size change, given: 
                { width: ${width}, height: ${height} }`,
            );

            return;
        }

        this._canvas.width = width;

        this._canvas.height = height;
    }

    setClearColor(r: number, g: number, b: number, a: number) {
        this.gl.clearColor(r, g, b, a);
    }

    clear() {
        const mask = this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT;

        this.gl.clear(mask);
    }

    private applyOptions(options: ContextOptions) {
        if (options.size) {
            this.setSize(options.size.width, options.size.height);
        }
    }
}
