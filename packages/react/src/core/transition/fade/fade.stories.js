import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Fade } from './fade.component';
import { useToggle } from '../../hooks';
import { Button, Card } from '../../../components';
import { Text } from '../../text';
import { fadeArgTypes } from './fade.argTypes';
export default {
    title: 'Components / Transition / Fade',
    argTypes: fadeArgTypes,
};
const Example = (props) => {
    const [open, { toggle }] = useToggle(false);
    return (_jsxs(_Fragment, { children: [_jsx(Button, { onClick: toggle, children: "Toggle Fade" }), _jsx(Fade, { in: open, ...props, children: _jsx(Card, { cardType: "elevated", colorToken: "background", children: _jsx(Text, { children: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." }) }) })] }));
};
export const BasicFade = (props) => _jsx(Example, { ...props });
const BasicFadeProps = {};
BasicFade.props = BasicFadeProps;
export const FadeWithCustomTransition = (props) => _jsx(Example, { ...props });
const FadeWithCustomTransitionProps = {
    transition: { enter: { duration: 0.3 }, exit: { duration: 0.5 } },
};
FadeWithCustomTransition.props = FadeWithCustomTransitionProps;
export const FadeWithTransitionEnd = (props) => _jsx(Example, { ...props });
const FadeFadeWithTransitionEndProps = {
    style: { display: 'block' },
    transitionEnd: { exit: { display: 'none' } },
};
FadeWithTransitionEnd.props = FadeFadeWithTransitionEndProps;
export const FadeWithTransitionDelay = (props) => _jsx(Example, { ...props });
const FadeWithTransitionDelayProps = {
    delay: { enter: 0.2 },
    style: {
        maxWidth: 400,
        paddingTop: 20,
    },
};
FadeWithTransitionDelay.props = FadeWithTransitionDelayProps;
