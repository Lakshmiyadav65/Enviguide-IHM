import { useState, useRef } from 'react';
import {
    Plus, Upload, Layers, MapPin, ZoomIn, ZoomOut, Move,
    FileText, AlertCircle,
    ChevronRight, Layout, Maximize
} from 'lucide-react';
import './DecksView.css';

interface Deck {
    id: string;
    name: string;
    level: string;
    gaPlanUrl: string | null;
    materialsCount: number;
    hazardsCount: number;
    status: 'Active' | 'Draft' | 'Archived';
    lastUpdated: string;
}

const MOCK_DECKS: Deck[] = [
    {
        id: 'deck-001',
        name: 'Navigation Bridge Deck',
        level: 'Level 05',
        gaPlanUrl: 'https://images.unsplash.com/photo-1597423244036-ef5020e83f3c?auto=format&fit=crop&q=80&w=1600',
        materialsCount: 12,
        hazardsCount: 2,
        status: 'Active',
        lastUpdated: 'Oct 24, 2023'
    },
    {
        id: 'deck-002',
        name: 'Upper Deck',
        level: 'Level 04',
        gaPlanUrl: 'https://images.unsplash.com/photo-1581093588402-4857474d5f04?auto=format&fit=crop&q=80&w=1600',
        materialsCount: 45,
        hazardsCount: 5,
        status: 'Active',
        lastUpdated: 'Nov 12, 2023'
    },
    {
        id: 'deck-003',
        name: 'Main Deck',
        level: 'Level 03',
        gaPlanUrl: null,
        materialsCount: 0,
        hazardsCount: 0,
        status: 'Draft',
        lastUpdated: 'Jan 15, 2024'
    },
    {
        id: 'deck-004',
        name: 'Engine Room Top',
        level: 'Level 02',
        gaPlanUrl: null,
        materialsCount: 8,
        hazardsCount: 1,
        status: 'Active',
        lastUpdated: 'Dec 05, 2023'
    }
];

interface DecksViewProps {
    vesselName: string;
}

export default function DecksView({ vesselName }: DecksViewProps) {
    const [decks] = useState<Deck[]>(MOCK_DECKS);
    const [selectedDeckId, setSelectedDeckId] = useState<string>(MOCK_DECKS[0].id);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedDeck = decks.find(d => d.id === selectedDeckId);

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Mock upload
            alert(`File ${file.name} allocated to ${selectedDeck?.name}`);
        }
    };

    return (
        <div className="decks-view-container">
            {/* Sidebar List */}
            <div className={`decks-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="decks-sidebar-header">
                    <h3>Review Decks</h3>
                    <button className="add-deck-btn-icon" title="Add New Deck">
                        <Plus size={18} />
                    </button>
                </div>

                <div className="decks-list">
                    {decks.map(deck => (
                        <div
                            key={deck.id}
                            className={`deck-item-card ${selectedDeckId === deck.id ? 'active' : ''}`}
                            onClick={() => setSelectedDeckId(deck.id)}
                        >
                            <div className="deck-card-icon">
                                <Layers size={20} />
                            </div>
                            <div className="deck-card-info">
                                <span className="deck-name">{deck.name}</span>
                                <span className="deck-meta">{deck.level} • {deck.materialsCount} Materials</span>
                            </div>
                            <div className="deck-status-indicator">
                                {deck.hazardsCount > 0 && (
                                    <div className="hazard-dot" title={`${deck.hazardsCount} Hazards`}></div>
                                )}
                            </div>
                            <ChevronRight size={16} className="arrow-indicator" />
                        </div>
                    ))}
                </div>

                <div className="decks-sidebar-footer">
                    <button className="collapse-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <Layout size={16} /> {isSidebarOpen ? 'Hide Sidebar' : ''}
                    </button>
                </div>
            </div>

            {/* Main Viewer Area */}
            <div className="deck-viewer-area">
                <div className="viewer-toolbar">
                    <div className="toolbar-left">
                        <h2 className="selected-deck-title">{selectedDeck?.name || 'Select a Deck'}</h2>
                        <span className="deck-level-badge">{selectedDeck?.level}</span>
                    </div>
                    <div className="toolbar-right">
                        <div className="zoom-controls">
                            <button onClick={handleZoomOut}><ZoomOut size={18} /></button>
                            <span className="zoom-val">{Math.round(zoomLevel * 100)}%</span>
                            <button onClick={handleZoomIn}><ZoomIn size={18} /></button>
                        </div>
                        <div className="divider-v"></div>
                        <button className="tool-btn"><Move size={18} /> Pan</button>
                        <button className="tool-btn active"><MapPin size={18} /> Markers</button>
                        <button className="tool-btn primary" onClick={() => fileInputRef.current?.click()}>
                            <Upload size={16} /> Upload GA Plan
                        </button>
                    </div>
                </div>

                <div className="viewer-viewport">
                    {selectedDeck?.gaPlanUrl ? (
                        <div className="ga-plan-wrapper" style={{ transform: `scale(${zoomLevel})` }}>
                            <img
                                src={selectedDeck.gaPlanUrl}
                                alt="GA Plan"
                                className="ga-plan-image"
                            />
                            {/* Mock Markers */}
                            <div className="map-marker" style={{ top: '30%', left: '40%' }}>
                                <div className="marker-pin hazard">
                                    <AlertCircle size={14} color="white" />
                                </div>
                                <div className="marker-tooltip">Asbestos Detect</div>
                            </div>
                            <div className="map-marker" style={{ top: '55%', left: '60%' }}>
                                <div className="marker-pin safe">
                                    <div className="dot"></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-viewer-state">
                            <div className="empty-icon-circle">
                                <FileText size={48} color="#94A3B8" />
                            </div>
                            <h3>No GA Plan Uploaded</h3>
                            <p>Upload a General Arrangement (GA) plan for this deck<br />to start mapping materials.</p>
                            <button className="upload-cta-btn" onClick={() => fileInputRef.current?.click()}>
                                <Upload size={18} /> Select Plan File
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                                accept="image/*,.pdf"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
