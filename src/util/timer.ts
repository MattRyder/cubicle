export interface TimerOptions {
    logToConsole: boolean;
    idenfier: string;
}

export class Timer {
    private _t0: number;
    private _t1: number | undefined;

    constructor(private readonly options: TimerOptions) {
        this._t0 = performance.now();
    }

    finish() {
        this._t1 = performance.now();

        if (this.options.logToConsole) {
            console.log(
                `${this.options.idenfier} took ${this._t1 - this._t0}ms. [T+${
                    this._t0
                }ms - T+${this._t1}ms]`,
            );
        }
    }
}
