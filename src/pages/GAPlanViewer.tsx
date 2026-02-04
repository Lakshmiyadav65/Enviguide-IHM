import React, { useState, useRef } from 'react';
import {
    MoveLeft,
    Hand,
    Maximize,
    RotateCw,
    RotateCcw,
    History,
    CheckCircle,
    Ship,
    Trash2,
    Plus,
    Search,
    Minus,
    ChevronLeft,
    ChevronRight,
    Square
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
            if (rect) {
                // Important: coordinates are relative to the wrapper which is the 100% zoom reference
                const x = (e.clientX - rect.left) / (zoom / 100);
                const y = (e.clientY - rect.top) / (zoom / 100);
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
            if (rect) {
                const currentX = (e.clientX - rect.left) / (zoom / 100);
                const currentY = (e.clientY - rect.top) / (zoom / 100);

                setCurrentSelection({
                    x: Math.min(startPoint.x, currentX),
                    y: Math.min(startPoint.y, currentY),
                    width: Math.abs(currentX - startPoint.x),
                    height: Math.abs(currentY - startPoint.y)
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

    const handleNewSection = () => {
        setCurrentSelection(null);
        setNewSelectionTitle('');
        setActiveTool('crop');
    };

    // Perfect Cropped Thumbnail Logic
    const CropThumbnail = ({ rect }: { rect: Rect }) => {
        const containerW = 252;
        const containerH = 142;

        const IMG_W = 1000;

        // Exact fit
        const scaleX = containerW / rect.width;
        const scaleY = containerH / rect.height;
        const scale = Math.min(scaleX, scaleY);

        const tx = -rect.x * scale + (containerW - rect.width * scale) / 2;
        const ty = -rect.y * scale + (containerH - rect.height * scale) / 2;

        return (
            <div className="section-thumbnail-box" style={{ width: containerW, height: containerH }}>
                <img
                    src={fileUrl}
                    alt="crop"
                    className="section-thumb-img-technical"
                    style={{
                        width: IMG_W,
                        transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
                        transformOrigin: '0 0'
                    }}
                />
            </div>
        );
    };

    return (
        <div className="ga-viewer-overlay">
            {/* Short Toast Alert */}
            <div className={`ga-toast ${toast.visible ? 'show' : ''}`}>
                <CheckCircle size={16} />
                <span>{toast.message}</span>
            </div>

            {/* Top Navigation Bar */}
            <div className="ga-viewer-top-nav">
                <div className="left-nav-items">
                    <button className="back-btn" onClick={onClose}>
                        <MoveLeft size={14} />
                        <span>BACK TO DECKS</span>
                    </button>
                    <div className="breadcrumb-divider">|</div>
                    <div className="breadcrumb-text">DASHBOARD / GA PLAN</div>
                </div>
            </div>

            {/* Header Area */}
            <div className="ga-viewer-header">
                <div className="viewer-header-left">
                    <div className="viewer-icon-box">
                        <Ship size={18} color="white" />
                    </div>
                    <div className="viewer-title-text">
                        <h3>Ship GA Plan</h3>
                        <p>TECHNICAL ENGINEERING VIEWER</p>
                    </div>
                </div>
            </div>

            <div className={`ga-viewer-content-area ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                {/* Main Canvas Area */}
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
                        ref={wrapperRef}
                        style={{
                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
                            transformOrigin: 'center center'
                        }}
                    >
                        <div className="ga-plan-title-overlay">GENERAL ARRANGEMENT</div>

                        {isPdf ? (
                            <iframe
                                src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                title="GA Plan PDF"
                                className="ga-plan-frame"
                                style={{ width: '1200px', height: '800px', border: 'none' }}
                            />
                        ) : (
                            <img src={fileUrl} alt="GA Plan" className="ga-plan-image" style={{ width: '1000px' }} />
                        )}

                        {/* Mapped Sections mark on drawing */}
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
                                    <div className="selection-tag">{section.title}</div>
                                </div>
                            )
                        ))}

                        {/* Current Selection box */}
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
                                    <div className="selection-input-container">
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

                    {/* Bottom Left Toolbar */}
                    <div className="ga-toolbar-left">
                        <div className="zoom-controls">
                            <button onClick={() => setZoom(z => Math.max(10, z - 5))}>
                                <Search size={16} />
                                <Minus size={8} style={{ marginLeft: -6, marginTop: -4 }} />
                            </button>
                            <div className="zoom-percentage">
                                <span className="zoom-label">ZOOM</span>
                                <span className="zoom-value">{zoom.toFixed(1)}%</span>
                            </div>
                            <button onClick={() => setZoom(z => Math.min(400, z + 5))}>
                                <Search size={16} />
                                <Plus size={8} style={{ marginLeft: -6, marginTop: -4 }} />
                            </button>
                        </div>
                        <div className="tool-divider"></div>
                        <button
                            className={`tool-btn-inline ${activeTool === 'hand' ? 'active' : ''}`}
                            onClick={() => setActiveTool(activeTool === 'hand' ? 'none' : 'hand')}
                        >
                            <Hand size={18} />
                        </button>
                        <button
                            className={`tool-btn-inline ${activeTool === 'crop' ? 'active' : ''}`}
                            onClick={handleNewSection}
                        >
                            <Square size={18} />
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
                            <button className="tool-btn-inline" onClick={() => { setZoom(100); setOffset({ x: 0, y: 0 }); }}><Maximize size={18} /></button>
                            <button className="tool-btn-inline" onClick={() => setRotation(r => r - 90)}><RotateCcw size={18} /></button>
                            <button className="tool-btn-inline" onClick={() => setRotation(r => r + 90)}><RotateCw size={18} /></button>
                            <button className="tool-btn-inline" onClick={() => { setZoom(100); setRotation(0); setOffset({ x: 0, y: 0 }); onUpdateSections([]); }}><History size={18} /></button>
                        </div>
                    </div>

                    {/* Sidebar Toggle */}
                    <div className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </div>
                </div>

                {/* Technical Engineering Sidebar */}
                <div className={`ga-viewer-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <h4>MAPPED SECTIONS</h4>
                        <div className="sidebar-sub-label">{mappedSections.length} AREAS DEFINED</div>
                    </div>

                    <div className="sections-list">
                        {/* Currently Drawing Section */}
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

                        {/* Saved Areas List */}
                        {mappedSections.map((section, idx) => (
                            <div
                                key={section.id}
                                className={`ga-section-card ${!section.isVisible ? 'hidden-section' : ''}`}
                                onClick={() => toggleSectionVisibility(section.id)}
                            >
                                <div className="section-card-header">
                                    <span className="section-idx">0{idx + 1}</span>
                                    <Trash2 size={12} className="trash-icon" onClick={(e) => deleteSection(section.id, e)} />
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
