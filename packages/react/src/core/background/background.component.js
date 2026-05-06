import { jsx as _jsx } from "react/jsx-runtime";
export const Background = ({ children, image, imageUrl, gradiant, position, size, attachment, className, minHeight, color, }) => {
    if (!!imageUrl) {
        image = `url(${imageUrl})`;
    }
    const style = {
        backgroundColor: color,
        backgroundImage: image || gradiant,
        backgroundPosition: position,
        backgroundSize: size,
        minHeight,
        backgroundAttachment: attachment,
    };
    return (_jsx("div", { className: className, style: style, children: children }));
};
