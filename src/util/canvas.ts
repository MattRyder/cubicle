export function getCanvas(canvasId: string): HTMLCanvasElement {
    const canvasElement = <HTMLCanvasElement>document.getElementById(canvasId);

    if (!canvasElement) {
        throw Error(`Failed to find canvas with id: ${canvasId}`);
    }

    return canvasElement;
}
