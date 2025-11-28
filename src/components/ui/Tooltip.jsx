import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8, // 8px above the trigger
        left: rect.left + rect.width / 2, // centered horizontally
      });
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex cursor-help"
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div
          className="fixed px-3 py-2 text-xs font-normal text-white bg-gray-900 rounded-lg shadow-lg -translate-x-1/2 -translate-y-full pointer-events-none max-w-xs"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 9999
          }}
        >
          {content}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1" />
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
