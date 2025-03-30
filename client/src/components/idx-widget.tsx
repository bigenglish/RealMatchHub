import { useEffect, useRef } from 'react';

interface IdxWidgetProps {
  widgetId?: string;
  className?: string;
}

export default function IdxWidget({ widgetId = "40938", className = "" }: IdxWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Create and load the IDX script
    const script = document.createElement('script');
    script.charset = 'UTF-8';
    script.type = 'text/javascript';
    script.id = `idxwidgetsrc-${widgetId}`;
    script.src = `//losangelesforsale.idxbroker.com/idx/quicksearchjs.php?widgetid=${widgetId}`;
    script.async = true;
    
    // Add script to the container
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }
    
    // Cleanup function to remove the script when component unmounts
    return () => {
      if (containerRef.current && script.parentNode) {
        containerRef.current.removeChild(script);
      }
    };
  }, [widgetId]);
  
  return (
    <div 
      ref={containerRef} 
      className={`idx-widget-container ${className}`}
      id={`idx-widget-${widgetId}`}
    />
  );
}