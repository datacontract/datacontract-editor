import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Tooltip = ({ content, children, placement = 'top', className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      // When the wrapper uses `display: contents` it has a zero-sized
      // bounding rect, so fall back to the first real child element.
      const hostRect = triggerRef.current.getBoundingClientRect();
      const firstChild = triggerRef.current.firstElementChild;
      const rect =
        hostRect.width === 0 && hostRect.height === 0 && firstChild
          ? firstChild.getBoundingClientRect()
          : hostRect;
      if (placement === 'right') {
        setPosition({
          top: rect.top + rect.height / 2,
          left: rect.right + 8,
        });
      } else {
        setPosition({
          top: rect.top - 8,
          left: rect.left + rect.width / 2,
        });
      }
    }
  }, [isVisible, placement]);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  const tooltipClassBase = 'fixed px-3 py-2 text-xs font-normal text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none max-w-xs z-[9999]';
  const tooltipPlacementClass =
    placement === 'right'
      ? '-translate-y-1/2'
      : '-translate-x-1/2 -translate-y-full';

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={className || 'inline-flex cursor-help'}
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div
          className={`${tooltipClassBase} ${tooltipPlacementClass}`}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
          {placement === 'right' ? (
            <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 top-1/2 -translate-y-1/2 -left-1" />
          ) : (
            <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1" />
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
