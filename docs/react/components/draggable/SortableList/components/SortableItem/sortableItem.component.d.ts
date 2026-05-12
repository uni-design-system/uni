import { CSSProperties, PropsWithChildren } from '../../../../../../../../node_modules/.pnpm/react@18.3.1/node_modules/react';
import { UniqueIdentifier } from '@dnd-kit/core';
export interface SortableItemProps {
    id: UniqueIdentifier;
    style?: CSSProperties;
    onRemove?(id: UniqueIdentifier): void;
}
export declare const SortableItem: ({ children, id, style: userStyle, onRemove, }: PropsWithChildren<SortableItemProps>) => JSX.Element;
//# sourceMappingURL=sortableItem.component.d.ts.map