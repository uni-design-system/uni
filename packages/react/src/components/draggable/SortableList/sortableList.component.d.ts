import { CSSProperties } from 'react';
import type { ReactNode } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
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