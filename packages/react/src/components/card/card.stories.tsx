import React from 'react';
import { Card, CardProps } from './card.component';
import { Text } from '../../core';

export default {
  title: 'Components/Cards',
  component: Card,
};

export const Elevated = (args: CardProps) => {
  return (
    <Card {...args}>
      <Text role="title-large">Sample Content</Text>
    </Card>
  );
};

const ElevatedArgs: CardProps = {
  cardType: 'elevated',
};

Elevated.args = ElevatedArgs;
