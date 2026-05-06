import { createContext } from 'react';
export const SortableItemContext = createContext({
    attributes: {},
    listeners: undefined,
    ref() { },
});
