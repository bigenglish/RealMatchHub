import React, { useEffect, useRef } from 'react';

interface NativeIDXWidgetProps {
    widgetId: string;
    activeTab: string;
}

const NativeIDXWidget: React.FC<NativeIDXWidgetProps> = ({ widgetId, activeTab }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeTab === "native" && containerRef.current) {
            containerRef.current.innerHTML = ""; // Clear existing content

            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '600px'; // Adjust height as needed
            iframe.style.border = 'none';
            iframe.className = 'idx-iframe';
            containerRef.current.appendChild(iframe);

            iframe.onload = () => {
                const iframeDocument = iframe.contentWindow?.document;
                if (iframeDocument) {
                    iframeDocument.open();
                    iframeDocument.write(`
                        <script charset="UTF-8" type="text/javascript" src="//losangelesforsale.idxbroker.com/idx/mapwidgetjs.php?widgetid=${widgetId}"></script>
                    `);
                    iframeDocument.close();
                }
            };
        }
    }, [activeTab, widgetId]);

    return <div ref={containerRef} className="idx-isolated" style={{ minHeight: '600px' }} />;
};

export default NativeIDXWidget;