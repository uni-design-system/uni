import { useMemo, useState } from 'react';
/**
 * React hook to manage boolean (on - off) states
 *
 * @param initialState the initial boolean state value
 *
 * @see Docs https://chakra-ui.com/docs/hooks/use-boolean
 */
export function useToggle(initialState = false) {
    const [value, setValue] = useState(initialState);
    const callbacks = useMemo(() => ({
        on: () => setValue(true),
        off: () => setValue(false),
        toggle: () => setValue((prev) => !prev),
    }), []);
    return [value, callbacks];
}
