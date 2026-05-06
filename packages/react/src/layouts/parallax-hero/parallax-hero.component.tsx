import React from 'react';
import { ParallaxHeroProps } from './parallax-hero.model';

export const ParallaxHero = ({ layers, children }: ParallaxHeroProps): JSX.Element => {
  return (
    <div>
      <div id="hero">
        {layers.map((layer) => (
          <div
            className={layer.name + 'layer'}
            data-depth={layer.depth}
            data-type="parallax"
            style={{ backgroundImage: layer.src }}
          />
        ))}
      </div>

      <div id="static-hero">
        <div className="static-hero-image" />
      </div>

      <div>{children}</div>
    </div>
  );
};
