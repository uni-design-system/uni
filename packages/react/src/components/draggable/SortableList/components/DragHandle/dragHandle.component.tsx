import React, { useContext } from 'react';
import { SortableItemContext } from '../SortableItem/sortableItem.context';
import { Button, ButtonProps } from '../../../../button';
import { useDndContext } from '@dnd-kit/core';

export const DragHandle = ({ ...rest }: ButtonProps): JSX.Element => {
  const { attributes, listeners } = useContext(SortableItemContext);
  const dndContext = useDndContext();

  return (
    <Button
      style={{ cursor: dndContext.activatorEvent ? 'grabbing' : 'grab' }}
      iconName="barsSolid"
      buttonType="icon"
      {...attributes}
      {...listeners}
      {...rest}
    />
  );
};
