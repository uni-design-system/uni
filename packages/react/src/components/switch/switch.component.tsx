import { motion, Transition } from 'framer-motion';
import React, { CSSProperties, useState } from 'react';
import { RoleHues, Size } from '@uni-design-system/uni-core';
import { SwitchConfigs } from './switch.config';

export interface SwitchProps {
  size?: Size;
  on?: boolean;
  onChange?: (on: boolean) => void;
}

export const Switch = ({ size = 'sm', on = false, onChange }: SwitchProps) => {
  const [isOn, setIsOn] = useState(on);

  const successColor = `hsl(${RoleHues.success.default}, 32%, 50%)`;

  const toggleSwitch = () => {
    setIsOn(!isOn);
    onChange && onChange(!isOn);
  };

  const spring: Transition = {
    type: 'spring',
    stiffness: 700,
    damping: 30,
  };

  const config = SwitchConfigs[size];

  const handleDiameter = config.radius * 2;
  const switchWidth = config.radius * 4;

  const switchStyle: CSSProperties = {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: isOn ? 'flex-end' : 'flex-start',
    backgroundColor: isOn ? successColor : 'rgba(0, 0, 0, 0.4)',
    width: switchWidth,
    height: handleDiameter,
    padding: config.padding,
    borderRadius: config.radius + config.padding,
  };

  const handleStyle: CSSProperties = {
    width: handleDiameter,
    height: handleDiameter,
    backgroundColor: 'white',
    borderRadius: config.radius,
  };

  return (
    <div style={switchStyle} className="switch" data-isOn={isOn} onClick={toggleSwitch}>
      <motion.div style={handleStyle} className="handle" layout transition={spring} />
    </div>
  );
};
