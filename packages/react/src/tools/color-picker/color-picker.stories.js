import { jsx as _jsx } from "react/jsx-runtime";
import { ColorPicker } from './color-picker.component';
export default {
    title: 'Tools/Color Picker',
    component: ColorPicker,
    parameters: {
        layout: 'fullscreen',
    },
};
export const ColorPickerPlayground = (args) => _jsx(ColorPicker, { ...args });
const ColorPickerPlaygroundProps = {
    imageUrl: 'promenade.webp',
    imageHeight: 683,
    imageWidth: 1024,
    sampleSize: 40,
};
ColorPickerPlayground.args = ColorPickerPlaygroundProps;
