import { jsx as _jsx } from "react/jsx-runtime";
import { useContext } from 'react';
import { SortableItemContext } from '../SortableItem/sortableItem.context';
import { Button } from '../../../../button';
import { useDndContext } from '@dnd-kit/core';
export const DragHandle = ({ ...rest }) => {
    const { attributes, listeners } = useContext(SortableItemContext);
    const dndContext = useDndContext();
    return (_jsx(Button, { style: { cursor: dndContext.activatorEvent ? 'grabbing' : 'grab' }, iconName: "barsSolid", buttonType: "icon", ...attributes, ...listeners, ...rest }));
};
