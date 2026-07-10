import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Buffers a controlled text field locally so each keystroke renders
 * immediately. The onChange commit is expensive (store update, whole-document
 * clone + YAML re-serialization, editor-wide re-render), so it only runs after
 * a typing pause, on blur (via the returned flush), or on unmount.
 *
 * External value changes (undo, AI edits) still flow in whenever no local
 * edit is pending. `fieldKey` identifies the underlying field (e.g. the input
 * name); when it changes, a pending edit belongs to the previous field and is
 * discarded rather than committed to the wrong path — in practice a blur has
 * already flushed it before the field can be swapped.
 *
 * Returns [localValue, handleChange, flush].
 */
const useBufferedField = (value, onChange, fieldKey, delay = 300) => {
  const [localValue, setLocalValue] = useState(value ?? '');
  const pendingEventRef = useRef(null);
  const timerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const flush = useCallback(() => {
    clearTimer();
    const event = pendingEventRef.current;
    if (event !== null) {
      pendingEventRef.current = null;
      onChangeRef.current?.(event);
    }
  }, []);

  const handleChange = useCallback(
    (event) => {
      setLocalValue(event.target.value);
      pendingEventRef.current = event;
      clearTimer();
      timerRef.current = setTimeout(flush, delay);
    },
    [delay, flush]
  );

  const previousKeyRef = useRef(fieldKey);
  useEffect(() => {
    if (previousKeyRef.current !== fieldKey) {
      // The component instance now edits a different field: a pending edit
      // belongs to the previous field, so drop it instead of committing it
      previousKeyRef.current = fieldKey;
      pendingEventRef.current = null;
      clearTimer();
      setLocalValue(value ?? '');
    } else if (pendingEventRef.current === null) {
      // Take over external value changes, but never clobber an in-flight edit
      setLocalValue(value ?? '');
    }
  }, [fieldKey, value]);

  // Commit a pending edit when the field unmounts (e.g. navigating away)
  useEffect(() => flush, [flush]);

  return [localValue, handleChange, flush];
};

export default useBufferedField;
