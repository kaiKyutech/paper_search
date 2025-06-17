import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  className?: string;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({ 
  text, 
  maxLines = 2, 
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(textRef.current).lineHeight);
      const height = textRef.current.scrollHeight;
      const lines = Math.floor(height / lineHeight);
      setShouldShowToggle(lines > maxLines);
    }
  }, [text, maxLines]);

  return (
    <div>
      <p
        ref={textRef}
        className={`${className} transition-all duration-300`}
        style={{
          display: isExpanded ? 'block' : '-webkit-box',
          WebkitLineClamp: isExpanded ? 'unset' : maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: isExpanded ? 'visible' : 'hidden'
        }}
      >
        {text}
      </p>
      {shouldShowToggle && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-xs text-blue-600 hover:text-blue-800 mt-1 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={14} className="mr-1" />
              表示を少なくする
            </>
          ) : (
            <>
              <ChevronDown size={14} className="mr-1" />
              もっと見る
            </>
          )}
        </button>
      )}
    </div>
  );
};