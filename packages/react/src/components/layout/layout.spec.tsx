import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { cache } from '@emotion/css';
import { describe, expect, it } from 'vitest';
import { LightTheme } from '@uni-design-system/uni-core';

import { Box, Center, Grid, GridArea, Row, Stack, Wrap } from './index';
import { ThemeProvider, Text } from '../../core';

function render(node: React.ReactElement) {
  const html = renderToStaticMarkup(<ThemeProvider>{node}</ThemeProvider>);
  const classes = [...html.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(' '));
  const cssText = classes.map((c) => cache.registered[c] ?? '').join('\n');
  return { html, cssText };
}

describe('layout primitives', () => {
  it('Box resolves theme tokens to CSS', () => {
    const { html, cssText } = render(
      <Box color="secondary-container" padding="lg" borderRadius="md" shadow="raised" />
    );
    expect(html).toContain('<div');
    expect(cssText).toContain(`background-color:${LightTheme.colors['secondary-container']}`);
    expect(cssText).toContain(`color:${LightTheme.colors['on-secondary-container']}`);
    expect(cssText).toContain(`padding:${LightTheme.spacing['lg']}`);
    expect(cssText).toContain(`border-radius:${LightTheme.radii['md']}`);
    expect(cssText).toContain(`box-shadow:${LightTheme.shadows['raised']}`);
    expect(cssText).toContain('box-sizing:border-box');
  });

  it('Box renders the element named by `as` and passes DOM props through', () => {
    const { html } = render(
      <Box as="main" id="content" aria-label="Main" padding="md">
        hello
      </Box>
    );
    expect(html).toContain('<main');
    expect(html).toContain('id="content"');
    expect(html).toContain('aria-label="Main"');
    expect(html).toContain('hello');
    // Style props must never leak onto the element as attributes.
    expect(html).not.toContain('padding=');
  });

  it('Box flips flex direction under RTL unless ignoreDir is off', () => {
    expect(render(<Box display="flex" />).cssText).toContain(':dir(rtl)');
    expect(render(<Box display="flex" ignoreDir={false} />).cssText).not.toContain(':dir(rtl)');
  });

  it('Box draws a dashed border as an SVG outline', () => {
    const { cssText } = render(<Box border="outline" dashBorder borderRadius="sm" />);
    expect(cssText).toContain('stroke-dasharray');
    expect(cssText).not.toContain(`border:${LightTheme.borders['outline']}`);
  });

  it('Stack and Row carry their presets and stay overridable', () => {
    const stack = render(<Stack gap="lg" />).cssText;
    expect(stack).toContain('flex-direction:column');
    expect(stack).toContain('min-height:fit-content');
    expect(stack).toContain(`gap:${LightTheme.spacing['lg']}`);

    const row = render(<Row />).cssText;
    expect(row).toContain('flex-direction:row');
    expect(row).toContain('min-width:fit-content');

    expect(render(<Row minWidth={0} />).cssText).not.toContain('min-width:fit-content');
  });

  it('Center centers on both axes and Wrap wraps', () => {
    const center = render(<Center height={180} />).cssText;
    expect(center).toContain('justify-content:center');
    expect(center).toContain('align-items:center');
    expect(center).toContain('height:180px');

    expect(render(<Wrap />).cssText).toContain('flex-wrap:wrap');
  });

  it('Grid lays out tracks and GridArea places children', () => {
    const { html, cssText } = render(
      <Grid templateAreas="'a b'" templateColumns="1fr 1fr" outline="thin" outlineColor="primary">
        <GridArea area="a">A</GridArea>
      </Grid>
    );
    expect(cssText).toContain('display:grid');
    expect(cssText).toContain("grid-template-areas:'a b'");
    expect(cssText).toContain('grid-template-columns:1fr 1fr');
    expect(cssText).toContain(`gap:${LightTheme.thicknesses['thin']}`);
    expect(cssText).toContain(`background-color:${LightTheme.colors['primary']}`);
    expect(cssText).toContain('grid-area:a');
    expect(html).toContain('A');
    expect(html).not.toContain('area=');
  });

  it('Text inside a colored Box picks up the container on-color', () => {
    const { html } = render(
      <Box color="primary-container">
        <Text>Inside</Text>
      </Box>
    );
    expect(html).toContain(`color:${LightTheme.colors['on-primary-container']}`);
  });
});
