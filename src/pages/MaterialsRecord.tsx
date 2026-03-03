import { useState, useMemo, useEffect, useRef } from 'react';
import {
    Search, Plus, Filter, ChevronRight, ChevronLeft, ChevronDown, AlertCircle,
    Database, Package, Download, X, FileText, CheckCircle, ExternalLink, MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MaterialsRecord.css';

import { mockMaterials } from '../services/mockData';
import type { Material } from '../types/index';

// Local interface removed in favor of imported Material type
// Mock data removed in favor of imported mockMaterials

interface MaterialsRecordProps {
    vesselName: string;
}

export default function MaterialsRecord({ vesselName }: MaterialsRecordProps) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTag, setActiveTag] = useState('All');
    const [riskFilter, setRiskFilter] = useState('Risk Level');
    const [complianceFilter, setComplianceFilter] = useState('Compliance Status');
    const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(12);
    const [isRiskDropdownOpen, setIsRiskDropdownOpen] = useState(false);
    const [isComplianceDropdownOpen, setIsComplianceDropdownOpen] = useState(false);

    const riskRef = useRef<HTMLDivElement>(null);
    const complianceRef = useRef<HTMLDivElement>(null);
    const topScrollRef = useRef<HTMLDivElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const handleStorageChange = () => setRefreshTrigger(prev => prev + 1);
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (riskRef.current && !riskRef.current.contains(event.target as Node)) {
                setIsRiskDropdownOpen(false);
            }
            if (complianceRef.current && !complianceRef.current.contains(event.target as Node)) {
                setIsComplianceDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter Panel State
    // Filter Panel State
    const [thresholdMin, setThresholdMin] = useState(0.00);
    const [thresholdMax, setThresholdMax] = useState(1.00);
    const [selectedParts, setSelectedParts] = useState<string[]>([]);
    const [selectedZones, setSelectedZones] = useState<string[]>([]);
    const [selectedChemicalGroup, setSelectedChemicalGroup] = useState('All Chemical Groups');
    const [isEditing, setIsEditing] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Edit State
    const [editName, setEditName] = useState('');
    const [editPO, setEditPO] = useState('PO-12345');
    const [editRisk] = useState('High Risk');
    const [isEmptyCategoryDropdownOpen, setIsEmptyCategoryDropdownOpen] = useState(false);
    const [emptyStateCategory, setEmptyStateCategory] = useState('Select Material Category');
    const emptyCategoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emptyCategoryRef.current && !emptyCategoryRef.current.contains(event.target as Node)) {
                setIsEmptyCategoryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync Horizontal Scroll
    useEffect(() => {
        const top = topScrollRef.current;
        const bottom = tableContainerRef.current;
        if (!top || !bottom) return;

        const onTopScroll = () => {
            bottom.scrollLeft = top.scrollLeft;
        };
        const onBottomScroll = () => {
            top.scrollLeft = bottom.scrollLeft;
        };

        top.addEventListener('scroll', onTopScroll);
        bottom.addEventListener('scroll', onBottomScroll);

        return () => {
            top.removeEventListener('scroll', onTopScroll);
            bottom.removeEventListener('scroll', onBottomScroll);
        };
    }, []);

    // Logic: The "Big 4" demo vessels get full data. Others get the empty state.
    const demoVessels = ['MV Ocean Pioneer', 'ACOSTA', 'AFIF', 'PACIFIC HORIZON'];
    const isEmpty = !demoVessels.includes(vesselName);

    if (isEmpty) {
        return (
            <div className="empty-state-card-full">
                {/* Header Section */}
                <div className="empty-state-header">
                    <div className="header-left">
                        <div className="cloud-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.132 20.177 10.244 17.819 10.037C17.469 6.355 14.391 3.5 10.5 3.5C6.981 3.5 4.095 5.922 3.239 9.323C1.291 9.927 0 11.97 0 14C0 16.761 2.239 19 5 19H17.5Z" stroke="#00B0FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 11V15M12 11L14 13M12 11L10 13" stroke="#00B0FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 15H14" stroke="#00B0FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="header-title">Add Material Record</span>
                    </div>

                    <div className="header-right-actions">
                        <div className="file-drop-area-small">
                            <span className="drop-text">Choose file or drag and drop...</span>
                        </div>

                        <div className="custom-select-wrapper" style={{ position: 'relative' }} ref={emptyCategoryRef}>
                            <div
                                className={`category-select-wrapper ${isEmptyCategoryDropdownOpen ? 'active' : ''}`}
                                onClick={() => setIsEmptyCategoryDropdownOpen(!isEmptyCategoryDropdownOpen)}
                            >
                                <span>{emptyStateCategory}</span>
                            </div>
                            {isEmptyCategoryDropdownOpen && (
                                <div className="custom-dropdown-menu" style={{ top: 'calc(100% + 4px)', minWidth: '220px' }}>
                                    {['Structure/Equipment', 'Operationally Generated', 'Stores', 'Non-Hazardous'].map(option => (
                                        <div
                                            key={option}
                                            className={`custom-dropdown-item ${emptyStateCategory === option ? 'active' : ''}`}
                                            onClick={() => {
                                                setEmptyStateCategory(option);
                                                setIsEmptyCategoryDropdownOpen(false);
                                            }}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button className="add-material-btn-small">
                            <div className="upload-icon-small">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M12 19V5M12 5L5 12M12 5L19 12" />
                                </svg>
                            </div>
                            Add Material
                        </button>
                    </div>
                </div>

                {/* Main Empty Content */}
                <div className="empty-state-body">
                    <div className="empty-icon-large">
                        <Package size={48} strokeWidth={1} />
                    </div>
                    <h2>No Material Records Found</h2>
                    <p>
                        Start building your inventory by uploading your first<br />
                        material record. All entries will be displayed here once<br />
                        added.
                    </p>
                    <div className="empty-actions-center">
                        <button className="btn-create-large">
                            <Plus size={18} strokeWidth={3} /> Create First Record
                        </button>
                        <button className="btn-import-large">
                            Import CSV
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="empty-state-footer">
                    <span className="footer-text">SHOWING 0 OF 0 RECORDS</span>
                    <div className="footer-pagination">
                        <button className="page-arrow disabled"><ChevronLeft size={14} /></button>
                        <button className="page-arrow disabled"><ChevronRight size={14} /></button>
                    </div>
                </div>
            </div>
        );
    }

    // Unified data source: mockData + localStorage (for real-time sync with mapping page)
    const allAvailableMaterials = useMemo(() => {
        // Read from mock data
        const baseMaterials = mockMaterials.map(m => ({
            ...m,
            vesselId: m.vesselId || (m.zone?.includes('Deck') ? '1' : '2') // Assign mock vessel IDs
        }));

        // Read from localStorage (saved from HazardousMaterialMapping)
        const savedInventoryRaw = localStorage.getItem(`vessel_inventory_${vesselName}`);
        const savedInventory: Material[] = savedInventoryRaw ? JSON.parse(savedInventoryRaw) : [];

        // NEW: Read from deck-specific localStorages to sync with mapping page
        const deckInventories: Material[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(`inventory_${vesselName}_`)) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '[]');
                    const sectionName = key.replace(`inventory_${vesselName}_`, '');
                    deckInventories.push(...data.map((m: any) => ({
                        id: m.id,
                        name: m.name,
                        vesselId: vesselIdMap[vesselName] || '1',
                        ihmPart: m.ihmPart || 'PART I',
                        category: (m.hmStatus && m.hmStatus.toLowerCase() === 'chm') ? 'hazard' : 'warning',
                        completion: 100,
                        status: 'Mapped',
                        poNo: m.shipPO || '',
                        zone: sectionName,
                        materialName: m.material,
                        equipment: m.equipment,
                        compartment: m.compartment
                    })));
                } catch (e) {
                    console.error("Failed to parse deck inventory:", e);
                }
            }
        }

        // Combine both sources
        return [...baseMaterials, ...savedInventory, ...deckInventories];
    }, [vesselName, refreshTrigger]);

    // Map vessel name to a mock ID if necessary
    const vesselIdMap: Record<string, string> = {
        'MV Ocean Pioneer': '1',
        'ACOSTA': '2',
        'AFIF': '3',
        'PACIFIC HORIZON': '4'
    };

    // Calculate Dynamic Counts based on current vessel
    const vesselSpecificMaterials = useMemo(() => {
        return allAvailableMaterials.filter(m => {
            // If it's from localStorage, it might already be filtered by vesselName in the key.
            // If it's mock data, we check vesselIdMap or just use vesselName if available.
            return vesselIdMap[vesselName] === m.vesselId || m.id.startsWith('MAPPED-');
        });
    }, [allAvailableMaterials, vesselName]);

    const counts = useMemo(() => {
        return {
            all: vesselSpecificMaterials.length,
            part1: vesselSpecificMaterials.filter(m => m.ihmPart === 'PART I').length,
            part2: vesselSpecificMaterials.filter(m => m.ihmPart === 'PART II').length,
            part3: vesselSpecificMaterials.filter(m => m.ihmPart === 'PART III').length,
            nonHaz: vesselSpecificMaterials.filter(m => m.category === 'safe' || m.thresholdMessage === 'Non-Hazardous').length,
            archived: 0
        };
    }, [vesselSpecificMaterials]);

    const filteredMaterials = vesselSpecificMaterials.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.id.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesTag = true;
        if (activeTag !== 'All') {
            if (activeTag === 'Part I') matchesTag = m.ihmPart === 'PART I';
            else if (activeTag === 'Part II') matchesTag = m.ihmPart === 'PART II';
            else if (activeTag === 'Part III') matchesTag = m.ihmPart === 'PART III';
            else if (activeTag === 'Non-Hazardous') matchesTag = m.category === 'safe' || m.thresholdMessage === 'Non-Hazardous';
            else if (activeTag === 'Archived') matchesTag = false;
        }

        let matchesRisk = true;
        if (riskFilter !== 'Risk Level') {
            if (riskFilter === 'High') matchesRisk = m.category === 'hazard';
            else if (riskFilter === 'Medium') matchesRisk = m.category === 'warning';
            else if (riskFilter === 'Low') matchesRisk = m.category === 'safe';
        }

        let matchesCompliance = true;
        if (complianceFilter !== 'Compliance Status') {
            const isCompliant = m.status === 'Certified' || m.status === 'Verified';
            if (complianceFilter === 'Compliant') matchesCompliance = isCompliant;
            else if (complianceFilter === 'Non-Compliant') matchesCompliance = !isCompliant;
        }

        // Side Panel Filters
        let matchesPartFilter = true;
        if (selectedParts.length > 0) {
            matchesPartFilter = selectedParts.some(p => {
                const normalizedPart = p.split(':')[0].trim().toUpperCase();
                return m.ihmPart.toUpperCase() === normalizedPart;
            });
        }

        let matchesZone = true;
        if (selectedZones.length > 0) {
            matchesZone = m.zone ? selectedZones.includes(m.zone) : false;
        }

        let matchesThreshold = true;
        if (m.thresholdValue !== undefined) {
            matchesThreshold = m.thresholdValue >= thresholdMin && m.thresholdValue <= thresholdMax;
        }

        return matchesSearch && matchesTag && matchesRisk && matchesCompliance && matchesPartFilter && matchesZone && matchesThreshold;
    });

    const displayedMaterials = filteredMaterials.slice(0, visibleCount);

    const handleEditClick = (material: Material) => {
        // Redirect to mapping page with the selected material ID and vessel
        // Defaulting to material.zone as section name if available
        const deckName = material.zone || 'A-DECK 01';
        navigate(`/mapping?matId=${material.id}&vessel=${vesselName}&name=${deckName}`);
    };

    const handleSaveUpdate = () => {
        setIsEditing(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
    };

    return (
        <div className="materials-container">
            {showToast && (
                <div className="toast-notification">
                    <div className="toast-icon">
                        <CheckCircle size={20} />
                    </div>
                    <div className="toast-content">
                        <h4>Material Record Updated</h4>
                        <p>The changes for {editName} have been successfully saved to the registry</p>
                    </div>
                    <button className="toast-undo" onClick={() => setShowToast(false)}>Undo</button>
                    <X size={18} className="toast-close" onClick={() => setShowToast(false)} style={{ cursor: 'pointer', marginLeft: '12px', opacity: 0.6 }} />
                </div>
            )}

            <div className="materials-header">
                <div className="materials-filters">
                    <div className="search-field">
                        <Search size={18} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search by material name, CAS, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="custom-select-wrapper" style={{ position: 'relative' }} ref={riskRef}>
                        <div
                            className={`filter-dropdown ${isRiskDropdownOpen ? 'active' : ''}`}
                            onClick={() => setIsRiskDropdownOpen(!isRiskDropdownOpen)}
                        >
                            {riskFilter}
                        </div>
                        {isRiskDropdownOpen && (
                            <div className="custom-dropdown-menu">
                                {['Risk Level', 'High', 'Medium', 'Low'].map(option => (
                                    <div
                                        key={option}
                                        className={`custom-dropdown-item ${riskFilter === option ? 'active' : ''}`}
                                        onClick={() => {
                                            setRiskFilter(option);
                                            setIsRiskDropdownOpen(false);
                                        }}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="custom-select-wrapper" style={{ position: 'relative' }} ref={complianceRef}>
                        <div
                            className={`filter-dropdown ${isComplianceDropdownOpen ? 'active' : ''}`}
                            onClick={() => setIsComplianceDropdownOpen(!isComplianceDropdownOpen)}
                        >
                            {complianceFilter}
                        </div>
                        {isComplianceDropdownOpen && (
                            <div className="custom-dropdown-menu">
                                {['Compliance Status', 'Compliant', 'Non-Compliant'].map(option => (
                                    <div
                                        key={option}
                                        className={`custom-dropdown-item ${complianceFilter === option ? 'active' : ''}`}
                                        onClick={() => {
                                            setComplianceFilter(option);
                                            setIsComplianceDropdownOpen(false);
                                        }}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        className={`filter-btn-icon ${isFilterPanelOpen ? 'active' : ''}`}
                        onClick={() => {
                            const newState = !isFilterPanelOpen;
                            setIsFilterPanelOpen(newState);
                            if (newState) setSelectedMaterialId(null);
                        }}
                    >
                        <Filter size={18} />
                    </button>

                    <button className="export-record-btn-top" style={{ marginLeft: '4px' }}>
                        <Download size={16} /> Export Record
                    </button>
                </div>
            </div>

            {/* Active Filters Row (Dynamic) */}
            {
                (thresholdMin > 0 || thresholdMax < 1.0 || selectedParts.length > 0 || selectedZones.length > 0) && (
                    <div className="active-filters-row">
                        <div className="active-chips-container">
                            {thresholdMin > 0 || thresholdMax < 1.0 ? (
                                <div className="filter-chip">
                                    <span>Threshold: {thresholdMin.toFixed(2)}%-{thresholdMax.toFixed(2)}%</span>
                                    <X size={12} onClick={() => { setThresholdMin(0); setThresholdMax(1.0); }} />
                                </div>
                            ) : null}

                            {selectedParts.map(part => (
                                <div className="filter-chip" key={part}>
                                    <span>{part}</span>
                                    <X size={12} onClick={() => setSelectedParts(selectedParts.filter(p => p !== part))} />
                                </div>
                            ))}

                            {selectedZones.map(zone => (
                                <div className="filter-chip" key={zone}>
                                    <span>{zone}</span>
                                    <X size={12} onClick={() => setSelectedZones(selectedZones.filter(z => z !== zone))} />
                                </div>
                            ))}
                            <span className="results-count-text">Showing {filteredMaterials.length} results</span>
                        </div>
                        <div className="clear-all-link" onClick={() => {
                            setThresholdMin(0); setThresholdMax(1.0);
                            setSelectedParts([]);
                            setSelectedZones([]);
                        }}>
                            Clear All
                        </div>
                    </div>
                )
            }

            {/* Category Pills Row (Static Selection) */}
            <div className="category-tabs-row">
                {[
                    { label: 'All Materials', count: counts.all, key: 'All' },
                    { label: 'Part I', count: counts.part1, key: 'Part I' },
                    { label: 'Part II', count: counts.part2, key: 'Part II' },
                    { label: 'Part III', count: counts.part3, key: 'Part III' },
                    { label: 'Non-Hazardous', count: counts.nonHaz, key: 'Non-Hazardous' },
                    { label: 'Archived', count: counts.archived, key: 'Archived' }
                ].map(tab => (
                    <div
                        key={tab.key}
                        className={`category-tab ${activeTag === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTag(tab.key)}
                    >
                        {tab.label} ({tab.count})
                    </div>
                ))}
            </div>

            <div className={`materials-list-container ${selectedMaterialId ? '' : ''}`}>
                <div className="materials-content-wrapper">
                    <div className={`materials-list-pane ${selectedMaterialId ? 'shrunk' : ''}`}>
                        {/* Top Scrollbar Dummy */}
                        <div
                            ref={topScrollRef}
                            style={{
                                overflowX: 'auto',
                                overflowY: 'hidden',
                                height: '10px',
                                width: '100%',
                                borderBottom: '1px solid var(--border-color)',
                                background: 'white'
                            }}
                        >
                            <div style={{ width: '1600px', height: '1px' }}></div>
                        </div>

                        <div className="materials-table-wrapper" ref={tableContainerRef}>
                            <table className="materials-table">
                                <thead>
                                    <tr>
                                        <th style={{ minWidth: '280px' }}>SUBSTANCE DETAILS</th>
                                        <th style={{ minWidth: '100px' }}>DECK</th>
                                        <th style={{ minWidth: '120px' }}>PO NO</th>
                                        <th style={{ minWidth: '180px' }}>COMPONENT</th>
                                        <th style={{ minWidth: '100px', textAlign: 'center' }}>HAZMAT</th>
                                        <th style={{ minWidth: '220px' }}>MATERIAL</th>
                                        <th style={{ minWidth: '220px' }}>EQUIPMENT</th>
                                        <th style={{ minWidth: '100px' }}>IHM PART</th>
                                        <th style={{ minWidth: '160px' }}>COMPLIANCE STATUS</th>
                                        <th style={{ minWidth: '180px' }}>THRESHOLD INFO</th>
                                        <th className="sticky-col" style={{ width: '80px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedMaterials.map(item => (
                                        <tr
                                            key={item.id}
                                            onClick={() => {
                                                setSelectedMaterialId(item.id);
                                                setIsFilterPanelOpen(false);
                                            }}
                                            className={selectedMaterialId === item.id ? 'active-row' : ''}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td>
                                                <div className="substance-cell">
                                                    <div className={`substance-icon ${item.category}`}>
                                                        {item.category === 'hazard' && <AlertCircle size={20} />}
                                                        {item.category === 'safe' && <Database size={20} />}
                                                        {item.category === 'warning' && <Package size={20} />}
                                                    </div>
                                                    <div className="substance-info">
                                                        <h4>{item.name}</h4>
                                                        <span className="substance-id">ID: {item.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="deck-cell">{item.zone || '-'}</td>
                                            <td className="po-cell">{item.poNo || '-'}</td>
                                            <td className="component-cell">{item.component || '-'}</td>
                                            <td className="hazmat-cell" style={{ textAlign: 'center' }}>
                                                {item.hazardType && (
                                                    <span className="hazmat-text-only">
                                                        {item.hazardType}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="material-cell">{item.materialName || item.name}</td>
                                            <td className="equipment-cell">{item.equipment || '-'}</td>
                                            <td>
                                                <span className="part-badge">{item.ihmPart}</span>
                                            </td>
                                            <td className="compliance-cell">
                                                <div className={`status-badge-text ${item.status === 'Certified' || item.status === 'Verified' ? 'certified' : item.status === 'Pending Survey' ? 'pending' : 'in-progress'}`}>
                                                    {item.status}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`threshold-text ${item.thresholdType}`}>
                                                    {item.thresholdMessage}
                                                </span>
                                            </td>
                                            <td className="sticky-col">
                                                <div className="action-arrow">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Load More Footer within List Pane */}
                            <div style={{
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                borderTop: '1px solid #f1f5f9'
                            }}>
                                <span style={{ fontSize: '13px', color: '#64748B' }}>
                                    Showing {displayedMaterials.length} of {filteredMaterials.length} results
                                </span>
                                {displayedMaterials.length < filteredMaterials.length && (
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 10)}
                                        style={{
                                            background: '#0F172A',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 24px',
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        Load More <ChevronDown size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {selectedMaterialId && (
                        <div className="materials-details-pane">
                            <div className="details-panel-header">
                                <h2 style={{ fontSize: isEditing ? '16px' : '20px', textTransform: isEditing ? 'uppercase' : 'none', letterSpacing: isEditing ? '0.05em' : 'normal' }}>
                                    {isEditing ? 'Edit Material Details' : mockMaterials.find(m => m.id === selectedMaterialId)?.name}
                                </h2>
                                {!isEditing && (
                                    <div className="po-badge">
                                        <Package size={14} />
                                        <span>PO: {vesselSpecificMaterials.find(m => m.id === selectedMaterialId)?.poNo || 'N/A'}</span>
                                    </div>
                                )}
                                <button className="close-panel-btn" onClick={() => { setSelectedMaterialId(null); setIsEditing(false); }}>
                                    <X size={20} />
                                </button>
                            </div>

                            {isEditing ? (
                                <div className="edit-mode-container" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <div className="details-section" style={{ flex: 1 }}>
                                        <div className="edit-form-group">
                                            <label>MATERIAL NAME</label>
                                            <input
                                                type="text"
                                                className="edit-form-input"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div className="edit-form-group">
                                                <label>PO NUMBER</label>
                                                <input
                                                    type="text"
                                                    className="edit-form-input"
                                                    value={editPO}
                                                    onChange={(e) => setEditPO(e.target.value)}
                                                />
                                            </div>
                                            <div className="edit-form-group">
                                                <label>RISK LEVEL</label>
                                                <div className="edit-risk-select">
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div className="risk-dot"></div> {editRisk}
                                                    </span>
                                                    <ChevronDown size={16} color="#94a3b8" />
                                                </div>
                                            </div>
                                        </div>

                                        <h3 style={{ marginTop: '24px' }}>THRESHOLD MONITORING <span className="critical-badge">CRITICAL</span></h3>
                                        <div className="monitoring-visual-row" style={{ marginTop: '16px' }}>
                                            <div className="circular-dial-container">
                                                <div className="circular-ring">
                                                    <div className="circular-inner">110%</div>
                                                </div>
                                            </div>
                                            <div className="monitoring-stats">
                                                <div className="stat-label">CURRENT VALUE (MG/KG)</div>
                                                <div className="stat-value" style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', fontSize: '18px' }}>
                                                    1.1
                                                </div>
                                            </div>
                                        </div>

                                        <div className="monitoring-progress-bar">
                                            <div className="monitoring-fill" style={{ width: '100%' }}></div>
                                        </div>

                                        <div className="secondary-substances-grid">
                                            <div className="sec-sub-card">
                                                <div className="sec-sub-header">
                                                    <span className="sec-sub-name">SUBSTANCE A</span>
                                                    <CheckCircle size={14} color="#10b981" />
                                                </div>
                                                <div className="sec-sub-bar"><div className="sec-sub-fill" style={{ width: '40%', background: '#10b981' }}></div></div>
                                                <div className="sec-sub-val">0.2 / 2.0 <span style={{ fontSize: '10px', color: '#64748b' }}>mg/kg</span></div>
                                            </div>
                                            <div className="sec-sub-card">
                                                <div className="sec-sub-header">
                                                    <span className="sec-sub-name">SUBSTANCE B</span>
                                                    <AlertCircle size={14} color="#f59e0b" />
                                                </div>
                                                <div className="sec-sub-bar"><div className="sec-sub-fill" style={{ width: '85%', background: '#f59e0b' }}></div></div>
                                                <div className="sec-sub-val">0.85 / 1.0 <span style={{ fontSize: '10px', color: '#64748b' }}>mg/kg</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="edit-footer">
                                        <button className="cancel-btn-outline" onClick={() => setIsEditing(false)}>CANCEL</button>
                                        <button className="save-btn-primary" onClick={handleSaveUpdate}>
                                            <Database size={18} /> SAVE CHANGES
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="view-mode-container">
                                    <div className="details-section">
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '4px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div>
                                            SUBSTANCE INFORMATION
                                        </h3>
                                        <div className="substance-info-grid">
                                            <div className="substance-info-card">
                                                <label>MATERIAL NAME</label>
                                                <span>{mockMaterials.find(m => m.id === selectedMaterialId)?.name}</span>
                                            </div>
                                            <div className="substance-info-card">
                                                <label>PO NUMBER</label>
                                                <span>{vesselSpecificMaterials.find(m => m.id === selectedMaterialId)?.poNo || 'N/A'}</span>
                                            </div>
                                            <div className="substance-info-card risk-card">
                                                <label>RISK LEVEL</label>
                                                <span><div className="risk-dot"></div> High Risk</span>
                                            </div>
                                            <div className="substance-info-card">
                                                <label>LAST UPDATE</label>
                                                <span>12 Oct 2023</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="details-section">
                                        <div className="monitoring-header">
                                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                                <div style={{ width: '4px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div>
                                                THRESHOLD MONITORING
                                            </h3>
                                            <span className="critical-badge">CRITICAL LIMIT</span>
                                        </div>

                                        <div className="monitoring-visual-row">
                                            <div className="circular-dial-container">
                                                <div className="circular-ring">
                                                    <div className="circular-inner">110%</div>
                                                </div>
                                            </div>
                                            <div className="monitoring-stats">
                                                <div className="stat-label">CURRENT VALUE</div>
                                                <div className="stat-value">1.1 <span className="stat-unit">mg/kg</span></div>
                                            </div>
                                            <div className="monitoring-stats">
                                                <div className="stat-label">REGULATORY LIMIT</div>
                                                <div className="stat-value">1.0 <span className="stat-unit">mg/kg</span></div>
                                            </div>
                                        </div>

                                        <div className="monitoring-progress-bar">
                                            <div className="monitoring-fill" style={{ width: '100%' }}></div>
                                        </div>

                                        <div className="monitoring-metadata">
                                            <div className="reg-ref">
                                                <AlertCircle size={14} /> Regulation Ref: <strong>HKC / EU SRR Appendix 1</strong>
                                            </div>
                                            <div className="compliance-status-marker">
                                                <AlertCircle size={14} /> NON-COMPLIANT
                                            </div>
                                        </div>

                                        <div className="secondary-substances-grid">
                                            <div className="sec-sub-card">
                                                <div className="sec-sub-header">
                                                    <span className="sec-sub-name">SUBSTANCE A</span>
                                                    <span className="sec-status-pill safe-pill">Safe</span>
                                                </div>
                                                <div className="sec-sub-val">0.2 / 2.0 <span style={{ fontSize: '10px', color: '#64748b' }}>mg/kg</span></div>
                                                <div className="sec-sub-bar"><div className="sec-sub-fill" style={{ width: '40%', background: '#10b981' }}></div></div>
                                            </div>
                                            <div className="sec-sub-card">
                                                <div className="sec-sub-header">
                                                    <span className="sec-sub-name">SUBSTANCE B</span>
                                                    <span className="sec-status-pill warning-pill">Warning</span>
                                                </div>
                                                <div className="sec-sub-val">0.85 / 1.0 <span style={{ fontSize: '10px', color: '#64748b' }}>mg/kg</span></div>
                                                <div className="sec-sub-bar"><div className="sec-sub-fill" style={{ width: '85%', background: '#f59e0b' }}></div></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="details-section">
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '4px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div>
                                            LAB DOCUMENTATION
                                        </h3>
                                        <div className="doc-list-item">
                                            <div className="doc-info">
                                                <FileText size={18} color="#ef4444" />
                                                <span className="doc-name">Lab-Report-092.pdf</span>
                                            </div>
                                            <a href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" target="_blank" rel="noopener noreferrer" className="doc-external-link"><ExternalLink size={16} /></a>
                                        </div>
                                    </div>

                                    <div className="panel-footer">
                                        <button className="edit-details-btn-full" onClick={() => handleEditClick(mockMaterials.find(m => m.id === selectedMaterialId)!)}>EDIT MATERIAL DETAILS</button>
                                        <button className="more-options-btn"><MoreVertical size={18} /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Filter Side Panel */}
                    {isFilterPanelOpen && (
                        <div className="filter-side-panel">
                            <div className="filter-panel-header">
                                <h2>Refine Materials</h2>
                                <button className="close-filter-btn" onClick={() => setIsFilterPanelOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="filter-scroll-content">
                                <div className="filter-group">
                                    <div className="filter-label-row">
                                        <label>THRESHOLD RANGE (%)</label>
                                        <div className="range-badges">
                                            <span className="badge-dark">{thresholdMin.toFixed(2)}%</span>
                                            <span className="badge-dark">{thresholdMax.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                    <div className="range-slider-mock" style={{ padding: '0 8px' }}>
                                        {/* Simple dual range slider using two inputs */}
                                        <div className="dual-slider-container" style={{ position: 'relative', height: '40px', width: '100%' }}>
                                            <div className="slider-track-bg" style={{
                                                position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 0, right: 0, height: '4px', background: '#E2E8F0', borderRadius: '2px'
                                            }} />
                                            <div className="slider-track-fill" style={{
                                                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                                                left: `${(thresholdMin / 1.0) * 100}%`,
                                                width: `${((thresholdMax - thresholdMin) / 1.0) * 100}%`,
                                                height: '4px', background: '#3B82F6', borderRadius: '2px'
                                            }} />
                                            <input
                                                type="range"
                                                min="0" max="1.0" step="0.01"
                                                value={thresholdMin}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (val < thresholdMax) setThresholdMin(val);
                                                }}
                                                style={{
                                                    position: 'absolute', top: '0', height: '100%', width: '100%',
                                                    pointerEvents: 'none', appearance: 'none', background: 'transparent', zIndex: 10, margin: 0
                                                }}
                                                className="thumb-input"
                                            />
                                            <input
                                                type="range"
                                                min="0" max="1.0" step="0.01"
                                                value={thresholdMax}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (val > thresholdMin) setThresholdMax(val);
                                                }}
                                                style={{
                                                    position: 'absolute', top: '0', height: '100%', width: '100%',
                                                    pointerEvents: 'none', appearance: 'none', background: 'transparent', zIndex: 11, margin: 0
                                                }}
                                                className="thumb-input"
                                            />
                                        </div>
                                        <style>{`
                                            .thumb-input::-webkit-slider-thumb {
                                                pointer-events: auto;
                                                appearance: none;
                                                width: 16px;
                                                height: 16px;
                                                background: white;
                                                border: 2px solid #3B82F6;
                                                border-radius: 50%;
                                                cursor: pointer;
                                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                                                position: relative;
                                                z-index: 20;
                                            }
                                        `}</style>
                                        <div className="range-labels-bottom">
                                            <span>Min (0%)</span>
                                            <span>Max (1.0%)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <label>IHM PART CLASSIFICATION</label>
                                    <div className="checkbox-group">
                                        {['Part I: Structure/Equipment', 'Part II: Operationally Generated', 'Part III: Stores'].map(p => {
                                            const key = p.split(':')[0].trim(); // "Part I"
                                            const isChecked = selectedParts.includes(key);
                                            return (
                                                <div
                                                    key={p}
                                                    className={`checkbox-item ${isChecked ? 'active' : ''}`}
                                                    onClick={() => {
                                                        if (isChecked) setSelectedParts(selectedParts.filter(i => i !== key));
                                                        else setSelectedParts([...selectedParts, key]);
                                                    }}
                                                >
                                                    <div className={`custom-checkbox ${isChecked ? 'checked' : ''}`}>
                                                        {isChecked && <CheckCircle size={10} color="white" />}
                                                    </div>
                                                    <span>{p}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <label>VESSEL ZONE</label>
                                    <div className="zone-grid">
                                        {['Engine Room', 'Deck', 'Pump Room', 'Hull', 'Accomodation'].map(zone => (
                                            <button
                                                key={zone}
                                                className={`zone-btn ${selectedZones.includes(zone) ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (selectedZones.includes(zone)) setSelectedZones(selectedZones.filter(z => z !== zone));
                                                    else setSelectedZones([...selectedZones, zone]);
                                                }}
                                            >
                                                {zone}
                                            </button>
                                        ))}
                                        <button className="zone-btn">+3 More</button>
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <label>CHEMICAL GROUP</label>
                                    <div className="select-input-mock">
                                        <span>{selectedChemicalGroup}</span>
                                        <MoreVertical size={16} style={{ transform: 'rotate(90deg)' }} />
                                    </div>
                                </div>
                            </div>

                            <div className="filter-panel-footer">
                                <button className="apply-filters-btn" onClick={() => setIsFilterPanelOpen(false)}>Apply Filters</button>
                                <button className="reset-filters-btn" onClick={() => {
                                    setThresholdMin(0.0);
                                    setThresholdMax(1.0);
                                    setSelectedParts([]);
                                    setSelectedZones([]);
                                    setSelectedChemicalGroup('All Chemical Groups');
                                }}>RESET TO DEFAULT</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
