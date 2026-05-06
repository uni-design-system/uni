import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { SortableList } from './sortableList.component';
import { DragHandle, SortableItem } from './components';
import { createRange } from '../utilities';
import { findManyChannelStatus } from './mockData';
import { Button } from '../../button';
import { Text } from '../../../core';
import { Flex } from '../../../core/flex/flex.component';
export default {
    title: 'Components/Draggable/Sortable List',
    component: SortableList,
};
const getMockItems = () => createRange(50, (index) => ({ id: index + 1 }));
export const BasicList = () => {
    const [items, setItems] = useState(getMockItems);
    return (_jsx(SortableList, { items: items, onChange: setItems, renderItem: (item) => (_jsxs(SortableItem, { id: item.id, children: [_jsx(DragHandle, {}), item.id] })) }));
};
export const SortableRows = () => {
    const [items, setItems] = useState(findManyChannelStatus);
    const handleRemove = (id) => setItems((items) => items.filter((item) => item.id !== id));
    return (_jsx(SortableList, { items: items, onChange: setItems, renderItem: ({ id, name }, index) => (_jsx(SortableItem, { id: id, style: {
                padding: '8px',
                background: (index && index % 2 === 0) || index === 0 ? '#f1f5f6' : '#fff',
            }, children: _jsxs(Flex, { align: "center", children: [_jsx(DragHandle, {}), _jsx(Text, { role: "paragraph", children: name }), _jsx(Button, { buttonType: "icon", onClick: () => handleRemove(id), iconName: "trashCanRegular" })] }) })) }));
};
