import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo, useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SortableOverlay } from './components';
export const SortableList = ({ items, onChange, renderItem, style: userStyle, }) => {
    const [active, setActive] = useState(null);
    const activeItem = useMemo(() => items.find((item) => item.id === active?.id), [active, items]);
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    }));
    const style = {
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        listStyle: 'none',
    };
    return (_jsxs(DndContext, { sensors: sensors, onDragStart: ({ active }) => {
            setActive(active);
        }, onDragEnd: ({ active, over }) => {
            if (over && active.id !== over?.id) {
                const activeIndex = items.findIndex(({ id }) => id === active.id);
                const overIndex = items.findIndex(({ id }) => id === over.id);
                onChange(arrayMove(items, activeIndex, overIndex));
            }
            setActive(null);
        }, onDragCancel: () => setActive(null), children: [_jsx(SortableContext, { items: items, children: _jsx("ul", { style: style, children: items.map((item, index) => (_jsx(React.Fragment, { children: renderItem(item, index) }, item.id))) }) }), _jsx(SortableOverlay, { children: activeItem ? renderItem(activeItem) : null })] }));
};
