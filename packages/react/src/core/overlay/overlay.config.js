import { HSLAToString } from '@uni/core';
export const OverlayStyle = (theme, { hueRotateDeg = 0, hueDeg = 0, saturation = 0, lightness = 0, transparency = 0.5, blurPx = 0 }) => {
    const backgroundColor = HSLAToString({ hue: hueDeg, saturation, lightness, alpha: transparency });
    return {
        position: 'fixed',
        left: '0',
        top: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor,
        backdropFilter: `blur(${blurPx}px) hue-rotate(${hueRotateDeg}deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };
};
