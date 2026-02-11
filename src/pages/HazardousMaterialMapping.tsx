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
    Ship,
    Calendar,
    ChevronLeft
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
    equipmentClass?: string;
    noOfPieces?: string;
    totalQuantity?: string;
    createdDate?: string;
    updatedDate?: string;
    remarks?: string;
}

import type { Material } from '../types/index';

import { PLAN_GENERIC } from '../assets/ship_plans';

export default function HazardousMaterialMapping() {
    const location = useLocation();
    const navigate = useNavigate();
    const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

    let fileUrl = query.get('url') || '';
    if (fileUrl && fileUrl.includes('ga_plan_')) {
        fileUrl = PLAN_GENERIC;
    }
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
    const vesselName = query.get('vessel') || 'Unknown Vessel';
    const [inventory, setInventory] = useState<MaterialEntry[]>([]);
    const lastLoadedKeyRef = useRef("");
    const [searchQuery, setSearchQuery] = useState('');
    const [tempPin, setTempPin] = useState<{ x: number, y: number } | null>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const lastPanPoint = useRef({ x: 0, y: 0 });

    const [availableDecks, setAvailableDecks] = useState<any[]>([]);
    const [deckSelectorOpen, setDeckSelectorOpen] = useState(false);
    const [targetDeckForTransfer, setTargetDeckForTransfer] = useState<string | null>(null); // New state for pending transfer

    useEffect(() => {
        const sections = localStorage.getItem(`vessel_sections_${vesselName}`);
        if (sections) {
            setAvailableDecks(JSON.parse(sections));
        }
    }, [vesselName]);

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
            // Clear navigation state to prevent re-triggering on refresh
            window.history.replaceState({}, document.title);

            // Professional Guidance Alert
            setTimeout(() => {
                alert(`RE-MAPPING INITIATED: ${transfer.name}\n\nTechnical details have been pre-filled. Please click on the plan to set the new location for this material on ${sectionName}.`);
            }, 600);
        }
    }, [location.state, sectionName]);

    // Constants for GA plan size - Use high-res 2000px for clarity
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
        noOfPieces: '1',
        totalQuantity: '0.01',
        createdDate: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0],
        remarks: '',
        equipmentClass: '',
        hmStatus: 'CHM',
        files: [] as string[]
    });

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [viewingMaterial, setViewingMaterial] = useState<MaterialEntry | null>(null);

    // Initial mode check and focus on crop
    useEffect(() => {
        // 1. Sync inventory when deck or vessel changes
        const key = `inventory_${vesselName}_${sectionName}`;
        const stored = localStorage.getItem(key);
        const parsed = stored ? JSON.parse(stored) : [];
        setInventory(parsed);
        lastLoadedKeyRef.current = key;

        // 2. Handle matId focus
        const matId = query.get('matId');
        if (matId) {
            const found = parsed.find((i: MaterialEntry) => i.id === matId);
            if (found) {
                setViewingMaterial(found);
                setViewMode('detail');
            }
        }

        // 3. Handle mode add
        if (query.get('mode') === 'add') {
            setViewMode('add');
            setActiveTool('pin');
        }

        const updatePosition = () => {
            const viewport = wrapperRef.current?.getBoundingClientRect();
            if (viewport && viewport.width > 0) {
                // Cap zoom to 150% (1.5) to keep it "personal size" and clear
                const initialZoom = 100; // Fixed "personal size" zoom at 100%
                setZoom(initialZoom);

                // Center precisely
                setOffset({
                    x: (viewport.width / 2) - ((rect.w / 2) * initialZoom / 100),
                    y: (viewport.height / 2) - ((rect.h / 2) * initialZoom / 100)
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
    }, [rect.w, rect.h, query, vesselName, sectionName]);

    // Save to localStorage whenever inventory changes
    useEffect(() => {
        const key = `inventory_${vesselName}_${sectionName}`;
        // Only save if the current inventory belongs to the current deck/vessel key
        // This prevents overwriting data during navigation transitions
        if (lastLoadedKeyRef.current === key && inventory.length > 0) {
            localStorage.setItem(key, JSON.stringify(inventory));
            // Dispatch storage event for other tabs
            window.dispatchEvent(new Event('storage'));
        }
    }, [inventory, sectionName, vesselName]);

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

        const updatedInventory = [...inventory, newEntry];
        setInventory(updatedInventory);

        // Sync with vessel-wide inventory for the Records page
        const recordMaterial: Material = {
            id: `MAPPED-${newEntry.id}`,
            name: newEntry.name,
            ihmPart: newEntry.ihmPart,
            category: newEntry.hmStatus === 'CHM' ? 'hazard' : 'warning',
            status: 'Verified',
            completion: 100,
            zone: sectionName,
            poNo: newEntry.shipPO,
            component: newEntry.component,
            materialName: newEntry.material,
            hazardType: newEntry.hazMaterials[0] || '',
            equipment: newEntry.equipment
        };

        const vesselInventoryKey = `vessel_inventory_${vesselName}`;
        const existingVesselInv: Material[] = JSON.parse(localStorage.getItem(vesselInventoryKey) || '[]');
        localStorage.setItem(vesselInventoryKey, JSON.stringify([...existingVesselInv, recordMaterial]));

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
            noOfPieces: '1',
            totalQuantity: '0.01',
            createdDate: new Date().toISOString().split('T')[0],
            updatedDate: new Date().toISOString().split('T')[0],
            remarks: '',
            equipmentClass: '',
            hmStatus: 'CHM',
            files: [] as string[]
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
                    <button className="back-btn-v5" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} />
                    </button>
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
                                    const initialZoom = 100;
                                    setZoom(initialZoom);
                                    setOffset({
                                        x: (viewport.width / 2) - ((rect.w / 2) * initialZoom / 100),
                                        y: (viewport.height / 2) - ((rect.h / 2) * initialZoom / 100)
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

                                {inventory.map(item => {
                                    // If we are viewing a specific material detail, only show its pin
                                    const shouldShowPin = viewingMaterial ? item.id === viewingMaterial.id : true;

                                    return item.pin && shouldShowPin && (
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
                                    );
                                })}

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
                        <>
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
                        </>
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
                                                <span className="dh-ref">PO NO: {viewingMaterial.shipPO || 'N/A'}</span>
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
                                                    const r = deck.rect || { x: 0, y: 0, width: 2000, height: 1400 };
                                                    // Data Integrity: Remove from current deck inventory before transfer
                                                    const newInv = inventory.filter(i => i.id !== viewingMaterial.id);
                                                    setInventory(newInv);
                                                    localStorage.setItem(`inventory_${vesselName}_${sectionName}`, JSON.stringify(newInv));

                                                    const params = new URLSearchParams({
                                                        url: fileUrl, // Preserve original plan URL
                                                        name: deck.title || deck.sectionName,
                                                        vessel: vesselName,
                                                        x: (r.x || 0).toString(),
                                                        y: (r.y || 0).toString(),
                                                        w: (r.width || r.w || 2000).toString(),
                                                        h: (r.height || r.h || 1400).toString()
                                                    });

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
                                                    {['MTS - Move to Store', 'MTS - Move from Store', 'Relocate Deck', 'Relocate Location', 'Landed Ashore'].map(type => (
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
                                                    {['Part I - Materials contained in ship structure or equipment', 'Part II - Operationally generated wastes', 'Part III - Stores'].map(part => (
                                                        <div key={part} className="drop-item" onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFormData({ ...formData, ihmPart: part, equipmentClass: '' });
                                                            setOpenDropdown('eq_class'); // Trigger open equipment class
                                                        }}>{part}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Equipment Class Logic - Always Visible */}
                                    <div className="form-group-technical">
                                        <label>EQUIPMENT CLASS</label>

                                        <div className={`custom-select-v2 ${!formData.ihmPart ? 'disabled-selection' : ''}`}
                                            onClick={() => {
                                                if (formData.ihmPart) {
                                                    setOpenDropdown(openDropdown === 'eq_class' ? null : 'eq_class');
                                                }
                                            }}>
                                            <span>{formData.equipmentClass || 'Select Equipment Class'}</span>
                                            <ChevronDown size={14} />
                                            {openDropdown === 'eq_class' && (
                                                <div className="dropdown-v4">
                                                    {formData.ihmPart?.includes('Part I') ? (
                                                        ['1-1 Paints and Coatings systems', '1-2 Equipment and Machinery', '1-3 Structure and Hull'].map((opt, i) => (
                                                            <div key={`${opt}-${i}`} className="drop-item" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, equipmentClass: opt }); setOpenDropdown(null); }}>{opt}</div>
                                                        ))
                                                    ) : formData.ihmPart ? (
                                                        ['Part 2', 'Part 2', 'Part 2'].map((opt, i) => (
                                                            <div key={`${opt}-${i}`} className="drop-item" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, equipmentClass: opt }); setOpenDropdown(null); }}>{opt}</div>
                                                        ))
                                                    ) : (
                                                        <div className="drop-item disabled">Please select IHM Part first</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group-technical">
                                        <label>SUSPECTED HAZARDOUS MATERIALS <span className="req">*</span></label>
                                        <div className="custom-select-v2" onClick={() => setOpenDropdown(openDropdown === 'suspected_hm' ? null : 'suspected_hm')}>
                                            <span>{formData.hazMaterials[0] || 'Select suspected material'}</span>
                                            <ChevronDown size={14} />
                                            {openDropdown === 'suspected_hm' && (
                                                <div className="dropdown-v4">
                                                    {['Asbestos', 'Ozone Depleting Substances', 'Organotin Compounds', 'Cuibutryne', 'Radioactive materials', 'Polychloronaphthalenes', 'Certain Shortchain Chlorinated Paraffins', 'Perfluorooctane Sulfonate (PFOS)', 'Hexabromocyclododecane (HBCDD)'].map(mat => (
                                                        <div key={mat} className="drop-item" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, hazMaterials: [mat] }); setOpenDropdown(null); }}>{mat}</div>
                                                    ))}
                                                </div>
                                            )}
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

                                    {/* Fields from Screenshot - Added eg: labels */}
                                    <div className="form-row-quad" style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                        <div className="form-group-technical flex-1">
                                            <label>Quantity of HM</label>
                                            <input type="text" placeholder="eg: 0.02" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                                        </div>
                                        <div className="form-group-technical flex-1">
                                            <label>Unit</label>
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
                                        <div className="form-group-technical flex-1">
                                            <label>No. of Pieces</label>
                                            <input type="text" placeholder="eg: 8" value={formData.noOfPieces} onChange={e => setFormData({ ...formData, noOfPieces: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="total-quantity-status" style={{ padding: '8px 0', borderBottom: '1px solid #E2E8F0', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '16px', height: '16px', border: '1px solid #94A3B8', borderRadius: '2px' }} />
                                            <div style={{ color: '#00B0FA', fontWeight: 'bold' }}>
                                                Total Quantity of HM: <span style={{ color: '#1E293B', marginLeft: '5px' }}>{formData.noOfPieces} PCS | {formData.quantity || '0.00'} {formData.unit}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* New File Upload Design */}
                                    <div className="form-group-technical">
                                        <label>Documents Attachment</label>
                                        <div className="upload-box-v5" style={{ position: 'relative' }}>
                                            <Upload size={20} color="#00B0FA" />
                                            <p>Choose File or Drag-and-Drop</p>
                                            <span className="file-hint">**PDF, PNG and JPEG allowed up to 10MB.</span>
                                            <input
                                                type="file"
                                                multiple
                                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        const newFiles = Array.from(e.target.files).map(f => f.name);
                                                        setFormData({ ...formData, files: [...formData.files, ...newFiles] });
                                                    }
                                                }}
                                            />
                                        </div>

                                        {/* File List Logic */}
                                        <div className="file-status-rail" style={{ marginTop: '10px' }}>
                                            {formData.files.length === 1 ? (
                                                <div className="neat-file-row">
                                                    <FileText size={16} color="#00B0FA" />
                                                    <span>{formData.files[0]}</span>
                                                    <X size={18} className="remove-f" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, files: [] }); }} />
                                                </div>
                                            ) : formData.files.length > 1 ? (
                                                <div className="multi-file-dropdown-hover"
                                                    onMouseEnter={() => setOpenDropdown('files_hover')}
                                                    onMouseLeave={() => setOpenDropdown(null)}>
                                                    <div className="hover-trigger-box">
                                                        <FileText size={16} color="#00B0FA" />
                                                        <span>{formData.files.length} Documents Selected</span>
                                                        <ChevronDown size={14} />
                                                    </div>

                                                    {openDropdown === 'files_hover' && (
                                                        <div className="hover-dropdown-list">
                                                            <div className="hover-list-content">
                                                                {formData.files.map((f, i) => (
                                                                    <div key={i} className="hover-file-item">
                                                                        <div className="file-name-group">
                                                                            <FileText size={16} color="#64748B" />
                                                                            <span>{f}</span>
                                                                        </div>
                                                                        <X size={18} className="remove-f-mini" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, files: formData.files.filter((_, idx) => idx !== i) }); }} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* HM Status - Changed Gold to Blue */}
                                    <div className="hm-status-section" style={{ marginTop: '15px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>HM Status</label>
                                        <div style={{ display: 'flex', gap: '40px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                                <input type="radio" name="hmStatus" checked={formData.hmStatus === 'CHM'} onChange={() => setFormData({ ...formData, hmStatus: 'CHM' })} />
                                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#00B0FA' }}>CHM</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                                <input type="radio" name="hmStatus" checked={formData.hmStatus === 'PCHM'} onChange={() => setFormData({ ...formData, hmStatus: 'PCHM' })} />
                                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#64748B' }}>PCHM</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-row-balanced" style={{ marginTop: '20px' }}>
                                        <div className="form-group-technical flex-1">
                                            <label>Created Date *</label>
                                            <div className="premium-date-wrapper">
                                                <input type="date" value={formData.createdDate} onChange={e => setFormData({ ...formData, createdDate: e.target.value })} />
                                                <Calendar size={16} className="date-icon-abs" />
                                            </div>
                                            <span style={{ fontSize: '9px', color: '#94A3B8' }}>DD/MM/YYYY</span>
                                        </div>
                                        <div className="form-group-technical flex-1">
                                            <label>Updated Date For Report *</label>
                                            <div className="premium-date-wrapper">
                                                <input type="date" value={formData.updatedDate} onChange={e => setFormData({ ...formData, updatedDate: e.target.value })} />
                                                <Calendar size={16} className="date-icon-abs" />
                                            </div>
                                            <span style={{ fontSize: '9px', color: '#94A3B8' }}>DD/MM/YYYY</span>
                                        </div>
                                    </div>

                                    <div className="form-group-technical" style={{ marginTop: '15px' }}>
                                        <label>Remarks</label>
                                        <textarea
                                            placeholder="NO. : 4090200)"
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', minHeight: '60px' }}
                                            value={formData.remarks}
                                            onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                                        />
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
            </div >


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
        </div >
    );
}
