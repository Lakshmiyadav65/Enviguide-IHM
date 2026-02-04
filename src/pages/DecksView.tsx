import { useState, useRef, useEffect } from 'react';
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
    ExternalLink,
    X
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
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [expandedDeckId, setExpandedDeckId] = useState<string | null>(null);
    const [mappedSections, setMappedSections] = useState<MappedSection[]>([]);

    // Initial state is now empty for all vessels
    useEffect(() => {
        // Reset state when vessel changes
        setUploadedFile(null);
        setUploadedFileUrl(null);
        setMappedSections([]);
    }, [vesselName]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            setUploadProgress(0);

            // Simulate upload
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.floor(Math.random() * 15) + 5;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsUploading(false);
                        setUploadedFile(file.name);
                        const url = URL.createObjectURL(file);
                        setUploadedFileUrl(url);
                    }, 500);
                }
                setUploadProgress(progress);
            }, 300);
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

    // Component to show a technical cropped preview of the deck - "Tight Crop"
    const DeckPreview = ({ rect, fileUrl }: { rect: Rect, fileUrl: string }) => {
        const containerSize = 56;

        // Use 'contain' logic to fit selection within the 56px square
        const scaleX = containerSize / rect.width;
        const scaleY = containerSize / rect.height;
        const scale = Math.min(scaleX, scaleY);

        // Size of the selection area at this scale
        const scaledW = rect.width * scale;
        const scaledH = rect.height * scale;

        return (
            <div className="deck-technical-preview-outer" style={{
                width: containerSize,
                height: containerSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F2F4F7',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${scaledW}px`,
                    height: `${scaledH}px`,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <img
                        src={fileUrl}
                        alt="Deck Preview"
                        style={{
                            position: 'absolute',
                            left: `${-rect.x * scale}px`,
                            top: `${-rect.y * scale}px`,
                            width: `${1000 * scale}px`,
                            height: 'auto',
                            maxWidth: 'none',
                            pointerEvents: 'none'
                        }}
                    />
                </div>
            </div>
        );
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
                {isUploading ? (
                    <div className="ga-upload-loading-row">
                        <div className="ga-upload-label">
                            <Upload size={18} color="#00B0FA" />
                            <span>GA Plans Upload</span>
                        </div>
                        <div className="ga-progress-container">
                            <div className="ga-progress-bar-bg">
                                <div className="ga-progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                                <div className="ga-progress-text-overlay">
                                    <span>Uploading: <strong>GA_Plan_Main_Deck.pdf</strong></span>
                                </div>
                            </div>
                            <span className="ga-progress-percentage">{uploadProgress}%</span>
                        </div>
                        <div className="ga-upload-extra-actions">
                            <button className="ga-extra-btn" onClick={() => setIsUploading(false)}><X size={18} /></button>
                            <button className="ga-extra-btn"><Settings size={18} /></button>
                            <button className="ga-extra-btn"><ExternalLink size={18} /></button>
                        </div>
                    </div>
                ) : uploadedFile ? (
                    <div className="ga-upload-success-row">
                        <div className="ga-upload-label">
                            <Upload size={18} color="#00B0FA" />
                            <span>GA Plans Upload</span>
                        </div>
                        <div className="ga-file-info-pill">
                            <div className="check-icon-circle-mini">
                                <CheckCircle size={14} />
                            </div>
                            <span className="ga-filename"><strong>{uploadedFile}</strong> Uploaded</span>
                        </div>
                        <div className="ga-upload-extra-actions">
                            <button className="ga-remove-btn-plain" onClick={removeUploadedFile} title="Remove plan">
                                <Trash2 size={18} />
                            </button>
                            <button className="ga-extra-btn"><Settings size={18} /></button>
                            <button className="ga-extra-btn highlight" onClick={() => setIsViewerOpen(true)} title="Open Viewer">
                                <ExternalLink size={18} />
                            </button>
                        </div>
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
                            {/* Icons removed in initial state per request */}
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
                        className={`add-deck-btn ${(!uploadedFile || isUploading) ? 'disabled' : ''}`}
                        disabled={!uploadedFile || isUploading}
                        onClick={() => setIsViewerOpen(true)}
                    >
                        <Plus size={18} />
                        Add New Deck
                    </button>
                </div>

                <div className="decks-list">
                    {!uploadedFile && !isUploading ? (
                        <div className="no-decks-centered-state-integrated">
                            <div className="deck-empty-visual-canvas">
                                <div className="deck-blueprint-illustration-premium">
                                    <div className="blueprint-spinner-inner">
                                        <div className="dual-ring-spinner"></div>
                                    </div>
                                    <div className="plus-floating-mini">
                                        <Plus size={14} />
                                    </div>
                                </div>
                            </div>
                            <h4 className="empty-state-title-large">No Active Decks for {vesselName}</h4>
                            <p className="empty-state-subtitle-large">
                                Upload a GA Plan for <strong>{vesselName}</strong> to start mapping vessel decks and material logs.
                            </p>
                            {/* Preparing workspace indicator removed from initial state per request */}
                            <button className="upload-first-plan-btn-premium" onClick={() => fileInputRef.current?.click()}>
                                <FileText size={18} />
                                Upload First Plan
                            </button>
                        </div>
                    ) : isUploading ? (
                        <div className="no-decks-centered-state-integrated">
                            <div className="deck-empty-visual-canvas">
                                <div className="deck-blueprint-illustration-premium">
                                    <div className="blueprint-spinner-inner active">
                                        <div className="dual-ring-spinner animate"></div>
                                    </div>
                                    <div className="plus-floating-mini">
                                        <Plus size={14} />
                                    </div>
                                </div>
                            </div>
                            <h4 className="empty-state-title-large">Uploading Plan...</h4>
                            <p className="empty-state-subtitle-large">
                                Please wait while we process your GA Plan for mapping.
                            </p>
                            <div className="preparing-workspace-indicator active">
                                PREPARING WORKSPACE...
                            </div>
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
                                You have uploaded the GA Plan. Now use the <strong>Viewer tool</strong> to create decks and material logs.
                            </p>
                            {/* Open Drawing Tool button removed per request */}
                        </div>
                    ) : (
                        <>
                            {mappedSections.map((deck, idx) => (
                                <div key={deck.id} className="deck-row-card">
                                    <div className="deck-row-header" onClick={() => toggleExpand(deck.id)}>
                                        <div className="deck-row-icon-box">
                                            {uploadedFileUrl ? (
                                                <DeckPreview rect={deck.rect} fileUrl={uploadedFileUrl} />
                                            ) : (
                                                deck.title.toLowerCase().includes('tank') ? <Layers size={21} /> : <Compass size={21} />
                                            )}
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
