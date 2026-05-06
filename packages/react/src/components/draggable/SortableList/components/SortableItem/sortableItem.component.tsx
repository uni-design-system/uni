import React, { useMemo } from 'react';
import type { CSSProperties, PropsWithChildren } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableItemContext } from './sortableItem.context';

export interface SortableItemProps {
  id: UniqueIdentifier;
  style?: CSSProperties;
  onRemove?(id: UniqueIdentifier): void;
}

export const SortableItem = ({
  children,
  id,
  style: userStyle,
  onRemove,
}: PropsWithChildren<SortableItemProps>): JSX.Element => {
  const { attributes, isDragging, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({
    id,
  });
  const context = useMemo(
    () => ({
      attributes,
      listeners,
      ref: setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef],
  );
  const style: CSSProperties = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
    listStyle: 'none',
    ...userStyle,
  };

  return (
    <SortableItemContext.Provider value={context}>
      <li className="SortableItem" ref={setNodeRef} style={style}>
        {children}
      </li>
    </SortableItemContext.Provider>
  );
};
