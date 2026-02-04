import { useState, useRef } from 'react';
import {
    Upload,
    Plus,
    CheckCircle,
    Trash2,
    Edit3,
    ChevronDown,
    ChevronUp,
    Compass,
    Layers,
    FileText,
    Settings,
    ExternalLink
} from 'lucide-react';
import GAPlanViewer from './GAPlanViewer';
import './DecksView.css';

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface MappedSection {
    id: string;
    title: string;
    sectionId: string;
    rect: Rect;
    itemsCount: number;
    isVisible?: boolean;
}

export default function DecksView({ vesselName }: { vesselName: string }) {
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [expandedDeckId, setExpandedDeckId] = useState<string | null>(null);
    const [mappedSections, setMappedSections] = useState<MappedSection[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file.name);
            const url = URL.createObjectURL(file);
            setUploadedFileUrl(url);
        }
    };

    const removeUploadedFile = () => {
        if (uploadedFileUrl) URL.revokeObjectURL(uploadedFileUrl);
        setUploadedFile(null);
        setUploadedFileUrl(null);
    };

    const toggleExpand = (id: string) => {
        setExpandedDeckId(expandedDeckId === id ? null : id);
    };

    if (isViewerOpen && uploadedFileUrl) {
        return (
            <GAPlanViewer
                filename={uploadedFile || ''}
                fileUrl={uploadedFileUrl}
                onClose={() => setIsViewerOpen(false)}
                mappedSections={mappedSections as any}
                onUpdateSections={setMappedSections as any}
            />
        );
    }

    return (
        <div className={`decks-view-container ${!uploadedFile ? 'no-scroll' : ''}`}>
            {/* GA Plans Upload Section */}
            <div className="ga-upload-card-refined">
                {uploadedFile ? (
                    <div className="ga-upload-success-row">
                        <div className="ga-file-info">
                            <div className="check-icon-circle">
                                <CheckCircle size={16} />
                            </div>
                            <span className="ga-filename"><strong>{uploadedFile}</strong> Uploaded</span>
                        </div>
                        <button className="ga-remove-btn" onClick={removeUploadedFile} title="Remove plan">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="ga-upload-initial-row">
                        <div className="ga-upload-label">
                            <Upload size={18} color="#00B0FA" />
                            <span>GA Plans Upload</span>
                        </div>
                        <div className="ga-upload-dropzone-right" onClick={() => fileInputRef.current?.click()}>
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.png,.jpg,.jpeg" style={{ display: 'none' }} />
                            <span className="dropzone-text">Choose file or drag & drop GA Plans here (PDF, PNG, JPEG up to 50MB)</span>
                            <Upload size={16} className="dropzone-icon" />
                        </div>
                        <div className="ga-upload-extra-actions">
                            <button className="ga-extra-btn"><Settings size={18} /></button>
                            <button className="ga-extra-btn"><ExternalLink size={18} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Active Decks Section Card - Always Visible Template */}
            <div className="active-decks-section-card">
                <div className="active-decks-header">
                    <div className="active-decks-title">
                        <h3>Active Decks</h3>
                        <span className="deck-count-badge">{mappedSections.length}</span>
                    </div>
                    <button
                        className={`add-deck-btn ${!uploadedFile ? 'disabled' : ''}`}
                        disabled={!uploadedFile}
                        onClick={() => setIsViewerOpen(true)}
                    >
                        <Plus size={18} />
                        Add New Deck
                    </button>
                </div>

                <div className="decks-list">
                    {!uploadedFile ? (
                        <div className="no-decks-centered-state-integrated">
                            <div className="deck-empty-visual-canvas">
                                <div className="deck-blueprint-illustration">
                                    <div className="blueprint-line h-1"></div>
                                    <div className="blueprint-line h-2"></div>
                                    <div className="blueprint-compass">
                                        <Compass size={40} strokeWidth={1} />
                                    </div>
                                    <div className="blueprint-line h-3"></div>
                                    <div className="blueprint-line h-4"></div>
                                    <div className="plus-floating-circle">
                                        <Plus size={18} />
                                    </div>
                                </div>
                            </div>
                            <h4 className="empty-state-title-large">No Active Decks</h4>
                            <p className="empty-state-subtitle-large">
                                Upload a GA Plan to start mapping your vessel decks and material logs.
                            </p>
                            <button className="upload-first-plan-btn-hero" onClick={() => fileInputRef.current?.click()}>
                                <FileText size={18} />
                                Upload First Plan
                            </button>
                        </div>
                    ) : mappedSections.length === 0 ? (
                        <div className="no-decks-centered-state">
                            <div className="empty-compass-container">
                                <div className="compass-icon-refined">
                                    <Compass size={32} />
                                </div>
                            </div>
                            <h4 className="empty-state-title">No Decks Mapped Yet</h4>
                            <p className="empty-state-subtitle">
                                You have uploaded the GA Plan. Now select areas on the plan to create decks and material logs.
                            </p>
                            <button className="open-drawing-tool-btn" onClick={() => setIsViewerOpen(true)}>
                                <Plus size={16} />
                                Open Drawing Tool to Map Decks
                            </button>
                        </div>
                    ) : (
                        <>
                            {mappedSections.map((deck, idx) => (
                                <div key={deck.id} className="deck-row-card">
                                    <div className="deck-row-header" onClick={() => toggleExpand(deck.id)}>
                                        <div className="deck-row-icon-box">
                                            {deck.title.toLowerCase().includes('tank') ? <Layers size={21} /> : <Compass size={21} />}
                                        </div>
                                        <div className="deck-row-main-info">
                                            <h4>{deck.title}</h4>
                                            <span className="deck-section-tag">{deck.sectionId || `SECTION 0${idx + 1}`}</span>
                                        </div>
                                        <div className="items-in-log-badge">
                                            {deck.itemsCount || 0} ITEMS IN LOG
                                        </div>
                                        <div className="deck-row-actions">
                                            <button className="action-icon-btn"><Edit3 size={18} /></button>
                                            <button className="action-icon-btn" onClick={(e) => { e.stopPropagation(); setMappedSections(prev => prev.filter(s => s.id !== deck.id)); }}><Trash2 size={18} /></button>
                                            <div className="action-icon-btn">
                                                {expandedDeckId === deck.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </div>
                                    </div>

                                    {expandedDeckId === deck.id && (
                                        <div className="deck-log-expanded">
                                            <div className="log-title-row">
                                                <div className="log-header-left">
                                                    <FileText size={16} color="#00B0FA" />
                                                    <span className="log-title-text">MATERIAL LOG FOR {deck.title}</span>
                                                </div>
                                                <a href="#" className="view-all-materials-link">View All Materials</a>
                                            </div>

                                            <div className="material-log-content-box">
                                                {deck.itemsCount > 0 ? (
                                                    <div className="material-items-preview">
                                                        <div className="preview-placeholder">
                                                            <CheckCircle size={16} color="#12B76A" />
                                                            <span>Showing {deck.itemsCount} materials from log.</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="no-materials-placeholder">
                                                        <p>No materials logged for this section yet.</p>
                                                        <button className="add-material-btn-mini">
                                                            <Plus size={14} /> Add Material
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="add-plan-section-container">
                                <button className="add-plan-section-dashed-refined" onClick={() => setIsViewerOpen(true)}>
                                    <Plus size={20} />
                                    Add New Plan Section
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
