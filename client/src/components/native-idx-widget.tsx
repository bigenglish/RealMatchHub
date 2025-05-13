import React, { useEffect, useRef, useState } from 'react';

interface NativeIDXWidgetProps {
    widgetId: string;
    activeTab: string;
    debug?: boolean;
}

const NativeIDXWidget: React.FC<NativeIDXWidgetProps> = ({ widgetId, activeTab, debug = false }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === "native" && containerRef.current) {
            setLoading(true);
            setError(null);
            containerRef.current.innerHTML = ""; // Clear existing content

            try {
                // Direct content approach - no iframe
                // This approach puts IDX content directly in the page DOM
                containerRef.current.innerHTML = `
                    <div style="min-height: 600px; width: 100%;">
                        <!-- Direct IDX integration -->
                        <div id="IDX-directContent">
                            <script charset="UTF-8" type="text/javascript" src="//losangelesforsale.idxbroker.com/idx/mapwidgetjs.php?widgetid=${widgetId}"></script>
                        </div>
                    </div>
                `;
                
                // Log success message
                console.log("IDX Widget initialized - direct DOM insertion method");
                setLoading(false);
            } catch (err) {
                console.error("Error initializing IDX widget:", err);
                setError("Failed to initialize IDX widget. Please check browser console for details.");
                setLoading(false);
            }
        }
    }, [activeTab, widgetId]);

    if (loading) {
        return (
            <div ref={containerRef} style={{ minHeight: '600px' }}>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Loading IDX Broker content...</p>
                    <div style={{ width: '50px', height: '50px', margin: '20px auto', border: '5px solid #f3f3f3', borderTop: '5px solid #3498db', borderRadius: '50%', animation: 'spin 2s linear infinite' }}></div>
                </div>
            </div>
        );
    }

    if (error && debug) {
        return (
            <div ref={containerRef} style={{ minHeight: '600px' }}>
                <div style={{ padding: '20px', border: '1px solid #f00', borderRadius: '5px', backgroundColor: '#fff0f0' }}>
                    <h3 style={{ color: '#d00', marginTop: 0 }}>IDX Widget Error</h3>
                    <p>{error}</p>
                    <p>Widget ID: {widgetId}</p>
                    <p>Active Tab: {activeTab}</p>
                </div>
            </div>
        );
    }

    return <div ref={containerRef} style={{ minHeight: '600px' }} />;
};

export default NativeIDXWidget;