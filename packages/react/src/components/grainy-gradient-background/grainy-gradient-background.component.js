import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const GrainyGradientBackground = ({ children, noiseFrequency = 0.65, noiseOctaves = 3, minHeight, size = 740, angle = 20, gradientColor = 'rebeccapurple', backgroundColor = 'moccasin', }) => {
    const gradient = `linear-gradient(${angle}deg, ${gradientColor}, transparent)`;
    const image = `url("data:image/svg+xml,%3Csvg viewBox='0 0 ${size} ${size}' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${noiseFrequency}' numOctaves='${noiseOctaves}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;
    const container = {};
    const content = {
        position: 'absolute',
        width: '100%',
        height: '100%',
    };
    const noise = {
        filter: 'contrast(290%) brightness(1000%)',
        background: gradient + ', ' + image,
        minHeight,
    };
    const isolate = {
        isolation: 'isolate',
        position: 'absolute',
        width: '100%',
        height: '100%',
    };
    const overlay = {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '100%',
        background: backgroundColor,
        mixBlendMode: 'multiply',
    };
    return (_jsxs("div", { style: container, children: [_jsxs("div", { style: isolate, children: [_jsx("div", { style: noise }), _jsx("div", { style: overlay })] }), _jsx("div", { style: content, children: children })] }));
};
