import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { useState } from 'react';
import { RoleHues } from '@uni/core';
import { SwitchConfigs } from './switch.config';
export const Switch = ({ size = 'sm', on = false, onChange }) => {
    const [isOn, setIsOn] = useState(on);
    const successColor = `hsl(${RoleHues.success.default}, 32%, 50%)`;
    const toggleSwitch = () => {
        setIsOn(!isOn);
        onChange && onChange(!isOn);
    };
    const spring = {
        type: 'spring',
        stiffness: 700,
        damping: 30,
    };
    const config = SwitchConfigs[size];
    const handleDiameter = config.radius * 2;
    const switchWidth = config.radius * 4;
    const switchStyle = {
        cursor: 'pointer',
        display: 'flex',
        justifyContent: isOn ? 'flex-end' : 'flex-start',
        backgroundColor: isOn ? successColor : 'rgba(0, 0, 0, 0.4)',
        width: switchWidth,
        height: handleDiameter,
        padding: config.padding,
        borderRadius: config.radius + config.padding,
    };
    const handleStyle = {
        width: handleDiameter,
        height: handleDiameter,
        backgroundColor: 'white',
        borderRadius: config.radius,
    };
    return (_jsx("div", { style: switchStyle, className: "switch", "data-isOn": isOn, onClick: toggleSwitch, children: _jsx(motion.div, { style: handleStyle, className: "handle", layout: true, transition: spring }) }));
};
