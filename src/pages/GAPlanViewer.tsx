import React, { useState, useRef, useEffect } from 'react';
import {
    Hand,
    Maximize,
    RotateCw,
    RotateCcw,
    History,
    CheckCircle,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Crop,
    ZoomIn,
    ZoomOut,
    Pencil,
    Ship,
    X
} from 'lucide-react';
import './GAPlanViewer.css';
import { PLAN_GENERIC } from '../assets/ship_plans';

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

interface GAPlanViewerProps {
    filename: string;
    fileUrl: string;
    onClose: () => void;
    mappedSections: MappedSection[];
    onUpdateSections: React.Dispatch<React.SetStateAction<MappedSection[]>>;
    focusedSectionId?: string | null;
    vesselName: string;
    isIsolationMode?: boolean;
}


export default function GAPlanViewer({
    filename,
    fileUrl,
    onClose,
    mappedSections,
    onUpdateSections,
    focusedSectionId,
    vesselName,
    isIsolationMode = false
}: GAPlanViewerProps) {
    // View State
    const [zoom, setZoom] = useState(30); // Initial Zoom
    const [rotation, setRotation] = useState(0);
    const [imgAspectRatio, setImgAspectRatio] = useState(1.428); // Default 1000/700

    // Sanitize URL internally
    const displayFileUrl = (fileUrl && !fileUrl.includes('ga_plan_')) ? fileUrl : PLAN_GENERIC;

    const [offset, setOffset] = useState({ x: 0, y: 0 });

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTool, setActiveTool] = useState<'none' | 'hand' | 'crop'>('none');
    const [localFocusedId, setLocalFocusedId] = useState<string | null>(focusedSectionId || null);

    // Sync prop to local state
    useEffect(() => {
        if (focusedSectionId) {
            setLocalFocusedId(focusedSectionId);
        }
    }, [focusedSectionId]);

    const canvasRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isPdf = filename.toLowerCase().endsWith('.pdf');

    // Toast state
    const [toast, setToast] = useState<{ title: string; subtitle: string; visible: boolean }>({ title: '', subtitle: '', visible: false });
    const [lastAddedId, setLastAddedId] = useState<string | null>(null);

    // Selection state
    const [currentSelection, setCurrentSelection] = useState<Rect | null>(null);
    const [newSelectionTitle, setNewSelectionTitle] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

    // Center view on focused section or fit entire plan
    useEffect(() => {
        if (localFocusedId) {
            const section = mappedSections.find(s => s.id === localFocusedId);
            if (section && wrapperRef.current) {
                const viewport = wrapperRef.current.parentElement?.getBoundingClientRect();
                if (viewport) {
                    // Cap zoom to 100% to keep it "personal size" and clear
                    const targetZoom = 100;
                    setZoom(targetZoom);
                    setOffset({
                        x: (viewport.width / 2) - ((section.rect.x + section.rect.width / 2) * targetZoom / 100),
                        y: (viewport.height / 2) - ((section.rect.y + section.rect.height / 2) * targetZoom / 100)
                    });
                }
            }
        } else if (wrapperRef.current) {
            // Global Fit: Scale to show entire GA plan
            const viewport = wrapperRef.current.parentElement?.getBoundingClientRect();
            if (viewport) {
                const imgWidth = 1000;
                const imgHeight = 1000 / imgAspectRatio;
                const padding = 1.02; // Minimal 2% padding
                const scaleX = viewport.width / (imgWidth * padding);
                const scaleY = viewport.height / (imgHeight * padding);

                // Aggressive fit: Fill as much as possible
                const fitZoom = Math.min(scaleX, scaleY) * 100;
                setZoom(fitZoom);
                setOffset({
                    x: (viewport.width - (imgWidth * fitZoom / 100)) / 2,
                    y: (viewport.height - (imgHeight * fitZoom / 100)) / 2
                });
            }
        }
    }, [localFocusedId, mappedSections.length, fileUrl, vesselName]);

    // Pan handling
    const [isPanning, setIsPanning] = useState(false);
    const lastPanPoint = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if (activeTool === 'hand') {
            setIsPanning(true);
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
            e.preventDefault();
            return;
        }

        if (activeTool === 'crop') {
            const rect = wrapperRef.current?.getBoundingClientRect();
            if (rect && rect.width > 0) {
                const scaleFactor = 1000 / rect.width;
                const x = (e.clientX - rect.left) * scaleFactor;
                const y = (e.clientY - rect.top) * scaleFactor;
                setStartPoint({ x, y });
                setIsDrawing(true);
                setCurrentSelection(null);
                setNewSelectionTitle('');
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning && activeTool === 'hand') {
            const dx = e.clientX - lastPanPoint.current.x;
            const dy = e.clientY - lastPanPoint.current.y;
            setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
            return;
        }

        if (isDrawing && activeTool === 'crop') {
            const rect = wrapperRef.current?.getBoundingClientRect();
            if (rect && rect.width > 0) {
                const scaleFactor = 1000 / rect.width;
                const currentX = (e.clientX - rect.left) * scaleFactor;
                const currentY = (e.clientY - rect.top) * scaleFactor;

                setCurrentSelection({
                    x: Math.min(startPoint.x, currentX),
                    y: Math.min(startPoint.y, currentY),
                    width: Math.max(1, Math.abs(currentX - startPoint.x)),
                    height: Math.max(1, Math.abs(currentY - startPoint.y))
                });
            }
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        setIsDrawing(false);
        if (currentSelection && (currentSelection.width < 10 || currentSelection.height < 10)) {
            setCurrentSelection(null);
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (activeTool === 'hand') {
            const delta = e.deltaY;
            setZoom(prev => {
                const newZoom = delta > 0 ? prev - 5 : prev + 5;
                return Math.min(Math.max(10, newZoom), 400);
            });
        }
    };

    const showToast = (title: string, subtitle: string) => {
        setToast({ title, subtitle, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    // escape key to cancel
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setActiveTool('none');
                setCurrentSelection(null);
                setNewSelectionTitle('');
                setIsDrawing(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const checkOverlap = (newRect: Rect) => {
        return mappedSections.some(section => {
            const r1 = newRect;
            const r2 = section.rect;

            // Check if rectangles intersect
            return !(r2.x > r1.x + r1.width ||
                r2.x + r2.width < r1.x ||
                r2.y > r1.y + r1.height ||
                r2.y + r2.height < r1.y);
        });
    };

    const addSelection = () => {
        if (!currentSelection || !newSelectionTitle) return;

        // Check for overlap with existing sections
        if (checkOverlap(currentSelection)) {
            alert("This area is already cropped. You cannot crop the same area twice.");
            return;
        }

        const newId = Date.now().toString();
        const sectionId = `DECK-${newId.slice(-4)}`;
        const newSection: MappedSection = {
            id: newId,
            title: newSelectionTitle,
            sectionId: sectionId,
            rect: currentSelection,
            itemsCount: 0,
            isVisible: true
        };
        // Initialize empty inventory for this deck
        localStorage.setItem(`inventory_${vesselName}_${newSelectionTitle}`, JSON.stringify([]));
        onUpdateSections(prev => [...prev, newSection]);
        setLastAddedId(newId);
        showToast("Deck Saved Successfully", `${newSelectionTitle} has been added to the vessel project`);

        // Clear selection to avoid duplication in UI
        setCurrentSelection(null);
        setNewSelectionTitle('');
        setActiveTool('none');
    };

    const handleNewSection = () => {
        setCurrentSelection(null);
        setNewSelectionTitle('');
        setActiveTool('crop');
    };

    const undoLastSave = () => {
        if (lastAddedId) {
            onUpdateSections(prev => prev.filter(s => s.id !== lastAddedId));
            setLastAddedId(null);
            setToast(prev => ({ ...prev, visible: false }));
        }
    };

    const deleteSection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onUpdateSections((prev: MappedSection[]) => prev.filter((s: MappedSection) => s.id !== id));
    };

    const handleEditMapping = (section: MappedSection, e: React.MouseEvent) => {
        e.stopPropagation();
        const urlParams = new URLSearchParams({
            url: fileUrl,
            name: section.title,
            x: section.rect.x.toString(),
            y: section.rect.y.toString(),
            w: section.rect.width.toString(),
            h: section.rect.height.toString(),
            mode: 'add',
            vessel: vesselName
        });
        window.open(`/mapping?${urlParams.toString()}`, '_blank');
    };


    const CropThumbnail = ({ rect }: { rect: Rect }) => {
        const containerW = 252;
        const aspectRatio = rect.height / rect.width;
        const dynamicH = containerW * aspectRatio;
        const scale = containerW / rect.width;

        return (
            <div className="section-thumbnail-box" style={{
                width: `${containerW}px`,
                height: `${dynamicH}px`,
                background: 'white',
                overflow: 'hidden',
                position: 'relative',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <img
                    src={displayFileUrl}
                    alt="crop"
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
        );
    };

    return (
        <div className="ga-viewer-overlay">
            <div className={`ga-toast ${toast.visible ? 'show' : ''}`}>
                <CheckCircle size={20} />
                <div className="ga-toast-content">
                    <div className="ga-toast-title">{toast.title}</div>
                    <div className="ga-toast-subtitle">{toast.subtitle}</div>
                </div>
                <div className="ga-toast-action" onClick={undoLastSave}>UNDO</div>
            </div>

            {/* Top Nav Removed */}

            <div className="ga-viewer-header">
                <div className="viewer-header-left">
                    <div className="logo-icon-box-v2">
                        <Ship size={20} className="sailing-logo" />
                    </div>
                    <div className="viewer-title-text">
                        <h3>{vesselName}</h3>
                        <p>TECHNICAL ENGINEERING VIEWER</p>
                    </div>
                </div>

                <div className="viewer-header-actions">
                    <button className="exit-viewer-btn" onClick={onClose}>
                        <X size={18} />
                        <span>EXIT VIEWER</span>
                    </button>
                </div>
            </div>

            <div className={`ga-viewer-content-area ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <div
                    className={`ga-viewer-main ${activeTool === 'hand' ? 'hand-active' : ''} ${activeTool === 'crop' ? 'crop-active' : ''}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    // onMouseLeave={handleMouseUp} // Removed to prevent potential early drag release
                    onWheel={handleWheel}
                    ref={canvasRef}
                >
                    <div
                        className="ga-plan-wrapper"
                        style={{
                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
                            transformOrigin: 'center center'
                        }}
                    >

                        <div
                            className="ga-drawing-coordinate-reference"
                            ref={wrapperRef}
                            style={{
                                position: 'relative',
                                width: '1000px',
                                height: `${1000 / imgAspectRatio}px`,
                                background: 'transparent'
                            }}
                        >
                            {isPdf ? (
                                <iframe
                                    src={`${displayFileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                    title="GA Plan PDF"
                                    className="ga-plan-frame"
                                    style={{ width: '1000px', height: `${1000 / imgAspectRatio}px`, border: 'none', display: 'block' }}
                                />
                            ) : (
                                <img
                                    src={displayFileUrl}
                                    alt="GA Plan"
                                    className="ga-plan-image"
                                    style={{ width: '1000px', height: 'auto', display: 'block' }}
                                    draggable={false}
                                    onLoad={(e) => {
                                        const { naturalWidth, naturalHeight } = e.currentTarget;
                                        if (naturalWidth && naturalHeight) {
                                            setImgAspectRatio(naturalWidth / naturalHeight);
                                        }
                                    }}
                                />
                            )}

                            {mappedSections.map(section => (
                                // Use isIsolationMode to hide other sections when enabled, 
                                // otherwise show all mapped sections
                                ((isIsolationMode && localFocusedId) ? section.id === localFocusedId : section.isVisible) && (
                                    <div
                                        key={section.id}
                                        className="drawn-selection"
                                        style={{
                                            left: section.rect.x,
                                            top: section.rect.y,
                                            width: section.rect.width,
                                            height: section.rect.height,
                                            background: (localFocusedId === section.id || (activeTool === 'none' && !localFocusedId)) ? 'rgba(0, 176, 250, 0.1)' : 'transparent',
                                            border: (localFocusedId === section.id || (activeTool === 'none' && !localFocusedId)) ? '2px solid #00B0FA' : '1px dashed rgba(0,176,250,0.3)',
                                            zIndex: localFocusedId === section.id ? 5 : 1
                                        }}
                                    >
                                        {localFocusedId === section.id && (
                                            <div
                                                className="section-label-viewer"
                                                style={{
                                                    fontSize: Math.max(12, 14 * (100 / zoom)) + 'px'
                                                }}
                                            >
                                                {section.title}
                                            </div>
                                        )}
                                    </div>
                                )
                            ))}

                            {currentSelection && (
                                <div
                                    className="ga-selection-box"
                                    style={{
                                        left: currentSelection.x,
                                        top: currentSelection.y,
                                        width: currentSelection.width,
                                        height: currentSelection.height
                                    }}
                                >
                                    {!isDrawing && (
                                        <div
                                            className="selection-input-container"
                                            style={{
                                                transform: `scale(${100 / zoom})`,
                                                transformOrigin: 'top left'
                                            }}
                                        >
                                            <input
                                                type="text"
                                                placeholder="Enter Title..."
                                                value={newSelectionTitle}
                                                onChange={(e) => setNewSelectionTitle(e.target.value)}
                                                className="selection-input"
                                                autoFocus
                                                onKeyDown={(e) => e.key === 'Enter' && addSelection()}
                                            />
                                            <button className="input-save-btn" onClick={addSelection}>
                                                <CheckCircle size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Left Toolbar */}
                    <div className="ga-toolbar-left">
                        <div className="zoom-controls">
                            <button className="zoom-adjust-btn" onClick={() => setZoom(z => Math.max(10, z - 5))}>
                                <ZoomOut size={18} />
                            </button>
                            <div className="zoom-percentage">
                                <span className="zoom-label">ZOOM</span>
                                <span className="zoom-value">{zoom.toFixed(1)}%</span>
                            </div>
                            <button className="zoom-adjust-btn" onClick={() => setZoom(z => Math.min(400, z + 5))}>
                                <ZoomIn size={18} />
                            </button>
                        </div>
                        <div className="tool-divider"></div>
                        <button
                            className={`tool-btn-inline ${activeTool === 'hand' ? 'active' : ''}`}
                            onClick={() => setActiveTool(activeTool === 'hand' ? 'none' : 'hand')}
                            title="Hand Tool"
                        >
                            <Hand size={18} />
                        </button>
                        <button
                            className={`tool-btn-inline ${activeTool === 'crop' ? 'active' : ''}`}
                            onClick={handleNewSection}
                            title="Crop Tool"
                        >
                            <Crop size={18} />
                        </button>
                    </div>

                    {/* Metadata HUD */}
                    <div className="drawing-info-card">
                        <div className="info-header">
                            <span>METADATA HUD</span>
                            <div className="status-dot"></div>
                        </div>
                        <div className="info-row">
                            <span className="info-label">SCALE:</span>
                            <span className="info-value">1:100 @ ISO A0</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">DWG NO:</span>
                            <span className="info-value">GA-4592-REV04</span>
                        </div>
                        <div className="status-approved">APPROVED</div>
                        <div className="timestamp-text">25_01_27_09:42_UTC</div>
                    </div>

                    {/* Navigation Cluster */}
                    <div className="ga-toolbar-right">
                        <div className="quick-actions">
                            <button
                                className="tool-btn-inline"
                                onClick={() => {
                                    window.open(displayFileUrl, '_blank');
                                }}
                                title="Open Original File"
                            >
                                <Maximize size={18} />
                            </button>
                            <button className="tool-btn-inline" onClick={() => setRotation(r => r - 90)} title="Rotate Left"><RotateCcw size={18} /></button>
                            <button className="tool-btn-inline" onClick={() => setRotation(r => r + 90)} title="Rotate Right"><RotateCw size={18} /></button>
                            <button className="tool-btn-inline" onClick={() => { setZoom(100); setRotation(0); setOffset({ x: 0, y: 0 }); onUpdateSections([]); }} title="Reset View"><History size={18} /></button>
                        </div>
                    </div>

                    <div className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </div>
                </div>

                <div className={`ga-viewer-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <h4>MAPPED SECTIONS</h4>
                        <div className="sidebar-sub-label">{mappedSections.length} AREAS DEFINED</div>
                    </div>

                    <div className="sections-list">
                        {mappedSections.map((section, idx) => {
                            const isFocused = section.id === localFocusedId;
                            return (
                                <div
                                    key={section.id}
                                    className={`ga-section-card ${isFocused ? 'active focused' : ''} ${!section.isVisible ? 'hidden-section' : ''}`}
                                    onClick={() => {
                                        setLocalFocusedId(section.id === localFocusedId ? null : section.id);
                                        // Update URL to focus on this section
                                        const query = new URLSearchParams(window.location.search);
                                        if (section.id === localFocusedId) {
                                            query.delete('focusedId');
                                        } else {
                                            query.set('focusedId', section.id);
                                        }
                                        window.history.replaceState(null, '', `${window.location.pathname}?${query.toString()}`);
                                    }}
                                >
                                    <div className="section-card-header">
                                        <span className="section-idx" style={{ color: isFocused ? 'white' : '#2563EB', fontWeight: 800 }}>{(idx + 1).toString().padStart(2, '0')}</span>
                                        <div className="card-actions-row">
                                            <Pencil
                                                size={12}
                                                className="action-icon edit-icon"
                                                onClick={(e) => handleEditMapping(section, e)}
                                            />
                                            <Trash2
                                                size={12}
                                                className="action-icon trash-icon"
                                                onClick={(e) => deleteSection(section.id, e)}
                                            />
                                        </div>
                                    </div>
                                    <CropThumbnail rect={section.rect} />
                                    <div className="section-name">{section.title}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
