import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import GAPlanViewer from './GAPlanViewer';

export default function FullPlanViewer() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const fileUrl = query.get('url') || '';
    const filename = query.get('name') || 'Plan Viewer';

    const [mappedSections, setMappedSections] = useState([]);

    if (!fileUrl) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px',
                background: '#F9FAFB',
                color: '#667085'
            }}>
                <h3>No Plan Selected</h3>
                <p>Please select a plan from the Decks view to open the viewer.</p>
                <button
                    onClick={() => window.close()}
                    style={{
                        padding: '10px 20px',
                        background: '#00B0FA',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    Close Tab
                </button>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <GAPlanViewer
                filename={filename}
                fileUrl={fileUrl}
                onClose={() => window.close()}
                mappedSections={mappedSections}
                onUpdateSections={setMappedSections as any}
            />
        </div>
    );
}
