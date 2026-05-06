import { jsx as _jsx } from "react/jsx-runtime";
import { Card } from './card.component';
import { Text } from '../../core';
export default {
    title: 'Components/Cards',
    component: Card,
};
export const Elevated = (args) => {
    return (_jsx(Card, { ...args, children: _jsx(Text, { role: "title-large", children: "Sample Content" }) }));
};
const ElevatedArgs = {
    cardType: 'elevated',
};
Elevated.args = ElevatedArgs;
