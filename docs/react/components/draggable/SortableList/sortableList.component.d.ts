import { CSSProperties, ReactNode } from '../../../../../../node_modules/.pnpm/react@18.3.1/node_modules/react';
import { UniqueIdentifier } from '@dnd-kit/core';
export interface SortableItemProps {
    id: UniqueIdentifier;
}
export interface SortableProps<T extends SortableItemProps> {
    items: T[];
    onChange(items: T[]): void;
    renderItem(item: T, index?: number): ReactNode;
    style?: CSSProperties;
}
export declare const SortableList: <T extends SortableItemProps>({ items, onChange, renderItem, style: userStyle, }: SortableProps<T>) => JSX.Element;
//# sourceMappingURL=sortableList.component.d.ts.map