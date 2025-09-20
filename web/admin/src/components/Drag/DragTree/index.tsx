import { ITreeItem } from '@/api';
import { postApiV1NodeMove } from '@/request/Node';
import { AppContext, DragTreeProps, getSiblingItemIds } from '@/utils/drag';
import { DndContext } from '@dnd-kit/core';
import { SortableTree, TreeItems } from 'dnd-kit-sortable-tree';
import { ItemChangedReason } from 'dnd-kit-sortable-tree/dist/types';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store';
import TreeItem from './TreeItem';

const DragTree = ({
  data,
  menu,
  refresh,
  ui = 'move',
  readOnly = false,
  selected,
  onSelectChange,
  supportSelect = true,
  relativeSelect = true,
}: DragTreeProps) => {
  const [items, setItems] = useState<TreeItems<ITreeItem>>(data);
  const { kb_id } = useAppSelector(state => state.config);
  useEffect(() => {
    setItems(data);
  }, [data]);

  return (
    <AppContext.Provider
      value={{
        ui,
        menu,
        items,
        setItems,
        refresh,
        readOnly,
        selected,
        onSelectChange,
        supportSelect,
        relativeSelect,
      }}
    >
      <DndContext>
        <SortableTree
          disableSorting={readOnly}
          items={items.map(it => ({ ...it }))}
          onItemsChanged={(
            items: TreeItems<ITreeItem>,
            reason: ItemChangedReason<ITreeItem>,
          ) => {
            if (reason.type === 'dropped') {
              const { draggedItem } = reason;
              const { parentId, id } = draggedItem;
              const { prevItemId, nextItemId } = getSiblingItemIds(items, id);
              postApiV1NodeMove({
                id,
                parent_id: parentId,
                next_id: nextItemId as string,
                prev_id: prevItemId as string,
                kb_id: kb_id,
              }).then(() => {
                refresh?.();
              });
            }
            setItems(items);
          }}
          TreeItemComponent={TreeItem}
        />
      </DndContext>
    </AppContext.Provider>
  );
};

export default DragTree;
