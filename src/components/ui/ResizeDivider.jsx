import { useCallback, useEffect, useRef } from 'react';

const ResizeDivider = ({ onResize, minLeftPercent = 20, maxLeftPercent = 80 }) => {
  const isDragging = useRef(false);
  const containerRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;

    const container = containerRef.current?.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newLeftPercent = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Clamp between min and max
    const clampedPercent = Math.min(Math.max(newLeftPercent, minLeftPercent), maxLeftPercent);
    onResize(clampedPercent);
  }, [onResize, minLeftPercent, maxLeftPercent]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      className="relative flex-shrink-0 cursor-col-resize w-px h-full bg-gray-300 hover:bg-blue-400 transition-colors"
      title="Drag to resize"
    >
      {/* Invisible wider hit area */}
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  );
};

export default ResizeDivider;
