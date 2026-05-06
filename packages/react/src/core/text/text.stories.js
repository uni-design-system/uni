import { jsx as _jsx } from "react/jsx-runtime";
import { Text } from './text.component';
export default {
    title: 'Typography/Text',
    component: Text
};
const baseArgs = {
    text: 'UNI Design System',
    colorToken: 'on-background'
};
export const DisplayLarge = (args) => _jsx(Text, { ...args });
DisplayLarge.args = { ...baseArgs,
    role: 'display-large'
};
DisplayLarge.story = {
    name: 'Display (large)',
};
export const DisplayMedium = (args) => _jsx(Text, { ...args });
DisplayMedium.args = { ...baseArgs,
    role: 'display-medium'
};
DisplayMedium.story = {
    name: 'Display (medium)',
};
export const DisplaySmall = (args) => _jsx(Text, { ...args });
DisplaySmall.args = { ...baseArgs,
    role: 'display-small'
};
DisplaySmall.story = {
    name: 'Display (small)',
};
export const HeadlineLarge = (args) => _jsx(Text, { ...args });
HeadlineLarge.args = { ...baseArgs,
    role: 'headline-large'
};
HeadlineLarge.story = {
    name: 'Headline (large)',
};
export const HeadlineMedium = (args) => _jsx(Text, { ...args });
HeadlineMedium.args = { ...baseArgs,
    role: 'headline-medium'
};
HeadlineMedium.story = {
    name: 'Headline (medium)',
};
export const HeadlineSmall = (args) => _jsx(Text, { ...args });
HeadlineSmall.args = { ...baseArgs,
    role: 'headline-small'
};
HeadlineSmall.story = {
    name: 'Headline (small)',
};
export const TitleLarge = (args) => _jsx(Text, { ...args });
TitleLarge.args = { ...baseArgs,
    role: 'title-large'
};
TitleLarge.story = {
    name: 'Title (large)',
};
export const TitleMedium = (args) => _jsx(Text, { ...args });
TitleMedium.args = { ...baseArgs,
    role: 'title-medium'
};
TitleMedium.story = {
    name: 'Title (medium)',
};
export const TitleSmall = (args) => _jsx(Text, { ...args });
TitleSmall.args = { ...baseArgs,
    role: 'title-small'
};
TitleSmall.story = {
    name: 'Title (small)',
};
