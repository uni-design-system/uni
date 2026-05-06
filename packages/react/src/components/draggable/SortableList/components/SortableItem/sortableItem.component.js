import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableItemContext } from './sortableItem.context';
export const SortableItem = ({ children, id, style: userStyle, onRemove, }) => {
    const { attributes, isDragging, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({
        id,
    });
    const context = useMemo(() => ({
        attributes,
        listeners,
        ref: setActivatorNodeRef,
    }), [attributes, listeners, setActivatorNodeRef]);
    const style = {
        opacity: isDragging ? 0.4 : undefined,
        transform: CSS.Translate.toString(transform),
        transition,
        listStyle: 'none',
        ...userStyle,
    };
    return (_jsx(SortableItemContext.Provider, { value: context, children: _jsx("li", { className: "SortableItem", ref: setNodeRef, style: style, children: children }) }));
};
