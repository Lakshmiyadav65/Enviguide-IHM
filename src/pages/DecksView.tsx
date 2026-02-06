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
    Pencil
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
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

interface UploadedPlan {
    id: string;
    name: string;
    url: string;
    date: string;
}

export default function DecksView({ vesselName }: { vesselName: string }) {
    const [uploadedPlans, setUploadedPlans] = useState<UploadedPlan[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [activePlanId, setActivePlanId] = useState<string | null>(null);
    const [expandedDeckId, setExpandedDeckId] = useState<string | null>(null);
    const [mappedSections, setMappedSections] = useState<MappedSection[]>([]);

    useEffect(() => {
        // Reset state when vessel changes
        if (vesselName === 'MV Ocean Pioneer' && uploadedPlans.length === 0) {
            // Generate Static Data
            const staticPlanId = uuidv4();
            const staticPlan = {
                id: staticPlanId,
                name: 'General Arrangement - Main Deck.png',
                // Use a reliable placeholder image that looks like a technical plan
                url: 'https://placehold.co/2000x1400/f8fafc/cbd5e1.png?text=Technical+GA+Plan+Layout+-+Main+Deck',
                date: 'Oct 12, 2023'
            };
            setUploadedPlans([staticPlan]);
            setActivePlanId(staticPlanId);

            // Create 5 specific decks as requested: 3 w/ data, 2 empty
            const deckDefinitions = [
                { name: 'Bridge Proof', id: 'BRIDGE-01', count: 6 },
                { name: 'Tank Top', id: 'TANK-04', count: 34 },
                { name: 'Upper Deck', id: 'UPPER-02', count: 12 },
                { name: 'Cargo Hold 1', id: 'HOLD-01', count: 0 },
                { name: 'Engine Room', id: 'ENG-01', count: 0 }
            ];

            const newSections: MappedSection[] = deckDefinitions.map((def, index) => ({
                id: uuidv4(),
                title: def.name,
                sectionId: def.id,
                rect: {
                    x: 100 + (index * 150),
                    y: 100 + (index * 100),
                    width: 300,
                    height: 200
                },
                itemsCount: def.count,
                isVisible: true
            }));

            // Static Data Templates for the first 3 decks
            const staticMaterials = [
                {
                    name: 'Parts of Brass',
                    material: 'Brass',
                    desc: 'Part I Materials contained in ship structure or equipment - I-2 Equipment and machinery.',
                    loc: 'Accommodation Part B, Bridge Roof',
                    hmPart: 'Part I-2'
                },
                {
                    name: 'Copper Tubing',
                    material: 'Copper',
                    desc: 'Standard marine grade copper tubing for hydraulic control lines.',
                    loc: '0.05m³ in W.T. SWITCH',
                    hmPart: 'Part II'
                },
                {
                    name: 'Fluorescent Tubes',
                    material: 'Mercury',
                    desc: 'Mercury containing lamps for lighting fixtures throughout the bridge section.',
                    loc: 'Bridge Ceiling Panel A',
                    hmPart: 'Part II-2-1'
                },
                {
                    name: 'Lead-acid Batteries',
                    material: 'Lead',
                    desc: 'Emergency backup batteries for bridge communication equipment.',
                    loc: 'Radio Battery Box',
                    hmPart: 'Part I-1'
                },
                {
                    name: 'Fire Dampers',
                    material: 'Asbestos',
                    desc: 'Mechanical ventilation components with possible asbestos-containing gaskets.',
                    loc: 'Ventilation Shaft A',
                    hmPart: 'Part I-1-2'
                },
                {
                    name: 'Mercury Switches',
                    material: 'Mercury',
                    desc: 'Tilt-sensing switches within the bridge console control modules.',
                    loc: 'Bridge Console Main',
                    hmPart: 'Part II-2-2'
                }
            ];

            // Populate LocalStorage
            newSections.forEach((section, idx) => {
                if (idx < 3) {
                    // Fill first 3 with valid data
                    const materials = Array.from({ length: section.itemsCount }).map((_, i) => {
                        const template = staticMaterials[i % staticMaterials.length];
                        return {
                            id: uuidv4(),
                            name: template.name,
                            material: template.material, // Keep main type simple
                            description: template.desc, // Add description field
                            pin: {
                                x: section.rect.x + Math.random() * section.rect.width,
                                y: section.rect.y + Math.random() * section.rect.height
                            },
                            ihmPart: template.hmPart,
                            hazMaterials: [template.material],
                            deckPlan: section.title,
                            shipPO: 'PO-12345',
                            compartment: template.loc, // Mapping location to compartment for display
                            equipment: 'System A',
                            position: 'Wall',
                            component: 'Unit',
                            quantity: '1',
                            unit: 'pc',
                            hmStatus: 'CHM',
                            files: [],
                            avoidUpdation: false,
                            movementType: 'Installation'
                        };
                    });
                    localStorage.setItem(`inventory_${section.title}`, JSON.stringify(materials));
                } else {
                    // Last 2 empty
                    localStorage.setItem(`inventory_${section.title}`, JSON.stringify([]));
                }
            });

            setMappedSections(newSections);
        }
    }, [vesselName]);

    // Sync itemsCount from localStorage
    useEffect(() => {
        const handleStorage = () => {
            setMappedSections(prev => prev.map(section => {
                const storedInventory = localStorage.getItem(`inventory_${section.title}`);
                if (storedInventory) {
                    const items = JSON.parse(storedInventory);
                    return { ...section, itemsCount: items.length };
                }
                return section;
            }));
        };

        window.addEventListener('storage', handleStorage);
        // Also check on mount
        handleStorage();
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

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
                        const url = URL.createObjectURL(file);
                        const newId = Math.random().toString(36).substr(2, 9);
                        const newPlan = {
                            id: newId,
                            name: file.name,
                            url: url,
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        };
                        setUploadedPlans(prev => [...prev, newPlan]);
                        setActivePlanId(newId); // Ensure the new plan is active
                    }, 500);
                }
                setUploadProgress(progress);
            }, 300);
        }
    };

    const removePlan = (id: string) => {
        setUploadedPlans(prev => {
            const planToRemove = prev.find(p => p.id === id);
            if (planToRemove) URL.revokeObjectURL(planToRemove.url);
            return prev.filter(p => p.id !== id);
        });
        if (activePlanId === id) {
            setActivePlanId(null);
        }
    };

    useEffect(() => {
        if (mappedSections.length > 0) {
            localStorage.setItem('active_vessel_sections', JSON.stringify(mappedSections));
        }
    }, [mappedSections]);

    const toggleExpand = (id: string) => {
        setExpandedDeckId(expandedDeckId === id ? null : id);
    };

    // Component to show a technical cropped preview of the deck
    const DeckPreview = ({ rect, fileUrl, deckTitle }: { rect: Rect, fileUrl: string, deckTitle: string }) => {
        const CROPPER_W = 1000;
        const CROPPER_H = 700;
        const displayWidth = 180;
        const scale = displayWidth / CROPPER_W;
        const displayHeight = CROPPER_H * scale;

        // Fetch markers for this deck
        const [markers, setMarkers] = useState<{ x: number, y: number }[]>([]);

        useEffect(() => {
            const stored = localStorage.getItem(`inventory_${deckTitle}`);
            if (stored) {
                const items = JSON.parse(stored);
                setMarkers(items.map((it: any) => it.pin).filter(Boolean));
            }
        }, [deckTitle]);

        return (
            <div className="deck-technical-preview-outer" style={{
                width: displayWidth,
                height: displayHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F2F4F7',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <img
                    src={fileUrl}
                    alt="Deck Preview"
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: `${displayWidth}px`,
                        height: 'auto',
                        maxWidth: 'none',
                        pointerEvents: 'none'
                    }}
                />
                {/* Crop area highlight in preview */}
                <div style={{
                    position: 'absolute',
                    left: rect.x * scale,
                    top: rect.y * scale,
                    width: rect.width * scale,
                    height: rect.height * scale,
                    border: '1.5px solid #00B0FA',
                    background: 'rgba(0, 176, 250, 0.1)',
                    boxSizing: 'border-box',
                    zIndex: 1
                }} />

                {/* Reflect Material Markers */}
                {markers.map((pin, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        left: (pin.x) * scale,
                        top: (pin.y) * scale,
                        width: '4px',
                        height: '4px',
                        background: '#EF4444',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 0 4px rgba(239, 68, 68, 0.6)',
                        zIndex: 2
                    }} />
                ))}
            </div>
        );
    };

    const activePlan = uploadedPlans.find(p => p.id === activePlanId) || (uploadedPlans.length > 0 ? uploadedPlans[0] : null);

    if (isViewerOpen && activePlan) {
        return (
            <GAPlanViewer
                filename={activePlan.name}
                fileUrl={activePlan.url}
                onClose={() => setIsViewerOpen(false)}
                mappedSections={mappedSections as any}
                onUpdateSections={setMappedSections as any}
            />
        );
    }

    const openMapping = (deck: MappedSection) => {
        if (!activePlan) return;
        const urlParams = new URLSearchParams({
            url: activePlan.url,
            name: deck.title,
            x: deck.rect.x.toString(),
            y: deck.rect.y.toString(),
            w: deck.rect.width.toString(),
            h: deck.rect.height.toString()
        });
        window.open(`/mapping?${urlParams.toString()}`, '_blank');
    };

    return (
        <div className={`decks-view-container ${uploadedPlans.length === 0 ? 'no-scroll' : ''}`}>
            {/* GA Plans Upload Section */}
            <div className="ga-upload-card-refined">
                <div className="ga-upload-initial-row">
                    <div className="ga-upload-label clickable" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={18} color="#00B0FA" />
                        <span>GA Plans Upload</span>
                    </div>
                    {isUploading ? (
                        <div className="ga-progress-container">
                            <div className="ga-progress-bar-bg">
                                <div className="ga-progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                                <div className="ga-progress-text-overlay">
                                    <span>Uploading: <strong>Plan_Section.pdf</strong></span>
                                </div>
                            </div>
                            <span className="ga-progress-percentage">{uploadProgress}%</span>
                        </div>
                    ) : (
                        <div className="ga-upload-dropzone-right" onClick={() => fileInputRef.current?.click()}>
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.png,.jpg,.jpeg" style={{ display: 'none' }} />
                            <span className="dropzone-text">Choose file or drag & drop GA Plans here (PDF, PNG, JPEG up to 50MB)</span>
                            <Upload size={16} className="dropzone-icon" />
                        </div>
                    )}
                </div>

                {(uploadedPlans.length > 0) && (
                    <div className={`uploaded-plans-container ${uploadedPlans.length > 2 ? 'has-multiple' : ''}`}>
                        {uploadedPlans.length > 2 && (
                            <div className="plans-summary-badge">
                                <FileText size={16} />
                                <span>You have <strong>{uploadedPlans.length} plans</strong> uploaded</span>
                                <ChevronDown size={16} className="summary-chevron" />
                            </div>
                        )}

                        <div className="uploaded-plans-list">
                            {uploadedPlans.map(plan => (
                                <div
                                    key={plan.id}
                                    className={`plan-item-row ${activePlanId === plan.id ? 'active' : ''}`}
                                    onClick={() => setActivePlanId(plan.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="plan-name-info">
                                        <FileText size={16} className="plan-icon" />
                                        <div className="plan-text-meta">
                                            <span className="plan-filename">{plan.name}</span>
                                            <span className="plan-date">{plan.date}</span>
                                        </div>
                                    </div>
                                    <div className="plan-row-actions">
                                        <button className="plan-action-btn" title="Settings">
                                            <Settings size={18} />
                                        </button>
                                        <button className="plan-action-btn delete" onClick={(e) => { e.stopPropagation(); removePlan(plan.id); }} title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                        <button
                                            className="open-full-viewer-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(`/viewer?url=${encodeURIComponent(plan.url)}&name=${encodeURIComponent(plan.name)}`, '_blank');
                                            }}
                                        >
                                            <ExternalLink size={16} />
                                            OPEN IN FULL VIEWER
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Active Decks Section Card */}
            <div className="active-decks-section-card">
                <div className="active-decks-header">
                    <div className="active-decks-title">
                        <h3>Active Decks</h3>
                        <span className="deck-count-badge">{mappedSections.length}</span>
                    </div>
                    <button
                        className={`add-deck-btn ${(uploadedPlans.length === 0 || isUploading) ? 'disabled' : ''}`}
                        disabled={uploadedPlans.length === 0 || isUploading}
                        onClick={() => setIsViewerOpen(true)}
                    >
                        <Plus size={18} />
                        Add New Deck
                    </button>
                </div>

                <div className="decks-list-content">
                    {uploadedPlans.length === 0 && !isUploading ? (
                        <div className="no-decks-centered-state-integrated">
                            <div className="deck-empty-visual-canvas">
                                <div className="deck-blueprint-illustration-premium">
                                    <div className="blueprint-canvas">
                                        <div className="tech-lines-system">
                                            <div className="tech-line-group left">
                                                <div className="line-segment long"></div>
                                                <div className="line-segment short"></div>
                                            </div>
                                            <div className="tech-line-group center">
                                                <div className="line-segment medium"></div>
                                                <div className="line-segment short"></div>
                                                <div className="line-segment medium"></div>
                                            </div>
                                            <div className="tech-line-group right">
                                                <div className="line-segment short"></div>
                                                <div className="line-segment long"></div>
                                            </div>
                                        </div>
                                        <div className="divider-tool-v3">
                                            <div className="divider-head-box">
                                                <div className="divider-handle"></div>
                                                <div className="divider-circle-v3">
                                                </div>
                                            </div>
                                            <div className="divider-legs-v3">
                                                <div className="leg-v3 left"></div>
                                                <div className="leg-v3 right"></div>
                                            </div>
                                        </div>
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
                            <button className="upload-first-plan-btn-premium" onClick={() => fileInputRef.current?.click()}>
                                <FileText size={18} />
                                Upload First Plan
                            </button>
                        </div>
                    ) : isUploading ? (
                        <div className="no-decks-centered-state-integrated">
                            <div className="deck-empty-visual-canvas">
                                <div className="deck-blueprint-illustration-premium">
                                    <div className="blueprint-canvas is-uploading">
                                        <div className="wave-lines anim-fast">
                                            <div className="wave-line"></div>
                                            <div className="wave-line"></div>
                                            <div className="wave-line"></div>
                                            <div className="wave-line"></div>
                                        </div>
                                        <div className="divider-tool-uploading">
                                            <div className="upload-pulse-ring"></div>
                                            <Upload size={32} />
                                        </div>
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
                        </div>
                    ) : (
                        <div className="decks-scroll-wrapper">
                            {mappedSections.length === 0 ? (
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
                                </div>
                            ) : (
                                <>
                                    {mappedSections.map((deck, idx) => (
                                        <div key={deck.id} className="deck-row-card">
                                            <div className="deck-row-header" onClick={() => toggleExpand(deck.id)}>
                                                <div className="deck-row-icon-box" onClick={(e) => { e.stopPropagation(); openMapping(deck); }}>
                                                    {activePlan ? (
                                                        <DeckPreview rect={deck.rect} fileUrl={activePlan.url} deckTitle={deck.title} />
                                                    ) : (
                                                        <div className="deck-row-icon-placeholder">
                                                            {deck.title.toLowerCase().includes('tank') ? <Layers size={21} /> : <Compass size={21} />}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="deck-row-main-info" onClick={(e) => { e.stopPropagation(); openMapping(deck); }}>
                                                    <h4>{deck.title}</h4>
                                                    <span className="deck-section-tag">{deck.sectionId || `SECTION 0${idx + 1}`}</span>
                                                </div>
                                                <div className="items-in-log-badge">
                                                    <strong>{deck.itemsCount || 0}</strong> ITEMS IN LOG
                                                </div>
                                                <div className="deck-row-actions">
                                                    <button className="action-icon-btn primary" onClick={(e) => { e.stopPropagation(); openMapping(deck); }} title="Add Material">
                                                        <Plus size={18} />
                                                    </button>
                                                    <button className="action-icon-btn" onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!activePlan) return;
                                                        // Open GA Viewer in new tab with crop parameters
                                                        const urlParams = new URLSearchParams({
                                                            url: activePlan.url,
                                                            name: activePlan.name,
                                                            view: 'full'
                                                        });
                                                        window.open(`/viewer?${urlParams.toString()}`, '_blank');
                                                    }} title="Open Viewer / Edit Crop">
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button className="action-icon-btn" onClick={(e) => { e.stopPropagation(); setMappedSections(prev => prev.filter(s => s.id !== deck.id)); }} title="Delete">
                                                        <Trash2 size={18} />
                                                    </button>
                                                    <div className="action-icon-btn" onClick={() => toggleExpand(deck.id)}>
                                                        {expandedDeckId === deck.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                    </div>
                                                </div>
                                            </div>

                                            {expandedDeckId === deck.id && (
                                                <div className="deck-log-expanded">
                                                    <div className="log-title-row">
                                                        <div className="log-header-left">
                                                            <FileText size={16} color="#00B0FA" />
                                                            <span className="log-title-text">MATERIAL LOG FOR {deck.title.toUpperCase()}</span>
                                                        </div>
                                                        <button className="view-all-materials-link-btn" onClick={() => toggleExpand(deck.id)}>Show Less <ChevronUp size={14} /></button>
                                                    </div>

                                                    <div className="materials-grid-v2">
                                                        {(() => {
                                                            const stored = localStorage.getItem(`inventory_${deck.title}`);
                                                            const items = stored ? JSON.parse(stored) : [];
                                                            if (items.length === 0) return <div className="no-materials-placeholder">No materials mapped yet.</div>;

                                                            return items.map((item: any) => (
                                                                <div key={item.id} className="mat-card-v2" onClick={() => openMapping(deck)}>
                                                                    <div className="mat-card-header">
                                                                        <div className="mat-dot-indicator"></div>
                                                                        <h5>{item.name}</h5>
                                                                    </div>
                                                                    <p className="mat-card-desc">{item.description || 'Material contained in ship structure or equipment.'}</p>

                                                                    <div className="mat-card-meta">
                                                                        <div className="meta-row">
                                                                            <span className="meta-label">Location:</span>
                                                                            <span className="meta-val">{item.compartment || 'Ship Structure'}</span>
                                                                        </div>
                                                                        <div className="meta-row">
                                                                            <span className="meta-label">Classification:</span>
                                                                            <span className="meta-val">{item.ihmPart} Hazardous Materials</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ));
                                                        })()}
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
                    )}
                </div>
            </div>
        </div>
    );
}
