import { jsx as _jsx } from "react/jsx-runtime";
import { IconTextRow } from './icon-text-row.component';
export default {
    title: 'Typography/Icon Text Row',
    component: IconTextRow,
};
export const IconTextRowPlayground = (args) => _jsx(IconTextRow, { ...args });
const IconTextRowPlaygroundProps = {
    color: 'on-background',
    iconName: 'mapLocationDotSolid',
    text: 'Location',
    textRole: 'headline-small',
};
IconTextRowPlayground.args = IconTextRowPlaygroundProps;
