import React, { useState, useRef } from 'react';
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
    Ship
} from 'lucide-react';
import './GAPlanViewer.css';

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface MappedSection {
    id: string;
    title: string;
    rect: Rect;
    isVisible?: boolean;
}

interface GAPlanViewerProps {
    filename: string;
    fileUrl: string;
    onClose: () => void;
    mappedSections: MappedSection[];
    onUpdateSections: React.Dispatch<React.SetStateAction<MappedSection[]>>;
}

export default function GAPlanViewer({ filename, fileUrl, onClose, mappedSections, onUpdateSections }: GAPlanViewerProps) {
    // View State
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTool, setActiveTool] = useState<'none' | 'hand' | 'crop'>('none');

    // Selection state
    const [currentSelection, setCurrentSelection] = useState<Rect | null>(null);
    const [newSelectionTitle, setNewSelectionTitle] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

    // Toast state
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

    const canvasRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isPdf = filename.toLowerCase().endsWith('.pdf');

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

    const showToast = (message: string) => {
        setToast({ message, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    const addSelection = () => {
        if (currentSelection && newSelectionTitle) {
            const newId = Date.now().toString();
            const newSection: MappedSection = {
                id: newId,
                title: newSelectionTitle,
                rect: currentSelection,
                isVisible: false
            };
            onUpdateSections(prev => [...prev, newSection]);
            showToast(`Deck "${newSelectionTitle}" Saved Successfully`);
            setCurrentSelection(null);
            setNewSelectionTitle('');
            setActiveTool('none');
        }
    };

    const toggleSectionVisibility = (id: string) => {
        onUpdateSections((prev: MappedSection[]) => prev.map((s: MappedSection) => s.id === id ? { ...s, isVisible: !s.isVisible } : s));
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
            mode: 'add'
        });
        window.open(`/mapping?${urlParams.toString()}`, '_blank');
    };

    const handleNewSection = () => {
        setCurrentSelection(null);
        setNewSelectionTitle('');
        setActiveTool('crop');
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
                    src={fileUrl}
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
                <CheckCircle size={16} />
                <span>{toast.message}</span>
            </div>

            {/* Top Nav Removed */}

            <div className="ga-viewer-header">
                <div className="viewer-header-left">
                    <div className="logo-icon-box-v2">
                        <Ship size={20} className="sailing-logo" />
                    </div>
                    <div className="viewer-title-text">
                        <h3>MV Ocean Pioneer</h3>
                        <p>TECHNICAL ENGINEERING VIEWER</p>
                    </div>
                </div>
            </div>

            <div className={`ga-viewer-content-area ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <div
                    className={`ga-viewer-main ${activeTool === 'hand' ? 'hand-active' : ''} ${activeTool === 'crop' ? 'crop-active' : ''}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
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
                        <div className="ga-plan-title-overlay">GENERAL ARRANGEMENT</div>

                        <div
                            className="ga-drawing-coordinate-reference"
                            ref={wrapperRef}
                            style={{ position: 'relative', width: '1000px' }}
                        >
                            {isPdf ? (
                                <iframe
                                    src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                    title="GA Plan PDF"
                                    className="ga-plan-frame"
                                    style={{ width: '1000px', height: '700px', border: 'none', display: 'block' }}
                                />
                            ) : (
                                <img src={fileUrl} alt="GA Plan" className="ga-plan-image" style={{ width: '1000px', display: 'block' }} />
                            )}

                            {mappedSections.map(section => (
                                section.isVisible && (
                                    <div
                                        key={section.id}
                                        className="drawn-selection"
                                        style={{
                                            left: section.rect.x,
                                            top: section.rect.y,
                                            width: section.rect.width,
                                            height: section.rect.height
                                        }}
                                    >
                                        <div
                                            className="selection-tag"
                                            style={{
                                                transform: `scale(${100 / zoom})`,
                                                transformOrigin: 'top left'
                                            }}
                                        >
                                            {section.title}
                                        </div>
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
                                onClick={() => window.open(fileUrl, '_blank')}
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
                        {currentSelection && !isDrawing && (
                            <div className="ga-section-card active current">
                                <div className="section-card-header">
                                    <span className="section-label-blue">CURRENT SELECTION</span>
                                    <Trash2 size={12} style={{ color: '#9CA3AF', cursor: 'pointer' }} onClick={() => setCurrentSelection(null)} />
                                </div>
                                <CropThumbnail rect={currentSelection} />
                                <div className="section-name">{newSelectionTitle || 'Unnamed Section'}</div>
                            </div>
                        )}

                        {mappedSections.map((section, idx) => (
                            <div
                                key={section.id}
                                className={`ga-section-card ${!section.isVisible ? 'hidden-section' : ''}`}
                                onClick={() => toggleSectionVisibility(section.id)}
                            >
                                <div className="section-card-header">
                                    <span className="section-idx" style={{ color: '#2563EB', fontWeight: 800 }}>{(idx + 1).toString().padStart(2, '0')}</span>
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
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
