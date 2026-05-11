import React, { createContext, CSSProperties, ReactNode } from 'react';
import { ContainerColorToken } from '@uni-design-system/uni-core';

export interface ContainerProps {
  children: ReactNode;
  style: CSSProperties;
  colorToken?: ContainerColorToken;
}

export const ContainerContext = createContext<{ colorToken?: ContainerColorToken }>({});

export default function Container({ children, style, colorToken, ...rest }: ContainerProps) {
  return (
    <ContainerContext.Provider value={{ colorToken }}>
      <div style={style} {...rest}>
        {children}
      </div>
    </ContainerContext.Provider>
  );
}
