import { useToggle } from '../../hooks';
import * as React from 'react';
import { Slide, SlideProps } from './slide.component';
import { Button, Card } from '../../../components';

export default {
  title: 'Components / Transition / Slide',
  component: Slide,
};

export const Sidebar = ({ ...args }: SlideProps) => {
  const [open, { toggle }] = useToggle(false);
  return (
    <>
      <Button onClick={toggle}>Toggle Sidebar</Button>
      <Slide
        style={{
          maxWidth: 400,
          padding: 0,
        }}
        in={open}
        {...args}
      >
        <Card
          colorToken="background"
          borderRadius="none"
          cardType={open ? 'elevated' : undefined}
          elevation="modal"
          height="100%"
        >
          <Button buttonType="icon" iconName="xmarkSolid" onClick={toggle} />
        </Card>
      </Slide>
    </>
  );
};

Sidebar.args = {};
