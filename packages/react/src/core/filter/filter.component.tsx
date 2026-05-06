import React, { PropsWithChildren } from 'react';
import Container from '../container/container.component';
import { FilterStyle } from './filter.style';
import { FilterProps } from './filter.model';

export const Filter = (filterProps: PropsWithChildren<FilterProps>) => {
  const { children } = filterProps;
  const style = FilterStyle(filterProps);

  return <Container style={style}>{children}</Container>;
};
