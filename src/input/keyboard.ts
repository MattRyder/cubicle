import { Key } from 'w3c-keys';

export default class Keyboard {
    private readonly _keyState: { [key: string]: boolean };

    constructor() {
        this._keyState = {};

        document.onkeydown = (ev: KeyboardEvent) => {
            const { key } = ev;

            this._keyState[key] = true;
        };

        document.onkeyup = (ev: KeyboardEvent) => {
            const { key } = ev;

            this._keyState[key] = false;
        };
    }

    isKeyDown(key: Key) {
        return this._keyState[key] == true;
    }
}
