import React from 'react';
import { IconTextRow, IconTextRowProps } from './icon-text-row.component';

export default {
  title: 'Typography/Icon Text Row',
  component: IconTextRow,
};

export const IconTextRowPlayground = (args: IconTextRowProps) => <IconTextRow {...args} />;

const IconTextRowPlaygroundProps: IconTextRowProps = {
  color: 'on-background',
  iconName: 'mapLocationDotSolid',
  text: 'Location',
  textRole: 'headline-small',
};

IconTextRowPlayground.args = IconTextRowPlaygroundProps;
