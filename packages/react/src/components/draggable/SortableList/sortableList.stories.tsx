import React, { useState } from 'react';
import { SortableList } from './sortableList.component';
import { DragHandle, SortableItem } from './components';
import { createRange } from '../utilities';

import { findManyChannelStatus } from './mockData';

import { Button } from '../../button';
import { UniqueIdentifier } from '@dnd-kit/core';
import { Flex, Text } from '../../../core';

export default {
  title: 'Components/Draggable/Sortable List',
  component: SortableList,
};

interface MockItem {
  id: number;
}

const getMockItems = (): MockItem[] => createRange(50, (index) => ({ id: index + 1 }));

export const BasicList = (): JSX.Element => {
  const [items, setItems] = useState(getMockItems);

  return (
    <SortableList
      items={items}
      onChange={setItems}
      renderItem={(item): JSX.Element => (
        <SortableItem id={item.id}>
          <DragHandle />
          {item.id}
        </SortableItem>
      )}
    />
  );
};

export const SortableRows = (): JSX.Element => {
  const [items, setItems] = useState(findManyChannelStatus);

  const handleRemove = (id: UniqueIdentifier): void =>
    setItems((items) => items.filter((item) => item.id !== id));

  return (
    <SortableList
      items={items}
      onChange={setItems}
      renderItem={({ id, name }, index): JSX.Element => (
        <SortableItem
          id={id}
          style={{
            padding: '8px',
            background: (index && index % 2 === 0) || index === 0 ? '#f1f5f6' : '#fff',
          }}
        >
          <Flex align="center">
            <DragHandle />
            <Text role="paragraph">{name}</Text>
            <Button
              buttonType="icon"
              onClick={(): void => handleRemove(id)}
              iconName="trashCanRegular"
            />
          </Flex>
        </SortableItem>
      )}
    />
  );
};
