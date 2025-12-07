import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const TabSlider = ({ value, onChange, options = [] }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabRefs = useRef({});
  const containerRef = useRef(null);
  const prevValuesRef = useRef({ left: '', width: '' });

  useEffect(() => {
    let timeoutId;
    let rafId;
    let isMounted = true;
    
    const updateIndicator = () => {
      if (!isMounted) return;
      
      const activeTab = tabRefs.current[value];
      const container = containerRef.current;
      
      if (activeTab && container) {
        const containerRect = container.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        
        const newLeft = `${tabRect.left - containerRect.left}px`;
        const newWidth = `${tabRect.width}px`;
        
        // Only update if the values actually changed to prevent infinite loops
        if (prevValuesRef.current.left !== newLeft || prevValuesRef.current.width !== newWidth) {
          prevValuesRef.current = { left: newLeft, width: newWidth };
          setIndicatorStyle({
            left: newLeft,
            width: newWidth,
            opacity: 1,
          });
        }
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    rafId = requestAnimationFrame(() => {
      if (isMounted) {
        updateIndicator();
        // Also update after a small delay to catch any layout changes
        timeoutId = setTimeout(updateIndicator, 10);
      }
    });
    
    window.addEventListener('resize', updateIndicator);
    
    return () => {
      isMounted = false;
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [value]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        display: 'inline-flex',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '4px',
        gap: '4px',
      }}
    >
      {/* Sliding indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: '4px',
          height: 'calc(100% - 8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '6px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
          ...indicatorStyle,
        }}
      />
      
      {/* Tab buttons */}
      {options.map((option) => (
        <Box
          key={option.value}
          ref={(el) => (tabRefs.current[option.value] = el)}
          onClick={() => onChange(option.value)}
          sx={{
            position: 'relative',
            padding: '8px 16px',
            cursor: 'pointer',
            userSelect: 'none',
            borderRadius: '6px',
            transition: 'color 0.2s ease',
            color: value === option.value 
              ? 'rgba(0, 0, 0, 0.87)' 
              : 'rgba(255, 255, 255, 0.7)',
            fontWeight: value === option.value ? 600 : 400,
            zIndex: 1,
            '&:hover': {
              color: value === option.value 
                ? 'rgba(0, 0, 0, 0.87)' 
                : 'rgba(255, 255, 255, 0.9)',
            },
          }}
        >
          {option.label}
        </Box>
      ))}
    </Box>
  );
};

export default TabSlider;