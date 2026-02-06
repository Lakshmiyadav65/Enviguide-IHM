import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutGrid,
    Plus,
    Search,
    Bell,
    Filter,
    Flame,
    MapPin,
    ChevronDown,
    RotateCcw,
    Upload,
    X,
    ZoomIn,
    ZoomOut,
    FileText,
    Eye,
    Ship
} from 'lucide-react';
import './HazardousMaterialMapping.css';

interface MaterialEntry {
    id: string;
    avoidUpdation: boolean;
    movementType: string;
    ihmPart: string;
    hazMaterials: string[];
    deckPlan: string;
    shipPO: string;
    name: string;
    compartment: string;
    equipment: string;
    position: string;
    component: string;
    material: string;
    quantity: string;
    unit: string;
    hmStatus: 'CHM' | 'PCHM';
    files: string[];
    pin: { x: number; y: number } | null;
    description?: string;
    manufacturer?: string;
    ihmPartNumber?: string;
}

export default function HazardousMaterialMapping() {
    const location = useLocation();
    const navigate = useNavigate();
    const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const fileUrl = query.get('url') || '';
    const sectionName = query.get('name') || 'A-DECK 01';
    const rect = {
        x: parseFloat(query.get('x') || '0'),
        y: parseFloat(query.get('y') || '0'),
        w: parseFloat(query.get('w') || '1000'),
        h: parseFloat(query.get('h') || '700')
    };

    const [zoom, setZoom] = useState(100);
    const [viewMode, setViewMode] = useState<'list' | 'add' | 'detail'>('list');
    const [activeTool, setActiveTool] = useState<'none' | 'pin'>('none');
    const [inventory, setInventory] = useState<MaterialEntry[]>(() => {
        const stored = localStorage.getItem(`inventory_${sectionName}`);
        return stored ? JSON.parse(stored) : [];
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [tempPin, setTempPin] = useState<{ x: number, y: number } | null>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const lastPanPoint = useRef({ x: 0, y: 0 });

    const [availableDecks, setAvailableDecks] = useState<any[]>([]);
    const [deckSelectorOpen, setDeckSelectorOpen] = useState(false);
    const [targetDeckForTransfer, setTargetDeckForTransfer] = useState<string | null>(null); // New state for pending transfer

    useEffect(() => {
        const sections = localStorage.getItem('active_vessel_sections');
        if (sections) {
            setAvailableDecks(JSON.parse(sections));
        }
    }, []);

    // Handle incoming material transfer
    useEffect(() => {
        if (location.state && location.state.transferMaterial) {
            const transfer = location.state.transferMaterial;
            setViewingMaterial(null);
            setViewMode('add');
            setActiveTool('pin');
            // Pre-fill form with transferred data
            setFormData({
                avoidUpdation: transfer.avoidUpdation || false,
                movementType: transfer.movementType || '',
                ihmPart: transfer.ihmPart || '',
                hazMaterials: transfer.hazMaterials || [],
                files: transfer.files || [],
                description: transfer.description || '',
                manufacturer: transfer.manufacturer || '',
                ihmPartNumber: transfer.ihmPartNumber || '',
                compartment: transfer.compartment || '',
                // Required fields from interface
                name: transfer.name || '',
                deckPlan: sectionName || '', // We are on the new deck now
                shipPO: transfer.shipPO || '',
                equipment: transfer.equipment || '',
                position: transfer.position || '',
                component: transfer.component || '',
                material: transfer.material || '',
                quantity: transfer.quantity || '',
                unit: transfer.unit || '',
                hmStatus: transfer.hmStatus || 'CHM'
            });
            // Show alert
            setTimeout(() => alert(`Re-mapping ${transfer.name}. Please click on the plan to set the new location.`), 500);
        }
    }, [location.state]);

    // Constants for cropper size
    const CROPPER_WIDTH = 1000;

    const wrapperRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<Omit<MaterialEntry, 'id' | 'pin'>>({
        avoidUpdation: false,
        movementType: '',
        ihmPart: '',
        hazMaterials: [],
        deckPlan: sectionName,
        shipPO: '',
        name: '',
        compartment: '',
        equipment: '',
        position: '',
        component: '',
        material: '',
        quantity: '',
        unit: 'kg',
        hmStatus: 'CHM',
        files: [] as string[]
    });

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [viewingMaterial, setViewingMaterial] = useState<MaterialEntry | null>(null);

    // Initial mode check and focus on crop
    useEffect(() => {
        if (query.get('mode') === 'add') {
            setViewMode('add');
            setActiveTool('pin');
        }

        const updatePosition = () => {
            const viewport = wrapperRef.current?.getBoundingClientRect();
            if (viewport && viewport.width > 0) {
                const scaleX = viewport.width / rect.w;
                const scaleY = viewport.height / rect.h;
                const initialZoom = Math.min(scaleX, scaleY, 8) * 100;

                setZoom(initialZoom);

                // Center precisely
                setOffset({
                    x: (viewport.width - (rect.w * initialZoom / 100)) / 2,
                    y: (viewport.height - (rect.h * initialZoom / 100)) / 2
                });
            }
        };

        // Run with a small delay to ensure layout is ready
        const timer = setTimeout(updatePosition, 100);
        window.addEventListener('resize', updatePosition);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
        };
    }, [rect.w, rect.h]);

    // Save to localStorage whenever inventory changes
    useEffect(() => {
        localStorage.setItem(`inventory_${sectionName}`, JSON.stringify(inventory));
        // Dispatch storage event for other tabs
        window.dispatchEvent(new Event('storage'));
    }, [inventory, sectionName]);

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (activeTool === 'pin') {
            const frameRect = e.currentTarget.getBoundingClientRect();
            // Get local coordinates within the crop area
            const localX = (e.clientX - frameRect.left) / (zoom / 100);
            const localY = (e.clientY - frameRect.top) / (zoom / 100);

            // Convert to absolute GA coordinates
            const x = localX + rect.x;
            const y = localY + rect.y;

            setTempPin({ x, y });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (activeTool === 'none') {
            setIsPanning(true);
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning && activeTool === 'none') {
            const dx = e.clientX - lastPanPoint.current.x;
            const dy = e.clientY - lastPanPoint.current.y;
            setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleZoom = (delta: number) => {
        const newZoom = Math.min(800, Math.max(10, zoom + delta)); // Increased max zoom for small crops
        if (newZoom === zoom) return;

        const viewport = wrapperRef.current?.getBoundingClientRect();
        if (viewport) {
            const centerX = viewport.width / 2;
            const centerY = viewport.height / 2;

            // Calculate position relative to container
            const containerRelX = (centerX - offset.x) / (zoom / 100);
            const containerRelY = (centerY - offset.y) / (zoom / 100);

            setOffset({
                x: centerX - containerRelX * (newZoom / 100),
                y: centerY - containerRelY * (newZoom / 100)
            });
            setZoom(newZoom);
        } else {
            setZoom(newZoom);
        }
    };

    const handleFileUpload = () => {
        // Simulate file upload
        const newFile = `doc_ref_${formData.files.length + 1}.pdf`;
        setFormData(prev => ({ ...prev, files: [...prev.files, newFile] }));
    };

    const handleAddMaterial = () => {
        if (!tempPin) {
            alert("Please drop a pin on the deck plan first.");
            return;
        }

        if (!formData.name || !formData.ihmPart || formData.hazMaterials.length === 0) {
            alert("Please fill in all required fields (Name, IHM Part, and Hazardous Materials).");
            return;
        }

        const newEntry: MaterialEntry = {
            id: Date.now().toString(),
            ...formData,
            pin: tempPin
        };

        setInventory([...inventory, newEntry]);
        setTempPin(null);
        setFormData({
            avoidUpdation: false,
            movementType: '',
            ihmPart: '',
            hazMaterials: [],
            deckPlan: sectionName,
            shipPO: '',
            name: '',
            compartment: '',
            equipment: '',
            position: '',
            component: '',
            material: '',
            quantity: '',
            unit: 'kg',
            hmStatus: 'CHM',
            files: []
        });
        setViewMode('list');
        setActiveTool('none');
    };

    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.material.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [inventory, searchQuery]);

    const groupedInventory = useMemo(() => {
        const groups: { [key: string]: MaterialEntry[] } = {};
        filteredInventory.forEach(item => {
            const group = (item.material || 'UNSPECIFIED').toUpperCase();
            if (!groups[group]) groups[group] = [];
            groups[group].push(item);
        });
        return groups;
    }, [filteredInventory]);

    return (
        <div className="hazmat-mapping-page">
            <header className="mapping-header-v5">
                <div className="h-left-v5">
                    <div className="logo-group-v5">
                        <Ship size={22} className="logo-icon-v5 sailing-logo" />
                        <strong>IHM</strong>
                        <span>Hazardous Material Mapping</span>
                    </div>
                </div>

                <div className="h-center-v5">
                    <div className="search-pill-v5">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search inventory..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="h-right-v5">
                    <div className="notif-badge-v5">
                        <Bell size={20} />
                        <span className="notif-red">3</span>
                    </div>
                    <div className="profile-capsule-v5">
                        <div className="p-info">
                            <strong>John Administrator</strong>
                            <span className="p-role">ADMIN</span>
                        </div>
                        <div className="p-avatar-v5">JA</div>
                    </div>
                </div>
            </header>

            <div className="mapping-main-v5">
                <main className="viewer-viewport-v5"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}>

                    <div className="toolbelt-floating-v5">
                        <div className="t-cluster">
                            <button onClick={() => handleZoom(10)} title="Zoom In">
                                <ZoomIn size={20} />
                            </button>
                            <button onClick={() => handleZoom(-10)} title="Zoom Out">
                                <ZoomOut size={20} />
                            </button>
                            <button className="reset-label-v5" onClick={() => {
                                const viewport = wrapperRef.current?.getBoundingClientRect();
                                if (viewport) {
                                    const scaleX = viewport.width / rect.w;
                                    const scaleY = viewport.height / rect.h;
                                    const initialZoom = Math.min(scaleX, scaleY, 8) * 100;
                                    setZoom(initialZoom);
                                    setOffset({
                                        x: (viewport.width - (rect.w * initialZoom / 100)) / 2,
                                        y: (viewport.height - (rect.h * initialZoom / 100)) / 2
                                    });
                                }
                            }}>
                                <RotateCcw size={14} /> RESET
                            </button>
                        </div>
                    </div>

                    <div className="pan-surface-v5" ref={wrapperRef}>
                        <div className="coord-scaler" style={{
                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom / 100})`,
                            cursor: activeTool === 'pin' ? 'crosshair' : isPanning ? 'grabbing' : 'grab',
                            transformOrigin: '0 0'
                        }}>
                            <div className="crop-container-v5"
                                style={{ width: rect.w, height: rect.h }}
                                onClick={handleCanvasClick}>


                                <img src={fileUrl} alt="Ship Section"
                                    style={{
                                        position: 'absolute',
                                        left: -rect.x,
                                        top: -rect.y,
                                        width: CROPPER_WIDTH,
                                        maxWidth: 'none'
                                    }} />

                                {inventory.map(item => item.pin && (
                                    <div key={item.id} className="pin-marker-v5"
                                        style={{
                                            left: item.pin.x - rect.x,
                                            top: item.pin.y - rect.y,
                                            transform: `translate(-50%, -50%) scale(${100 / zoom})`
                                        }}>
                                        <div className="pin-icon-box">
                                            <Flame size={20} fill="currentColor" />
                                        </div>
                                    </div>
                                ))}

                                {tempPin && (
                                    <div className="pin-marker-v5 ghost"
                                        style={{
                                            left: tempPin.x - rect.x,
                                            top: tempPin.y - rect.y,
                                            transform: `translate(-50%, -50%) scale(${100 / zoom})`
                                        }}>
                                        <div className="pin-icon-box">
                                            <Flame size={20} fill="currentColor" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bottom-info-pill">
                        <div className="pill-content">
                            <span>CURRENT VIEW:</span>
                            <strong>{sectionName}</strong>
                        </div>
                    </div>
                </main>

                <aside className="inventory-v5-side">
                    {viewMode === 'list' && (
                        <div className="v5-side-header">
                            <div className="v5-h-top">
                                <div className="v5-title">
                                    <LayoutGrid size={18} color="#1E3A8A" />
                                    <h3>MATERIAL INVENTORY</h3>
                                </div>
                                <div className="v5-controls">
                                    <Filter size={18} style={{ cursor: 'pointer' }} />
                                    <Search size={18} style={{ cursor: 'pointer' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="v5-inventory-list">
                        {viewMode === 'list' ? (
                            Object.entries(groupedInventory).length === 0 ? (
                                <div className="v5-empty-state">No materials found.</div>
                            ) : (
                                Object.entries(groupedInventory).map(([cat, items]) => (
                                    <div key={cat} className="v5-cat-group">
                                        <div className="v5-cat-header">
                                            <div className="v5-cat-pill" />
                                            <span className="v5-cat-name">{cat}</span>
                                            <span className="v5-cat-meta">{items.length} Items</span>
                                        </div>
                                        <div className="v5-cat-items">
                                            {items.map(item => (
                                                <div key={item.id} className="v5-item-card" onClick={() => { setViewingMaterial(item); setViewMode('detail'); }}>
                                                    <div className="v5-card-inner">
                                                        <div className="v5-selection-rail">
                                                            <div className={`v5-check-circle ${viewingMaterial?.id === item.id ? 'checked' : ''}`}>
                                                                {viewingMaterial?.id === item.id && <div className="check-mark">✓</div>}
                                                            </div>
                                                        </div>
                                                        <div className="v5-card-data">
                                                            <div className="v5-data-top">
                                                                <h4>{item.name}</h4>
                                                                <span className={`v5-status-tag ${item.hmStatus.toLowerCase() === 'chm' ? 'in-use' : 'mapped'}`}>
                                                                    {item.hmStatus.toLowerCase() === 'chm' ? 'IN USE' : 'MAPPED'}
                                                                </span>
                                                            </div>
                                                            <div className="v5-data-sub">{item.material}</div>
                                                            <p className="v5-data-desc">
                                                                {item.ihmPart || 'Part I Materials contained in ship structure or equipment - I-2'}
                                                            </p>

                                                            <div className="v5-location-box">
                                                                <span className="v5-loc-label">Location Details:</span>
                                                                <p className="v5-loc-text">{item.compartment || 'Accommodation A-Deck'} / {item.position || 'Smoking Room'}</p>
                                                                <div className="v5-usage-line">
                                                                    <strong>{item.quantity || '0.01'} {item.unit || 'used'}</strong> in {item.equipment || 'SURFACE MOUNTED TYPE SWITCH'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )
                        ) : viewMode === 'detail' && viewingMaterial ? (
                            <div className="material-detail-panel-v5" style={{ padding: '0', background: '#F8FAFC' }}>
                                <div className="detail-card-premium">
                                    <div className="detail-header-row">
                                        <div className="dh-left">
                                            <div className="dh-icon-box">
                                                <Flame size={20} color="#2563EB" />
                                            </div>
                                            <div className="dh-titles">
                                                <h3>{viewingMaterial.name}</h3>
                                                <span className="dh-ref">REF: HAZ-CMP-2024-001</span>
                                            </div>
                                        </div>
                                        <span className="status-badge-premium mapped">MAPPED</span>
                                    </div>

                                    <div className="detail-form-grid">
                                        <div className="df-group">
                                            <label>IHM PART NUMBER</label>
                                            <input type="text" className="df-input" defaultValue="IHM-CAD-P4022" />
                                        </div>
                                        <div className="df-group">
                                            <label>LOCATION ON SHIP</label>
                                            <div className="custom-select-v2 deck-selector-field" onClick={() => setDeckSelectorOpen(!deckSelectorOpen)} style={{ background: '#F8FAFC', padding: '8px 12px', height: 'auto', minHeight: '38px', position: 'relative' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                    {/* Show target deck if selected, else current */}
                                                    <span>{targetDeckForTransfer || viewingMaterial.deckPlan || sectionName}</span>
                                                    <ChevronDown size={14} />
                                                </div>

                                                {deckSelectorOpen && (
                                                    <div className="dropdown-v4" style={{ top: '100%', left: 0, width: '100%', zIndex: 50, maxHeight: '200px', overflowY: 'auto' }}>
                                                        {availableDecks.map((deck: any) => (
                                                            <div key={deck.id} className="drop-item" onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeckSelectorOpen(false);
                                                                // Just set the target, don't navigate yet
                                                                setTargetDeckForTransfer(deck.title || deck.sectionName);
                                                            }}>
                                                                {deck.title || deck.sectionName}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="df-group full">
                                        <label>MANUFACTURER DETAILS</label>
                                        <textarea className="df-textarea" defaultValue="Maritime Component Solutions Ltd. (UK Office) - Heavy Duty Scupper Trap assemblies." />
                                    </div>

                                    <div className="df-group full">
                                        <label>LINK DOCUMENT</label>
                                        <div className="doc-attach-box" onClick={() => {
                                            // Mock add file
                                            const newFile = `Document_${Math.floor(Math.random() * 1000)}.pdf`;
                                            const updatedFiles = [...(viewingMaterial.files || []), newFile];
                                            setViewingMaterial({ ...viewingMaterial, files: updatedFiles });
                                        }}>
                                            <Upload size={16} />
                                            <span>Attach MSDS or MD Declaration (.pdf)</span>
                                        </div>

                                        <div className="attached-files-list">
                                            {/* Logic for Dropbox if > 2 files */}
                                            {(viewingMaterial.files && viewingMaterial.files.length > 2) ? (
                                                <div className="custom-select-v2" onClick={() => setOpenDropdown(openDropdown === 'files_list' ? null : 'files_list')}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <FileText size={14} color="#2563EB" />
                                                        <span>{viewingMaterial.files.length} Documents Attached</span>
                                                    </div>
                                                    <ChevronDown size={14} />

                                                    {openDropdown === 'files_list' && (
                                                        <div className="dropdown-v4">
                                                            {viewingMaterial.files.map((file: string, idx: number) => (
                                                                <div key={idx} className="drop-item file-item-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <span style={{ fontSize: '12px', textOverflow: 'ellipsis', overflow: 'hidden' }}>{file}</span>
                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                        <Eye size={14} className="action-icon-blue" style={{ cursor: 'pointer', color: '#00B0FA' }} />
                                                                        <X size={14} className="action-icon-red" style={{ cursor: 'pointer', color: '#EF4444' }} onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const newFiles = viewingMaterial.files.filter((_, i) => i !== idx);
                                                                            setViewingMaterial({ ...viewingMaterial, files: newFiles });
                                                                        }} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                // Normal List for <= 2
                                                (viewingMaterial.files || ['MD_RosePlate_V2.pdf']).map((file: string, idx: number) => (
                                                    <div key={idx} className="attached-file-row">
                                                        <FileText size={14} color="#2563EB" />
                                                        <span style={{ flex: 1 }}>{file}</span>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <Eye size={16} style={{ cursor: 'pointer', color: '#94A3B8' }} />
                                                            <X size={16} className="remove-file" onClick={() => {
                                                                const newFiles = (viewingMaterial.files || ['MD_RosePlate_V2.pdf']).filter((_, i) => i !== idx);
                                                                setViewingMaterial({ ...viewingMaterial, files: newFiles });
                                                            }} />
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="detail-actions-footer">
                                        <button className="action-btn cancel" onClick={() => { setViewingMaterial(null); setViewMode('list'); }}>CANCEL</button>
                                        <button className="action-btn save" onClick={() => {
                                            if (targetDeckForTransfer) {
                                                const deck = availableDecks.find(d => (d.title || d.sectionName) === targetDeckForTransfer);
                                                if (deck) {
                                                    const r = deck.rect || { x: 0, y: 0, width: 1000, height: 700 };
                                                    const params = new URLSearchParams({
                                                        url: 'https://placehold.co/2000x1400/f8fafc/cbd5e1.png?text=Technical+GA+Plan',
                                                        name: deck.title || deck.sectionName,
                                                        x: (r.x || 0).toString(),
                                                        y: (r.y || 0).toString(),
                                                        w: (r.width || r.w || 1000).toString(),
                                                        h: (r.height || r.h || 700).toString()
                                                    });

                                                    const newInv = inventory.filter(i => i.id !== viewingMaterial.id);
                                                    setInventory(newInv);
                                                    localStorage.setItem(`inventory_${sectionName}`, JSON.stringify(newInv));

                                                    navigate(`${location.pathname}?${params.toString()}`, {
                                                        state: { transferMaterial: { ...viewingMaterial, deckPlan: deck.title || deck.sectionName } }
                                                    });
                                                    return;
                                                }
                                            }
                                            // Normal Save
                                            alert("Changes saved.");
                                            setViewingMaterial(null);
                                            setViewMode('list');
                                        }}>SAVE CHANGES</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="add-material-form-v5">
                                <div className="form-header-v5">
                                    <h4>ADD MATERIAL</h4>
                                </div>

                                <div className="form-content-v5">
                                    {activeTool === 'pin' && !tempPin && (
                                        <div className="drop-pin-alert">
                                            <MapPin size={16} />
                                            <span>Please drop a pin on the deck plan</span>
                                        </div>
                                    )}

                                    <div className="form-section-card">
                                        <label className="checkbox-field-premium">
                                            <input type="checkbox" checked={formData.avoidUpdation} onChange={(e) => setFormData({ ...formData, avoidUpdation: e.target.checked })} />
                                            <span className="custom-check" />
                                            <span>Avoid Updation</span>
                                        </label>
                                    </div>

                                    <div className="form-group-technical">
                                        <label>MOVEMENT TYPE</label>
                                        <div className="custom-select-v2" onClick={() => setOpenDropdown(openDropdown === 'movement' ? null : 'movement')}>
                                            <span>{formData.movementType || 'Select Type'}</span>
                                            <ChevronDown size={14} />
                                            {openDropdown === 'movement' && (
                                                <div className="dropdown-v4">
                                                    {['Installation', 'Maintenance', 'Removal', 'Internal Movement', 'Disposal'].map(type => (
                                                        <div key={type} className="drop-item" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, movementType: type }); setOpenDropdown(null); }}>{type}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group-technical">
                                        <label>IHM PART <span className="req">*</span></label>
                                        <div className="custom-select-v2" onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'ihm' ? null : 'ihm'); }}>
                                            <span>{formData.ihmPart || 'Select IHM Part'}</span>
                                            <ChevronDown size={14} />
                                            {openDropdown === 'ihm' && (
                                                <div className="dropdown-v4">
                                                    {['Part I - Materials contained in ship structure', 'Part II - Operationally generated wastes', 'Part III - Stores'].map(part => (
                                                        <div key={part} className="drop-item" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, ihmPart: part }); setOpenDropdown(null); }}>{part}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group-technical">
                                        <label>SUSPECTED HAZARDOUS MATERIALS <span className="req">*</span></label>
                                        <div className="multi-select-list">
                                            {['Asbestos', 'PCB', 'Ozone Depleting Substances', 'Organotin Compounds', 'Lead-based Paint'].map(mat => (
                                                <div key={mat}
                                                    className={`list-item ${formData.hazMaterials.includes(mat) ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        const updated = formData.hazMaterials.includes(mat)
                                                            ? formData.hazMaterials.filter(m => m !== mat)
                                                            : [...formData.hazMaterials, mat];
                                                        setFormData({ ...formData, hazMaterials: updated });
                                                    }}>
                                                    {mat}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-row-balanced">
                                        <div className="form-group-technical flex-1">
                                            <label>DECK PLAN <span className="req">*</span></label>
                                            <input type="text" value={formData.deckPlan} readOnly className="read-only-input" />
                                        </div>
                                        <div className="form-group-technical flex-1">
                                            <label>SHIP PO</label>
                                            <input type="text" placeholder="PO-123456" value={formData.shipPO} onChange={e => setFormData({ ...formData, shipPO: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="form-group-technical">
                                        <label>NAME <span className="req">*</span></label>
                                        <input type="text" placeholder="Enter entry name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>

                                    <div className="form-row-balanced">
                                        <div className="form-group-technical">
                                            <label>COMPARTMENT</label>
                                            <input type="text" placeholder="e.g. Engine Room" value={formData.compartment} onChange={e => setFormData({ ...formData, compartment: e.target.value })} />
                                        </div>
                                        <div className="form-group-technical">
                                            <label>EQUIPMENT</label>
                                            <input type="text" placeholder="e.g. Pump" value={formData.equipment} onChange={e => setFormData({ ...formData, equipment: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="form-row-balanced">
                                        <div className="form-group-technical">
                                            <label>POSITION</label>
                                            <input type="text" placeholder="e.g. Port Side" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} />
                                        </div>
                                        <div className="form-group-technical">
                                            <label>COMPONENT</label>
                                            <input type="text" placeholder="e.g. Gasket" value={formData.component} onChange={e => setFormData({ ...formData, component: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="form-group-technical">
                                        <label>MATERIAL</label>
                                        <input type="text" placeholder="e.g. Rubber" value={formData.material} onChange={e => setFormData({ ...formData, material: e.target.value })} />
                                    </div>

                                    <div className="form-row-balanced">
                                        <div className="form-group-technical flex-2">
                                            <label>QUANTITY OF HM</label>
                                            <input type="text" placeholder="12.5" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                                        </div>
                                        <div className="form-group-technical flex-1">
                                            <label>UNIT</label>
                                            <div className="custom-select-v2" onClick={() => setOpenDropdown(openDropdown === 'unit' ? null : 'unit')}>
                                                <span>{formData.unit}</span>
                                                <ChevronDown size={14} />
                                                {openDropdown === 'unit' && (
                                                    <div className="dropdown-v4">
                                                        {['kg', 'm²', 'pcs', 'ltr'].map(u => (
                                                            <div key={u} className="drop-item" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, unit: u }); setOpenDropdown(null); }}>{u}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group-technical">
                                        <label>DOCUMENT ATTACHMENTS</label>
                                        {formData.files.length <= 2 ? (
                                            <div className="upload-dropzone-v4" onClick={handleFileUpload}>
                                                <div className="up-icon"><Upload size={20} /></div>
                                                <p>{formData.files.length === 0 ? 'Choose document file(s)' : `${formData.files.length} File(s) Selected`}</p>
                                                <div className="file-preview-list-mini">
                                                    {formData.files.map((f, i) => <span key={i} className="f-mini-tag">{f}</span>)}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="custom-select-v2 doc-dropbox" onClick={() => setOpenDropdown(openDropdown === 'files' ? null : 'files')}>
                                                <span>{formData.files.length} Documents Attached</span>
                                                <ChevronDown size={14} />
                                                {openDropdown === 'files' && (
                                                    <div className="dropdown-v4 dropdown-files">
                                                        {formData.files.map((f, i) => (
                                                            <div key={i} className="drop-item file-item">
                                                                <span>{f}</span>
                                                                <X size={12} onClick={(e) => { e.stopPropagation(); setFormData(p => ({ ...p, files: p.files.filter((_, idx) => idx !== i) })); }} />
                                                            </div>
                                                        ))}
                                                        <div className="drop-item add-more" onClick={(e) => { e.stopPropagation(); handleFileUpload(); }}>
                                                            + Add More Documents
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-footer-v5">
                                    <button className="discard-btn-v5" onClick={() => setViewMode('list')}>DISCARD</button>
                                    <button className="create-btn-v5" onClick={handleAddMaterial}>CREATE ENTRY</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="sidebar-fab-v5">
                        {viewMode === 'list' && (
                            <button className="fab-blue-v5" onClick={() => { setViewMode('add'); setActiveTool('pin'); }}>
                                <Plus size={32} />
                            </button>
                        )}
                    </div>
                </aside>
                {/* Assuming viewer-viewport-v5 is a sibling to aside, and we want the panel inside it */}
                {/* The provided content does not show the viewer-viewport-v5 closing tag, so I'll place it after the aside,
                    assuming the structure is <div class="main-container"><aside>...</aside><div class="viewer-viewport-v5">...</div></div> */}
                {/* However, the instruction implies it should be within the viewer-viewport-v5.
                    Given the provided snippet, the closing `</div>` tags after `sidebar-fab-v5` suggest closing the main layout container.
                    I will place it as a sibling to the `aside` element, and then close the main container.
                    This means the `materials-bottom-panel` will be at the same level as the `aside` (sidebar).
                    If the `viewer-viewport-v5` is also at this level, then this panel will be a sibling to both.
                    The instruction's snippet for the change shows it after the `sidebar-fab-v5` and then two `</div>` tags,
                    which would place it outside the `aside` element.
                    I will follow the provided snippet's placement. */}
            </div>


            <footer className="technical-footer-v3">
                <div className="f-meta-group">
                    <div className="f-status-item">
                        <span>SYSTEM ACTIVE</span>
                    </div>
                    <div className="f-divider" />
                    <div className="f-h-item">TOTAL HAZMAT ITEMS: {inventory.length}</div>
                    <div className="f-divider" />
                    <div className="f-h-item">LAST SYNC: JUST NOW</div>
                </div>
                <div className="f-version">
                    IHM MAPPING INTERFACE V4.2.0
                </div>
            </footer>
        </div>
    );
}
