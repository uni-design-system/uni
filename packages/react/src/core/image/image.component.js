import { jsx as _jsx } from "react/jsx-runtime";
import { ImageStyle } from './image.style';
export const Image = ({ url, alt, height, width, opacity, fit = 'cover', ...rest }) => {
    return url ? _jsx("img", { src: url, alt: alt, style: ImageStyle({ fit, opacity, height, width, ...rest }) }) : null;
};
