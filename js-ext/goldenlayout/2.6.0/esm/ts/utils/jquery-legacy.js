import { pixelsToNumber } from './utils.js';
/** @internal */
export function getJQueryLeftAndTop(element) {
    const style = getComputedStyle(element, null);
    const leftAndTop = {
        left: pixelsToNumber(style.left),
        top: pixelsToNumber(style.top),
    };
    return leftAndTop;
}
//# sourceMappingURL=jquery-legacy.js.map