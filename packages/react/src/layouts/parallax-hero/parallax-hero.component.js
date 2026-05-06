import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ParallaxHero = ({ layers, children }) => {
    return (_jsxs("div", { children: [_jsx("div", { id: "hero", children: layers.map((layer) => (_jsx("div", { className: layer.name + 'layer', "data-depth": layer.depth, "data-type": "parallax", style: { backgroundImage: layer.src } }))) }), _jsx("div", { id: "static-hero", children: _jsx("div", { className: "static-hero-image" }) }), _jsx("div", { children: children })] }));
};
