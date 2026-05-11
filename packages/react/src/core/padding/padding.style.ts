import { CSSProperties } from 'react';
import { Apply, Size } from '@uni-design-system/uni-core';

export function Padding(size: Size, apply: Apply): CSSProperties {

  const amount: number = 16;
  const unit: string = 'px';

  const PaddingMap: Record<Apply, CSSProperties> = {
    top: {
      paddingTop: amount + unit
    },
    bottom: {
      paddingBottom: amount + unit
    },
    left: {
      paddingLeft: amount + unit
    },
    right: {
      paddingRight: amount + unit
    },
    vertical: {
      paddingTop: amount + unit,
      paddingBottom: amount + unit
    },
    horizontal: {
      paddingLeft: amount + unit,
      paddingRight: amount + unit
    },
    all: {
      padding: amount + unit
    }
  }

  return PaddingMap[apply];
}
