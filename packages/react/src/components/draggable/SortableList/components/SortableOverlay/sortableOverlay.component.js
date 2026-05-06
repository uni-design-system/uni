import { jsx as _jsx } from "react/jsx-runtime";
import { DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.4',
            },
        },
    }),
};
export const SortableOverlay = ({ children }) => (_jsx(DragOverlay, { dropAnimation: dropAnimationConfig, children: children }));
