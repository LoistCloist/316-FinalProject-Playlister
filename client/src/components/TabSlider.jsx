import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const TabSlider = ({ value, onChange, options = [] }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabRefs = useRef({});
  const containerRef = useRef(null);

  useEffect(() => {
    const updateIndicator = () => {
      const activeTab = tabRefs.current[value];
      const container = containerRef.current;
      
      if (activeTab && container) {
        const containerRect = container.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        
        setIndicatorStyle({
          left: `${tabRect.left - containerRect.left}px`,
          width: `${tabRect.width}px`,
          opacity: 1,
        });
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateIndicator, 0);
    
    return () => {
      window.removeEventListener('resize', updateIndicator);
      clearTimeout(timeoutId);
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

