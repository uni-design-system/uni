import { DraggableSyntheticListeners } from '@dnd-kit/core';
interface Context {
    attributes: Record<string, any>;
    listeners: DraggableSyntheticListeners;
    ref(node: HTMLElement | null): void;
}
export declare const SortableItemContext: import("react").Context<Context>;
export {};
//# sourceMappingURL=sortableItem.context.d.ts.map