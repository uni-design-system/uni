import * as React from 'react';
import { Fade, FadeProps } from './fade.component';
import { useToggle } from '../../hooks';
import { Button, Card } from '../../../components';
import { Text } from '../../text';
import { fadeArgTypes } from './fade.argTypes';

export default {
  title: 'Components / Transition / Fade',
  argTypes: fadeArgTypes,
};

const Example = (props: FadeProps) => {
  const [open, { toggle }] = useToggle(false);
  return (
    <>
      <Button onClick={toggle}>Toggle Fade</Button>
      <Fade in={open} {...props}>
        <Card cardType="elevated" colorToken="background">
          <Text>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</Text>
        </Card>
      </Fade>
    </>
  );
};

export const BasicFade = (props: FadeProps) => <Example {...props} />;
const BasicFadeProps: FadeProps = {};
BasicFade.props = BasicFadeProps;

export const FadeWithCustomTransition = (props: FadeProps) => <Example {...props} />;
const FadeWithCustomTransitionProps: FadeProps = {
  transition: { enter: { duration: 0.3 }, exit: { duration: 0.5 } },
};
FadeWithCustomTransition.props = FadeWithCustomTransitionProps;

export const FadeWithTransitionEnd = (props: FadeProps) => <Example {...props} />;
const FadeFadeWithTransitionEndProps: FadeProps = {
  style: { display: 'block' },
  transitionEnd: { exit: { display: 'none' } },
};
FadeWithTransitionEnd.props = FadeFadeWithTransitionEndProps;

export const FadeWithTransitionDelay = (props: FadeProps) => <Example {...props} />;
const FadeWithTransitionDelayProps: FadeProps = {
  delay: { enter: 0.2 },
  style: {
    maxWidth: 400,
    paddingTop: 20,
  },
};
FadeWithTransitionDelay.props = FadeWithTransitionDelayProps;
