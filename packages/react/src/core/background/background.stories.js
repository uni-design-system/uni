import { jsx as _jsx } from "react/jsx-runtime";
import { Background } from './background.component';
export default {
    title: 'Components/Background',
    component: Background,
    parameters: {
        layout: 'fullscreen',
    },
};
export const ImageBackground = (args) => {
    return _jsx(Background, { ...args });
};
const ImageBackgroundArgs = {
    imageUrl: 'promenade.webp',
    size: 'cover',
    minHeight: '100vh',
};
ImageBackground.args = ImageBackgroundArgs;
