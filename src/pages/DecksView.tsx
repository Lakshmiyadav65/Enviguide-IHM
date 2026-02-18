import { useState, useRef, useEffect } from 'react';
import {
    Upload,
    Plus,
    Trash2,
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
import { PLAN_OCEAN_PIONEER, PLAN_ACOSTA, PLAN_AFIF, PLAN_PACIFIC_HORIZON, PLAN_GENERIC } from '../assets/ship_plans';
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
    planId: string; // Link to the plan it was cropped from
}

interface UploadedPlan {
    id: string;
    name: string;
    url: string;
    date: string;
}

export default function DecksView({ vesselName }: { vesselName: string }) {
    const [uploadedPlans, setUploadedPlans] = useState<UploadedPlan[]>(() => {
        const saved = localStorage.getItem(`vessel_plans_${vesselName}`);
        let plans = saved ? JSON.parse(saved) : [];
        // Sanitize URLs: Auto-fix legacy locked file references
        plans = plans.map((p: UploadedPlan) => ({
            ...p,
            url: (p.url && !p.url.includes('ga_plan_')) ? p.url : PLAN_GENERIC
        }));
        return plans;
    });

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentStage, setCurrentStage] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [activePlanId, setActivePlanId] = useState<string | null>(() => {
        if (uploadedPlans.length > 0) return uploadedPlans[0].id;
        return null;
    });
    const [expandedDeckId, setExpandedDeckId] = useState<string | null>(null);
    const [showAllMaterials, setShowAllMaterials] = useState(false);
    const [hoveredMaterial, setHoveredMaterial] = useState<{ id: string, pin: { x: number, y: number }, deckId: string } | null>(null);

    const [mappedSections, setMappedSections] = useState<MappedSection[]>(() => {
        const saved = localStorage.getItem(`vessel_sections_${vesselName}`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse saved sections:', e);
                return [];
            }
        }
        return [];
    });

    // Save plans to localStorage
    useEffect(() => {
        localStorage.setItem(`vessel_plans_${vesselName}`, JSON.stringify(uploadedPlans));
    }, [uploadedPlans, vesselName]);

    // Save sections to localStorage on change
    useEffect(() => {
        localStorage.setItem(`vessel_sections_${vesselName}`, JSON.stringify(mappedSections));
    }, [mappedSections, vesselName]);

    useEffect(() => {
        // Unique Static Data Configuration for first 3 vessels
        const demoVessels: Record<string, { decks: { name: string, id: string, count: number }[], planName: string, planUrl: string }> = {
            'MV Ocean Pioneer': {
                planName: 'General Arrangement - Main Deck',
                planUrl: PLAN_OCEAN_PIONEER,
                decks: [
                    { name: 'Bridge Proof', id: 'BRIDGE-01', count: 6 },
                    { name: 'Tank Top', id: 'TANK-04', count: 34 },
                    { name: 'Upper Deck', id: 'UPPER-02', count: 12 },
                    { name: 'Cargo Hold 1', id: 'HOLD-01', count: 8 },
                    { name: 'Engine Room', id: 'ENG-01', count: 15 }
                ]
            },
            'ACOSTA': {
                planName: 'GA Plan - Acosta Main',
                planUrl: PLAN_ACOSTA,
                decks: [
                    { name: 'Main Deck', id: 'MAIN-01', count: 8 },
                    { name: 'Crew Accommodation', id: 'CREW-02', count: 15 },
                    { name: 'Galley Area', id: 'GALLEY-03', count: 4 },
                    { name: 'Technical Deck', id: 'TECH-04', count: 6 },
                    { name: 'Pump Room', id: 'PUMP-05', count: 10 }
                ]
            },
            'AFIF': {
                planName: 'Technical Layout - AFIF',
                planUrl: PLAN_AFIF,
                decks: [
                    { name: 'Deck A', id: 'DECKA-01', count: 10 },
                    { name: 'Deck B', id: 'DECKB-02', count: 5 },
                    { name: 'Engine Room Upper', id: 'ENG-A1', count: 20 },
                    { name: 'Lower Deck', id: 'LOW-04', count: 4 },
                    { name: 'Storage Bay', id: 'STORE-05', count: 7 }
                ]
            },
            'PACIFIC HORIZON': {
                planName: 'Pac-H-Master-GA',
                planUrl: PLAN_PACIFIC_HORIZON,
                decks: [
                    { name: 'Main Deck', id: 'PAC-M1', count: 12 },
                    { name: 'Lower Deck', id: 'PAC-L2', count: 8 },
                    { name: 'Deck A', id: 'PAC-A3', count: 15 },
                    { name: 'Deck B', id: 'PAC-B4', count: 5 },
                    { name: 'Engine Room', id: 'PAC-E5', count: 10 }
                ]
            },
            'MV NATAL': {
                planName: 'NATAL-GA-MASTER',
                planUrl: PLAN_GENERIC,
                decks: [
                    { name: 'Bridge Proof', id: 'NAT-B1', count: 8 },
                    { name: 'Main Deck', id: 'NAT-M1', count: 14 },
                    { name: 'Tank Top', id: 'NAT-T1', count: 10 },
                    { name: 'Upper Deck', id: 'NAT-U1', count: 6 },
                    { name: 'Time Proof', id: 'NAT-TP', count: 4 }
                ]
            }
        };

        const config = demoVessels[vesselName];

        if (config) {
            let basePlanId = activePlanId;

            // Priority 1: Ensure at least one plan exists for the demo vessels
            if (uploadedPlans.length === 0) {
                const staticPlanId = uuidv4();
                const staticPlan = {
                    id: staticPlanId,
                    name: config.planName,
                    url: config.planUrl, // Use Safe Data URI
                    date: 'Feb 09, 2026'
                };
                // Check if plan already exists in state to avoid loop
                setUploadedPlans(prev => {
                    if (prev.some(p => p.id === staticPlanId)) return prev;
                    return [staticPlan];
                });
                setActivePlanId(staticPlanId);
                basePlanId = staticPlanId;
            } else if (!basePlanId) {
                basePlanId = uploadedPlans[0].id;
            }

            // Priority 2: Ensure demo decks exist if no decks are mapped yet
            const savedSections = localStorage.getItem(`vessel_sections_${vesselName}`);
            if (!savedSections || JSON.parse(savedSections).length === 0) {
                const deckDefinitions = config.decks;

                // Technical coordinates mapped to the new 2000x1400 SVG system
                // The SVGs were designed to have elements at these approximate relative locations
                // Original system was 1000px wide. New system is 2000px wide. 
                // We keep the coordinates as they are because the Viewers scale them, BUT we need to ensure the SVG content matches.
                // The SVG content I wrote has BRIDGE at 400,440 (matches 410,442).
                // HOLD 1 at 670,550 (matches 675,555).
                // ENGINE at 100,550 (matches 105,555).

                const newSections: MappedSection[] = deckDefinitions.map((def, index) => {
                    // Rect definitions (Relative to 1000px width as originally designed)
                    const rects = [
                        { x: 410, y: 442, width: 140, height: 95 }, // Bridge / Top Command
                        { x: 105, y: 555, width: 200, height: 120 }, // Engine / Aft (Updated size to match SVG)
                        { x: 375, y: 555, width: 95, height: 95 },  // Mid Area
                        { x: 675, y: 555, width: 130, height: 100 }, // Cargo Hold 1
                        { x: 105, y: 749, width: 635, height: 150 }  // Main Hull Area
                    ];

                    const rect = rects[index % rects.length];

                    return {
                        id: uuidv4(),
                        title: def.name,
                        sectionId: def.id,
                        rect: rect,
                        // Increase count for the first 4 decks significantly
                        itemsCount: index < 4 ? Math.max((def as any).count || 0, 12) : ((def as any).count || 0),
                        isVisible: true,
                        planId: basePlanId || ''
                    };
                });

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
                    },
                    {
                        name: 'Thermal Insulation',
                        material: 'Asbestos',
                        desc: 'Lagging on exhaust pipes in the engine room.',
                        loc: 'Main Engine Exhaust',
                        hmPart: 'Part I-1'
                    },
                    {
                        name: 'Circuit Breakers',
                        material: 'PCBs',
                        desc: 'Older capacitors in main switchboard.',
                        loc: 'Engine Control Room',
                        hmPart: 'Part I-3'
                    },
                    {
                        name: 'Cooling System Agent',
                        material: 'CFCs',
                        desc: 'Refrigerant gas R-12 in provision cooling plant.',
                        loc: 'Galley Cold Store',
                        hmPart: 'Part II-1'
                    },
                    {
                        name: 'Anti-fouling Paint',
                        material: 'Organotin',
                        desc: 'Hull coating samples from dry dock inspection.',
                        loc: 'External Hull Strakes',
                        hmPart: 'Part I-4'
                    },
                    {
                        name: 'Heat Shielding',
                        material: 'Ceramic Fiber',
                        desc: 'High-temp insulation around incinerator.',
                        loc: 'Incinerator Room',
                        hmPart: 'Part II-3'
                    },
                    {
                        name: 'Emergency Light Batteries',
                        material: 'Cadmium',
                        desc: 'Ni-Cd batteries in emergency lighting units.',
                        loc: 'Corridors Deck A',
                        hmPart: 'Part I-2'
                    }
                ];

                // Populate LocalStorage
                newSections.forEach((section) => {
                    const materials = Array.from({ length: section.itemsCount }).map((_, i) => {
                        const template = staticMaterials[i % staticMaterials.length];
                        return {
                            id: uuidv4(),
                            name: `${template.name} ${i + 1}`,
                            material: template.material,
                            description: template.desc,
                            pin: {
                                x: section.rect.x + Math.random() * section.rect.width,
                                y: section.rect.y + Math.random() * section.rect.height
                            },
                            ihmPart: template.hmPart,
                            hazMaterials: [template.material],
                            deckPlan: section.title,
                            shipPO: 'PO-12345',
                            compartment: template.loc,
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
                    localStorage.setItem(`inventory_${vesselName}_${section.title}`, JSON.stringify(materials));
                });

                localStorage.setItem(`vessel_sections_${vesselName}`, JSON.stringify(newSections));
                setMappedSections(newSections);
            }
        }
    }, [vesselName, uploadedPlans.length, activePlanId]);

    // Sync from localStorage cross-tab and on mount
    useEffect(() => {
        const syncData = () => {
            // Sync sections
            const savedSections = localStorage.getItem(`vessel_sections_${vesselName}`);
            if (savedSections) {
                try {
                    const sections = JSON.parse(savedSections);
                    // Update counts for each section from its specific inventory
                    const updatedSections = sections.map((s: MappedSection) => {
                        const invValue = localStorage.getItem(`inventory_${vesselName}_${s.title}`);
                        const count = invValue ? JSON.parse(invValue).length : 0;
                        return { ...s, itemsCount: count };
                    });
                    setMappedSections(updatedSections);
                } catch (e) {
                    console.error('Failed to sync sections:', e);
                }
            } else {
                setMappedSections([]);
            }
        };

        const handleStorage = (e: StorageEvent) => {
            if (e.key === `vessel_sections_${vesselName}` || (e.key && e.key.includes('inventory_'))) {
                syncData();
            }
        };

        window.addEventListener('storage', handleStorage);
        // Initial sync
        syncData();
        return () => window.removeEventListener('storage', handleStorage);
    }, [vesselName]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            setUploadProgress(0);
            setCurrentStage(0);

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

                // Update stage based on progress
                if (progress < 33) {
                    setCurrentStage(0); // Three decks identified
                } else if (progress < 66) {
                    setCurrentStage(1); // Structure layout detected
                } else {
                    setCurrentStage(2); // Preparing workspace
                }
            }, 300);
        }
    };

    const removePlan = (id: string) => {
        setUploadedPlans(prev => {
            const planToRemove = prev.find(p => p.id === id);
            if (planToRemove) URL.revokeObjectURL(planToRemove.url);
            const remaining = prev.filter(p => p.id !== id);

            if (activePlanId === id) {
                setActivePlanId(remaining.length > 0 ? remaining[0].id : null);
            }

            return remaining;
        });

        // Also remove all sections associated with this specific plan
        setMappedSections(prev => prev.filter(section => section.planId !== id));
    };

    const toggleExpand = (id: string) => {
        setExpandedDeckId(expandedDeckId === id ? null : id);
        setShowAllMaterials(false);
    };

    // Component to show a technical cropped preview of the deck
    const DeckPreview = ({ rect, fileUrl, highlightPin }: { rect: Rect, fileUrl: string, highlightPin?: { x: number, y: number } | null }) => {
        const displayWidth = 180;
        const displayHeight = 126;

        const demoVesselsPreviews: Record<string, string> = {
            'MV Ocean Pioneer': PLAN_OCEAN_PIONEER,
            'ACOSTA': PLAN_ACOSTA,
            'AFIF': PLAN_AFIF,
            'PACIFIC HORIZON': PLAN_PACIFIC_HORIZON
        };

        // PRIORITIZE USER UPLOADS:
        // 1. If we have a fileUrl and it's NOT the broken one, use it. This covers user uploads (blobs).
        // 2. If no valid fileUrl, check if it's a known demo vessel and use its plan.
        // 3. Last fallback to generic.

        let displayUrl = (fileUrl && !fileUrl.includes('ga_plan_')) ? fileUrl : null;

        if (!displayUrl && vesselName && demoVesselsPreviews[vesselName]) {
            displayUrl = demoVesselsPreviews[vesselName];
        }

        if (!displayUrl) {
            displayUrl = PLAN_GENERIC;
        }

        const uniformScale = Math.min(displayWidth / rect.width, displayHeight / rect.height);
        const actualWidth = rect.width * uniformScale;
        const actualHeight = rect.height * uniformScale;

        return (
            <div className="deck-technical-preview-outer" style={{
                width: `${actualWidth}px`,
                height: `${actualHeight}px`,
                background: '#F2F4F7',
                borderRadius: '4px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <img
                    src={displayUrl}
                    alt="Deck Preview"
                    style={{
                        position: 'absolute',
                        left: `${-rect.x * uniformScale}px`,
                        top: `${-rect.y * uniformScale}px`,
                        width: `${1000 * uniformScale}px`,
                        height: 'auto',
                        maxWidth: 'none',
                        pointerEvents: 'none',
                        display: 'block',
                        filter: 'contrast(1.1) brightness(1.02)'
                    }}
                />

                {/* Hover Highlight Marker */}
                {highlightPin && (
                    <div
                        className="material-highlight-pulse-mini"
                        style={{
                            position: 'absolute',
                            left: `${(highlightPin.x - rect.x) * uniformScale}px`,
                            top: `${(highlightPin.y - rect.y) * uniformScale}px`,
                            width: '12px',
                            height: '12px',
                            background: '#00B0FA',
                            borderRadius: '50%',
                            transform: 'translate(-50%, -50%)',
                            boxShadow: '0 0 0 4px rgba(0, 176, 250, 0.3)',
                            zIndex: 2,
                            animation: 'pulseHighlight 1.5s infinite'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: '2px solid #00B0FA',
                            animation: 'rippleHighlight 1.5s infinite'
                        }}></div>
                    </div>
                )}
            </div>
        );
    };

    const activePlan = uploadedPlans.find(p => p.id === activePlanId) || (uploadedPlans.length > 0 ? uploadedPlans[0] : null);

    if (isViewerOpen && activePlan) {
        return (
            <GAPlanViewer
                filename={activePlan.name}
                fileUrl={activePlan.url}
                onClose={() => {
                    setIsViewerOpen(false);
                    // Reload sections from localStorage when viewer closes
                    const savedSections = localStorage.getItem(`vessel_sections_${vesselName}`);
                    if (savedSections) {
                        try {
                            const parsed = JSON.parse(savedSections);
                            setMappedSections(parsed);
                        } catch (e) {
                            console.error('Failed to parse saved sections:', e);
                        }
                    }
                }}
                mappedSections={mappedSections}
                onUpdateSections={setMappedSections as any}
                vesselName={vesselName}
            />
        );
    }

    const openMapping = (deck: MappedSection, mode?: string, materialId?: string) => {
        if (!activePlan) return;
        const params: any = {
            url: activePlan.url,
            name: deck.title,
            x: deck.rect.x.toString(),
            y: deck.rect.y.toString(),
            w: deck.rect.width.toString(),
            h: deck.rect.height.toString(),
            vessel: vesselName
        };
        if (mode) params.mode = mode;
        if (materialId) params.matId = materialId;
        const urlParams = new URLSearchParams(params);
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
                                                window.open(`/viewer?url=${encodeURIComponent(plan.url)}&name=${encodeURIComponent(plan.name)}&vessel=${encodeURIComponent(vesselName)}&isolated=false`, '_blank');
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
                        onClick={() => {
                            if (!activePlanId) return;
                            const plan = uploadedPlans.find(p => p.id === activePlanId) || uploadedPlans[0];
                            window.open(`/viewer?url=${encodeURIComponent(plan.url)}&name=${encodeURIComponent(plan.name)}&vessel=${encodeURIComponent(vesselName)}&isolated=false`, '_blank');
                        }}
                    >
                        <Plus size={18} />
                        Add New Deck
                    </button>
                </div>

                <div className="decks-list-content">
                    {/* 
                            Logic: 
                            1. If not uploading AND no decks AND no plans -> Show large empty state
                            2. If uploading AND no plans -> Show large uploading animation
                            3. Otherwise -> Show the list (which captures: has decks, or has plans, or uploading while having plans)
                        */}
                    {!isUploading && mappedSections.length === 0 && uploadedPlans.length === 0 ? (
                        <div className="no-decks-centered-state">
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
                    ) : isUploading && uploadedPlans.length === 0 ? (
                        <div className="no-decks-centered-state">
                            <div className="deck-empty-visual-canvas">
                                <div className="deck-blueprint-illustration-premium">
                                    <div className="blueprint-canvas is-uploading">
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
                            <div className="stage-messages-container">
                                {currentStage === 0 && (
                                    <div className="stage-message active" key="stage-0">
                                        Three decks identified
                                    </div>
                                )}
                                {currentStage === 1 && (
                                    <div className="stage-message active" key="stage-1">
                                        Structure layout detected
                                    </div>
                                )}
                                {currentStage === 2 && (
                                    <div className="stage-message active" key="stage-2">
                                        Preparing workspace
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="decks-scroll-wrapper">
                            {/* Subtle upload indicator for subsequent uploads */}
                            {isUploading && uploadedPlans.length > 0 && (
                                <div className="compact-upload-status">
                                    <div className="spinner-mini"></div>
                                    <span>Updating GA Plans & Decks... {uploadProgress}%</span>
                                </div>
                            )}

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
                                                        <DeckPreview
                                                            rect={deck.rect}
                                                            fileUrl={activePlan.url}
                                                            highlightPin={hoveredMaterial?.deckId === deck.id ? hoveredMaterial.pin : null}
                                                        />
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
                                                <div className="items-in-log-badge" onClick={(e) => { e.stopPropagation(); openMapping(deck); }} style={{ cursor: 'pointer' }}>
                                                    <strong>{deck.itemsCount || 0}</strong> ITEMS IN LOG
                                                </div>
                                                <div className="deck-row-actions">

                                                    <button className="action-icon-btn" onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!activePlan) return;
                                                        const urlParams = new URLSearchParams({
                                                            url: activePlan.url,
                                                            name: activePlan.name,
                                                            vessel: vesselName,
                                                            focusedId: deck.id,
                                                            isolated: 'true'
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
                                                        {(() => {
                                                            const stored = localStorage.getItem(`inventory_${vesselName}_${deck.title}`);
                                                            const items = stored ? JSON.parse(stored) : [];
                                                            return items.length > 3 && (
                                                                <button
                                                                    className="show-more-materials-btn"
                                                                    style={{
                                                                        color: '#00B0FA',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        fontSize: '13px',
                                                                        fontWeight: 600
                                                                    }}
                                                                    onClick={(e) => { e.stopPropagation(); setShowAllMaterials(!showAllMaterials); }}
                                                                >
                                                                    {showAllMaterials ? (
                                                                        <>Show Less <ChevronUp size={16} /></>
                                                                    ) : (
                                                                        <>Show More <ChevronDown size={16} /></>
                                                                    )}
                                                                </button>
                                                            );
                                                        })()}
                                                    </div>

                                                    <div className="materials-grid-v2">
                                                        {(() => {
                                                            const stored = localStorage.getItem(`inventory_${vesselName}_${deck.title}`);
                                                            const items = stored ? JSON.parse(stored) : [];
                                                            if (items.length === 0) return (
                                                                <div className="no-materials-placeholder-v2">
                                                                    <p>No materials mapped yet.</p>
                                                                    <button className="add-material-btn-primary" onClick={() => openMapping(deck, 'add')}>
                                                                        <Plus size={16} /> Add Material
                                                                    </button>
                                                                </div>
                                                            );

                                                            const itemsToShow = showAllMaterials ? items : items.slice(0, 3);

                                                            return (
                                                                <>
                                                                    {itemsToShow.map((item: any) => (
                                                                        <div
                                                                            key={item.id}
                                                                            className="mat-card-v2"
                                                                            onClick={() => openMapping(deck, undefined, item.id)}
                                                                            onMouseEnter={() => setHoveredMaterial({ id: item.id, pin: item.pin, deckId: deck.id })}
                                                                            onMouseLeave={() => setHoveredMaterial(null)}
                                                                        >
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
                                                                    ))}

                                                                    {/* Removed bottom button */}
                                                                </>
                                                            );
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
