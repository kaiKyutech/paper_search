import React, { useState, useEffect, useRef } from "react";
import { MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH_RATIO } from "../config/constants";

interface ResizablePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  headerHeight: number;
  defaultWidth?: number;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  isOpen,
  onClose,
  children,
  headerHeight,
  defaultWidth = 384
}) => {
  const [sidebarWidth, setSidebarWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = MIN_SIDEBAR_WIDTH;
      const maxWidth = window.innerWidth * MAX_SIDEBAR_WIDTH_RATIO;
      
      setSidebarWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed right-0 h-full bg-white shadow-lg z-40 transform transition-all duration-300 ease-in-out flex"
      style={{ 
        top: headerHeight, 
        height: `calc(100% - ${headerHeight}px)`,
        width: `${sidebarWidth}px`
      }}
    >
      {/* リサイズハンドル */}
      <div 
        ref={resizeRef}
        className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors duration-200 flex-shrink-0 group relative"
        onMouseDown={handleResizeStart}
        title="サイドバーの幅を調整"
      >
        <div className="w-full h-full relative">
          <div className="absolute inset-y-0 -left-2 -right-2 group-hover:bg-blue-500 group-hover:opacity-20 transition-all duration-200"></div>
          {/* リサイズインジケーター */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex flex-col space-y-0.5">
              <div className="w-0.5 h-1 bg-white rounded"></div>
              <div className="w-0.5 h-1 bg-white rounded"></div>
              <div className="w-0.5 h-1 bg-white rounded"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* サイドパネルコンテンツ */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};