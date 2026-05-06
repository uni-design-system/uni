import React, { CSSProperties, ReactNode } from 'react';
import { Property } from 'csstype';

export interface GrainyGradientProps {
  children?: ReactNode;
  noiseFrequency?: number;
  noiseOctaves?: number;
  size?: number;
  minHeight?: Property.MinHeight;
  angle?: number;
  gradientColor?: Property.Color;
  backgroundColor?: Property.Color;
}

export const GrainyGradientBackground = ({
  children,
  noiseFrequency = 0.65,
  noiseOctaves = 3,
  minHeight,
  size = 740,
  angle = 20,
  gradientColor = 'rebeccapurple',
  backgroundColor = 'moccasin',
}: GrainyGradientProps) => {
  const gradient = `linear-gradient(${angle}deg, ${gradientColor}, transparent)`;

  const image = `url("data:image/svg+xml,%3Csvg viewBox='0 0 ${size} ${size}' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${noiseFrequency}' numOctaves='${noiseOctaves}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

  const container: CSSProperties = {};

  const content: CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
  };

  const noise: CSSProperties = {
    filter: 'contrast(290%) brightness(1000%)',
    background: gradient + ', ' + image,
    minHeight,
  };

  const isolate: CSSProperties = {
    isolation: 'isolate',
    position: 'absolute',
    width: '100%',
    height: '100%',
  };

  const overlay: CSSProperties = {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    background: backgroundColor,
    mixBlendMode: 'multiply',
  };

  return (
    <div style={container}>
      <div style={isolate}>
        <div style={noise}></div>
        <div style={overlay}></div>
      </div>
      <div style={content}>{children}</div>
    </div>
  );
};
