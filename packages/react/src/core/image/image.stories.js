import { jsx as _jsx } from "react/jsx-runtime";
import { Image } from './image.component';
import { imageArgTypes } from './image.argTypes';
export default {
    title: 'Core/Image',
    component: Image,
    argTypes: { ...imageArgTypes },
    parameters: {
        layout: 'fullscreen',
    },
};
export const ImagePlayground = (args) => _jsx(Image, { ...args });
const ImagePlaygroundProps = {
    fit: 'contain',
    url: 'https://www.rollingstone.com/wp-content/uploads/2018/06/rs-108784-e569415749457a65514cfe8b509d7ead8b7b4013.jpg?w=500',
};
ImagePlayground.args = ImagePlaygroundProps;
