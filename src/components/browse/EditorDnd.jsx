import { createElement, useCallback, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { useEditorStore } from '../../store.js';
import { buildPropertyFromBrowseDrag, insertPropertyAt, linkPropertyFromBrowseDrag } from './browseInsert.js';
import { ElementIcon } from './semanticTree.jsx';
import { getLogicalTypeIcon } from '../features/schema/propertyIcons.js';
import { BrowseDropContext } from './browseDropContext.js';

/**
 * One DndContext for the whole form view: it serves both the in-list property
 * reordering (sortable rows in SchemaEditor) and drags that originate in the
 * browse panel and drop into a schema's properties list.
 *
 * ID conventions:
 *  - sortable property rows:      prop-{schemaIndex}-{propIndex}
 *  - properties list container:   props-list-{schemaIndex} (data: {schemaIndex, propsCount})
 *  - browse panel drag sources:   browse-* (data: {source: 'browse', kind, ...})
 */

const ROW_ID_PATTERN = /^prop-(\d+)-(\d+)$/;
const LIST_ID_PATTERN = /^props-list-(\d+)$/;

const isBrowseDrag = (active) => active?.data?.current?.source === 'browse';

/**
 * Drop target from a collision candidate and the live pointer position. A row
 * has three zones: top 30% inserts before it, bottom 30% inserts after it
 * (mode 'insert', shown as an indicator line), and the middle links the
 * dragged element onto the existing property (mode 'link', shown as a ring
 * on the row).
 *
 * Computed inside the collision pass because that is the only place where the
 * pointer position and the droppable rects are guaranteed consistent: the
 * drag events carry an over-target that lags one collision pass behind, and
 * reconstructing the pointer as activator + delta is off by the activation
 * distance — both push center drops into the insert zones.
 */
function computeBrowseTarget(collisionId, args) {
  const id = String(collisionId);

  const rowMatch = ROW_ID_PATTERN.exec(id);
  if (rowMatch) {
    const schemaIndex = parseInt(rowMatch[1], 10);
    const overIndex = parseInt(rowMatch[2], 10);
    const rect = args.droppableRects.get(collisionId);
    const pointerY = args.pointerCoordinates?.y;
    let ratio = 0.5;
    if (pointerY != null && rect?.height) {
      ratio = (pointerY - rect.top) / rect.height;
    }
    if (ratio < 0.3) return { schemaIndex, index: overIndex, mode: 'insert' };
    if (ratio > 0.7) return { schemaIndex, index: overIndex + 1, mode: 'insert' };
    return { schemaIndex, index: overIndex, mode: 'link' };
  }

  const listMatch = LIST_ID_PATTERN.exec(id);
  if (listMatch) {
    const schemaIndex = parseInt(listMatch[1], 10);
    const container = args.droppableContainers.find((c) => c.id === collisionId);
    return { schemaIndex, index: container?.data?.current?.propsCount ?? null, mode: 'insert' };
  }

  return null;
}

export default function EditorDndProvider({ children }) {
  const getValue = useEditorStore((state) => state.getValue);
  const setValue = useEditorStore((state) => state.setValue);
  const markInsertedProperty = useEditorStore((state) => state.markInsertedProperty);

  const [activeBrowseDrag, setActiveBrowseDrag] = useState(null); // active.data.current of a browse drag
  const [indicator, setIndicator] = useState(null); // { schemaIndex, index }
  // Drop target of the latest collision pass (see computeBrowseTarget)
  const browseTargetRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px threshold prevents accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reorder drags keep center-based collision, restricted to the rows of the
  // same schema (in the diagram, other nodes' rows and the node containers
  // would otherwise be candidates too). Browse drags follow the pointer and
  // prefer a concrete row over the surrounding list container.
  const collisionDetection = useCallback((args) => {
    if (!isBrowseDrag(args.active)) {
      const activeRow = ROW_ID_PATTERN.exec(String(args.active.id));
      if (activeRow) {
        const prefix = `prop-${activeRow[1]}-`;
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((c) => String(c.id).startsWith(prefix)),
        });
      }
      return closestCenter(args);
    }
    const within = pointerWithin(args);
    const row = within.find((c) => ROW_ID_PATTERN.test(String(c.id)));
    const winner = row ?? within[0] ?? null;
    browseTargetRef.current = winner ? computeBrowseTarget(winner.id, args) : null;
    return row ? [row] : within;
  }, []);

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    setActiveBrowseDrag(isBrowseDrag(active) ? active.data.current : null);
    setIndicator(null);
    browseTargetRef.current = null;
  }, []);

  const handleDragMove = useCallback((event) => {
    if (!isBrowseDrag(event.active)) return;
    setIndicator(browseTargetRef.current);
  }, []);

  const handleDragOver = useCallback((event) => {
    if (!isBrowseDrag(event.active)) return;
    setIndicator(browseTargetRef.current);
  }, []);

  const reorderProperty = useCallback((schemaIndex, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    const path = `schema[${schemaIndex}].properties`;
    const current = getValue(path);
    if (!Array.isArray(current)) return;
    const next = [...current];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setValue(path, next);
  }, [getValue, setValue]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (isBrowseDrag(active)) {
      const target = browseTargetRef.current;
      browseTargetRef.current = null;
      setActiveBrowseDrag(null);
      setIndicator(null);
      if (!target) return;
      if (target.mode === 'link') {
        const linked = linkPropertyFromBrowseDrag(getValue, setValue, target.schemaIndex, target.index, active.data.current);
        if (linked) {
          // Flash the linked row, but don't scroll — it's already under the cursor
          markInsertedProperty(target.schemaIndex, target.index, { scroll: false });
        }
        return;
      }
      const property = buildPropertyFromBrowseDrag(active.data.current, getValue('apiVersion'));
      if (property) {
        const insertedIndex = insertPropertyAt(getValue, setValue, target.schemaIndex, target.index, property);
        markInsertedProperty(target.schemaIndex, insertedIndex);
      }
      return;
    }

    // Reorder within the same schema's top-level properties
    if (!over || active.id === over.id) return;
    const from = ROW_ID_PATTERN.exec(String(active.id));
    const to = ROW_ID_PATTERN.exec(String(over.id));
    if (from && to && from[1] === to[1]) {
      reorderProperty(parseInt(from[1], 10), parseInt(from[2], 10), parseInt(to[2], 10));
    }
  }, [getValue, setValue, markInsertedProperty, reorderProperty]);

  const handleDragCancel = useCallback(() => {
    setActiveBrowseDrag(null);
    setIndicator(null);
  }, []);

  // Reordering stays locked to its list; browse drags travel freely.
  const modifiers = useMemo(
    () => (activeBrowseDrag ? undefined : [restrictToVerticalAxis, restrictToParentElement]),
    [activeBrowseDrag]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      modifiers={modifiers}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <BrowseDropContext.Provider value={indicator}>
        {children}
      </BrowseDropContext.Provider>
      <DragOverlay dropAnimation={null}>
        {activeBrowseDrag ? <BrowseDragGhost data={activeBrowseDrag} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function BrowseDragGhost({ data }) {
  const name = data.kind === 'semantics'
    ? (data.node?.businessName || data.node?.name)
    : data.property?.name;
  const logicalType = data.kind === 'semantics' ? data.node?.logicalType : data.property?.logicalType;

  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-indigo-300 bg-white px-3 py-1.5 shadow-lg cursor-grabbing">
      {data.kind === 'semantics'
        ? <ElementIcon elementType={data.node?.elementType} />
        : <ContractPropertyIcon logicalType={logicalType} />}
      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{name}</span>
      {logicalType && <span className="text-xs text-gray-500 font-mono whitespace-nowrap">{logicalType}</span>}
    </div>
  );
}

// Data product properties show their schema logical-type icon (same as the
// panel rows and the property list), not a semantic element icon.
function ContractPropertyIcon({ logicalType }) {
  const icon = getLogicalTypeIcon(logicalType);
  return icon
    ? createElement(icon, { className: 'h-3.5 w-3.5 text-gray-500 flex-shrink-0' })
    : <div className="h-3.5 w-3.5 flex-shrink-0" />;
}
