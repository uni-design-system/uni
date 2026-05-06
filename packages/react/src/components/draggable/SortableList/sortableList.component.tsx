import React, { CSSProperties, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { Active, UniqueIdentifier } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { SortableOverlay } from './components';

export interface SortableItemProps {
  id: UniqueIdentifier;
}

export interface SortableProps<T extends SortableItemProps> {
  items: T[];
  onChange(items: T[]): void;
  renderItem(item: T, index?: number): ReactNode;
  style?: CSSProperties;
}

export const SortableList = <T extends SortableItemProps>({
  items,
  onChange,
  renderItem,
  style: userStyle,
}: SortableProps<T>): JSX.Element => {
  const [active, setActive] = useState<Active | null>(null);
  const activeItem = useMemo(() => items.find((item) => item.id === active?.id), [active, items]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const style: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    listStyle: 'none',
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }): void => {
        setActive(active);
      }}
      onDragEnd={({ active, over }): void => {
        if (over && active.id !== over?.id) {
          const activeIndex = items.findIndex(({ id }) => id === active.id);
          const overIndex = items.findIndex(({ id }) => id === over.id);

          onChange(arrayMove(items, activeIndex, overIndex));
        }
        setActive(null);
      }}
      onDragCancel={(): void => setActive(null)}
    >
      <SortableContext items={items}>
        <ul style={style}>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>{renderItem(item, index)}</React.Fragment>
          ))}
        </ul>
      </SortableContext>
      <SortableOverlay>{activeItem ? renderItem(activeItem) : null}</SortableOverlay>
    </DndContext>
  );
};
