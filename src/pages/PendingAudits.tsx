import { useState, useEffect, useCallback } from 'react';
import './PendingAudits.css';
import './AuditEditor.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Search, ChevronDown, Download, Edit2, Send, Trash2, X, CheckCircle2, XCircle } from 'lucide-react';

interface AuditRecord {
    imoNumber: string;
    vesselName: string;
    totalPO: number;
    totalItems: number;
    duplicatePO: number;
    duplicateSupplierCode: number;
    duplicateProduct: number;
    createDate: string;
    status?: 'PENDING REVIEW';
}

interface AuditEditorProps {
    imo: string;
    vesselName: string;
    onClose: () => void;
    onSave: (newSummary: Partial<AuditRecord>) => void;
}

const AuditEditorOverlay = ({ imo, onClose, onSave }: AuditEditorProps) => {
    const [data, setData] = useState<any[][]>([]);
    const [visibleColumns, setVisibleColumns] = useState<boolean[]>([]);
    const [poColIdx, setPoColIdx] = useState<number | null>(null);
    const [rowActions, setRowActions] = useState<Record<number, string>>({});
    const [currentDupGroupIdx, setCurrentDupGroupIdx] = useState(0);
    const [, setHistory] = useState<{ data: any[][]; actions: Record<number, string> }[]>([]);

    useEffect(() => {
        const rows = localStorage.getItem(`audit_rows_${imo}`);
        const mapping = localStorage.getItem(`audit_mapping_${imo}`);
        if (rows) {
            const parsedData = JSON.parse(rows);
            setData(parsedData);
            if (mapping) {
                const parsedMapping = JSON.parse(mapping);
                if (parsedMapping.poNumber) setPoColIdx(parseInt(parsedMapping.poNumber));
            }

            const savedVisibility = localStorage.getItem(`audit_visible_cols_${imo}`);
            if (savedVisibility) {
                const parsedVis = JSON.parse(savedVisibility);
                if (parsedVis.length === parsedData[0]?.length) {
                    setVisibleColumns(parsedVis);
                } else {
                    setVisibleColumns(new Array(parsedData[0]?.length || 0).fill(true));
                }
            } else {
                setVisibleColumns(new Array(parsedData[0]?.length || 0).fill(true));
            }
        }
    }, [imo]);

    const [isDragging, setIsDragging] = useState(false);
    const [dragStartValue, setDragStartValue] = useState('');
    const [dragStartCi, setDragStartCi] = useState<number | null>(null);

    // Robust Undo Logic
    const performUndo = useCallback(() => {
        setHistory(prevHistory => {
            if (prevHistory.length === 0) return prevHistory;
            const lastState = prevHistory[prevHistory.length - 1];
            setData(lastState.data);
            setRowActions(lastState.actions);
            return prevHistory.slice(0, -1);
        });
    }, []);

    // Global Key Listener for Ctrl+Z
    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                performUndo();
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [performUndo]);

    // Handle Global Mouse Up for Dragging
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                setDragStartCi(null);
            }
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isDragging]);

    const duplicateGroups = (() => {
        if (poColIdx === null || data.length <= 1) return [];
        const counts: Record<string, number[]> = {};
        data.slice(1).forEach((row, idx) => {
            const originalIdx = idx + 1;
            const action = rowActions[originalIdx];
            if (action === 'D' || action === 'R') return;

            const po = String(row[poColIdx!] || '').trim();
            if (!po) return;
            if (!counts[po]) counts[po] = [];
            counts[po].push(originalIdx);
        });

        return Object.values(counts)
            .filter(indices => indices.length > 1)
            .map(indices => indices.map(i => ({ row: data[i], originalIdx: i })));
    })();

    const pushToHistory = useCallback(() => {
        setHistory(prev => {
            const snapshot = {
                data: JSON.parse(JSON.stringify(data)),
                actions: { ...rowActions }
            };
            return [...prev.slice(-49), snapshot];
        });
    }, [data, rowActions]);

    const handleUpdateCell = (originalIdx: number, ci: number, val: string) => {
        setData(prevData => {
            const newData = JSON.parse(JSON.stringify(prevData));
            newData[originalIdx][ci] = val;
            return newData;
        });
    };

    // --- Drag-to-Fill Logic ---
    const handleCellMouseDown = (val: string, ci: number) => {
        pushToHistory();
        setIsDragging(true);
        setDragStartValue(val);
        setDragStartCi(ci);
    };

    const handleCellMouseEnter = (originalIdx: number, ci: number) => {
        if (isDragging && dragStartCi === ci) {
            setData(prevData => {
                const newData = JSON.parse(JSON.stringify(prevData));
                newData[originalIdx][ci] = dragStartValue;
                return newData;
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, ri: number, ci: number) => {
        if ((e.ctrlKey || e.metaKey) && ['v', 'c', 'a', 'V', 'C', 'A'].includes(e.key)) {
            return;
        }

        const rowCount = currentGroup.length;
        const colIndices = visibleColumns.map((v, i) => v ? i : -1).filter(v => v !== -1);
        const colPos = colIndices.indexOf(ci);

        let nextRi = ri;
        let nextCiPos = colPos;

        if (e.key === 'ArrowDown') {
            nextRi = Math.min(ri + 1, rowCount - 1);
        } else if (e.key === 'ArrowUp') {
            nextRi = Math.max(ri - 1, 0);
        } else if (e.key === 'ArrowRight' && (e.target as HTMLInputElement).selectionEnd === (e.target as HTMLInputElement).value.length) {
            nextCiPos = Math.min(colPos + 1, colIndices.length - 1);
        } else if (e.key === 'ArrowLeft' && (e.target as HTMLInputElement).selectionStart === 0) {
            nextCiPos = Math.max(colPos - 1, 0);
        } else if (e.key === 'Enter') {
            nextRi = Math.min(ri + 1, rowCount - 1);
        } else if (e.key === 'Tab') {
            if (e.shiftKey) {
                nextCiPos = Math.max(colPos - 1, 0);
            } else {
                nextCiPos = Math.min(colPos + 1, colIndices.length - 1);
            }
        } else {
            return;
        }

        if (nextRi !== ri || nextCiPos !== colPos) {
            e.preventDefault();
            const nextCi = colIndices[nextCiPos];
            const nextInput = document.querySelector(`input[data-ri="${nextRi}"][data-ci="${nextCi}"]`) as HTMLInputElement;
            if (nextInput) {
                nextInput.focus();
                setTimeout(() => nextInput.select(), 0);
            }
        }
    };

    const setRowAction = (originalIdx: number, action: string) => {
        pushToHistory();
        setRowActions(prev => ({ ...prev, [originalIdx]: action }));
    };

    const applyActionToGroup = (action: string) => {
        const group = duplicateGroups[currentDupGroupIdx];
        if (!group) return;

        pushToHistory();
        setRowActions(prevActions => {
            const updates = { ...prevActions };
            if (action === 'DI') {
                group.forEach((item, idx) => {
                    updates[item.originalIdx] = idx === 0 ? 'DI' : 'D';
                });
                if (currentDupGroupIdx >= duplicateGroups.length - 1 && currentDupGroupIdx > 0) {
                    setCurrentDupGroupIdx(p => p - 1);
                }
            } else {
                group.forEach(item => {
                    updates[item.originalIdx] = action;
                });
            }
            return updates;
        });
    };

    const handleSave = () => {
        // Filter out rows marked as D (Delete) or R (Reject)
        const filteredData = [data[0], ...data.slice(1).filter((_, i) => {
            const status = rowActions[i + 1];
            return status !== 'D' && status !== 'R';
        })];

        localStorage.setItem(`audit_rows_${imo}`, JSON.stringify(filteredData));
        localStorage.setItem(`audit_visible_cols_${imo}`, JSON.stringify(visibleColumns));

        // Recalculate summary
        let poD = 0;
        let totalPO = 0;
        if (poColIdx !== null && filteredData.length > 1) {
            const pos = filteredData.slice(1).map(r => String(r[poColIdx] || '').trim()).filter(p => p !== '');
            totalPO = new Set(pos).size;
            const counts: Record<string, number> = {};
            pos.forEach(p => counts[p] = (counts[p] || 0) + 1);
            poD = Object.values(counts).filter(c => c > 1).length;
        }

        onSave({
            totalPO,
            duplicatePO: poD,
            totalItems: filteredData.length - 1
        });
        onClose();
    };

    if (data.length === 0) return null;

    if (duplicateGroups.length === 0) {
        return (
            <div className="audit-editor-overlay">
                <div className="editor-header">
                    <h2>Audit Duplicate Purchase Orders</h2>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                    <div style={{ padding: '32px', background: '#F0FDF4', borderRadius: '50%', color: '#16A34A' }}>
                        <CheckCircle2 size={48} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '20px', color: '#1E293B', margin: '0 0 8px 0' }}>All Conflicts Resolved</h3>
                        <p style={{ color: '#64748B', fontSize: '14px' }}>There are no more duplicate POs in this file.</p>
                    </div>
                </div>
                <div className="v3-dup-footer">
                    <div />
                    <button className="v3-dup-btn close" onClick={handleSave}>Close & Update Registry</button>
                </div>
            </div>
        );
    }

    const currentGroup = duplicateGroups[currentDupGroupIdx] || [];

    return (
        <div className="audit-editor-overlay">
            <div className="editor-header">
                <h2>Audit Duplicate Purchase Orders</h2>
            </div>

            <div className="v3-dup-toolbar">
                <div className="v3-dup-columns">
                    <label>Show / Hide Columns</label>
                    <div className="v3-dup-checkboxes">
                        {data[0]?.map((col, i) => (
                            <label key={i}>
                                <input
                                    type="checkbox"
                                    checked={visibleColumns[i]}
                                    onChange={() => {
                                        const next = [...visibleColumns];
                                        next[i] = !next[i];
                                        setVisibleColumns(next);
                                    }}
                                />
                                {String(col || `Field ${i + 1}`)}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="v3-dup-nav">
                    <button
                        className="v3-dup-nav-btn"
                        onClick={() => setCurrentDupGroupIdx(p => Math.max(0, p - 1))}
                        disabled={currentDupGroupIdx === 0}
                    >
                        Previous PO
                    </button>
                    <button
                        className="v3-dup-nav-btn active"
                        onClick={() => setCurrentDupGroupIdx(p => Math.min(duplicateGroups.length - 1, p + 1))}
                        disabled={currentDupGroupIdx === duplicateGroups.length - 1}
                    >
                        Next PO
                    </button>
                    <span className="v3-dup-count">{currentDupGroupIdx + 1}/{duplicateGroups.length}</span>
                </div>
            </div>

            <p className="v3-dup-subtitle">Duplicates in Audit File:</p>

            <div className="editor-table-container">
                <table className="editor-table">
                    <thead>
                        <tr>
                            <th style={{ minWidth: '220px' }}>Action</th>
                            {data[0].map((col, i) => visibleColumns[i] && (
                                <th key={i}>{String(col)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentGroup.map(({ row, originalIdx }, ri) => (
                            <tr key={originalIdx}>
                                <td>
                                    <div className="v3-action-chips">
                                        {[
                                            { code: 'U', label: 'U' },
                                            { code: 'A', label: 'A' },
                                            { code: 'DI', label: 'D&I' },
                                            { code: 'D', label: 'D' },
                                            { code: 'R', label: 'R' },
                                            { code: 'H', label: 'H' }
                                        ].map(chip => (
                                            <span
                                                key={chip.code}
                                                className={`chip ${rowActions[originalIdx] === chip.code ? `active-${chip.code.toLowerCase()}` : ''}`}
                                                onClick={() => setRowAction(originalIdx, chip.code)}
                                            >
                                                {chip.label}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                {row.map((cell: any, ci: number) => visibleColumns[ci] && (
                                    <td key={ci}>
                                        <input
                                            type="text"
                                            className={`v3-dup-table-input ${isDragging && dragStartCi === ci ? 'is-dragging-cell' : ''}`}
                                            value={String(cell || '')}
                                            onChange={(e) => handleUpdateCell(originalIdx, ci, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, ri, ci)}
                                            onMouseDown={() => handleCellMouseDown(String(cell || ''), ci)}
                                            onMouseEnter={() => handleCellMouseEnter(originalIdx, ci)}
                                            onFocus={() => pushToHistory()}
                                            onClick={(e) => (e.target as HTMLInputElement).select()}
                                            data-ri={ri}
                                            data-ci={ci}
                                            title={String(cell || '')}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="v3-dup-footer">
                <div className="v3-dup-footer-left">
                    <button className="v3-dup-btn" onClick={() => applyActionToGroup('U')}>Update (U)</button>
                    <button className="v3-dup-btn" onClick={() => applyActionToGroup('DI')}>Delete & Insert (D&I)</button>
                    <button className="v3-dup-btn reject" onClick={() => applyActionToGroup('R')}>Reject (R)</button>
                    <button className="v3-dup-btn" onClick={() => applyActionToGroup('H')}>Hold</button>
                </div>
                <button className="v3-dup-btn close" onClick={handleSave}>Close</button>
            </div>
        </div>
    );
};

export default function PendingAudits() {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('createDate');
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const [allRecords, setAllRecords] = useState<AuditRecord[]>([]);

    useEffect(() => {
        // Initial Sample records
        const vesselNames = ['ACOSTA', 'MARAN TRITON', 'OCEAN ATLAS', 'PACIFIC ENDEAVOR', 'MAERSK SEOUL', 'EVER GIVEN', 'BLUE WHALE', 'SEA STAR', 'NAUTILUS', 'POSEIDON'];

        const initialRecords: AuditRecord[] = Array.from({ length: 39 }).map((_, idx) => ({
            imoNumber: (9571648 + idx).toString(),
            vesselName: vesselNames[idx % vesselNames.length],
            totalPO: Math.floor(Math.random() * 100) + 10,
            totalItems: Math.floor(Math.random() * 5000) + 500,
            duplicatePO: idx % 5 === 0 ? Math.floor(Math.random() * 30) : 0,
            duplicateSupplierCode: idx % 8 === 0 ? Math.floor(Math.random() * 5) : 0,
            duplicateProduct: idx % 6 === 0 ? Math.floor(Math.random() * 10) : 0,
            createDate: `2023-11-${((idx + 10) % 28) + 1}`
        }));

        const scrubRegistry = (records: AuditRecord[]) => {
            const sentToReview = JSON.parse(localStorage.getItem('sentToReview') || '[]');
            const reviewImos = new Set(sentToReview.map((r: any) => r.imoNumber));

            return records.map(r => {
                // If marked PENDING REVIEW but NOT in the reviews list, clear it
                if (r.status === 'PENDING REVIEW' && !reviewImos.has(r.imoNumber)) {
                    return { ...r, status: undefined };
                }
                return r;
            });
        };

        // Check for unified registry persistence first
        const persistedRegistry = localStorage.getItem('audit_registry_main');
        if (persistedRegistry) {
            const parsed = JSON.parse(persistedRegistry);
            const scrubbed = scrubRegistry(parsed);
            setAllRecords(scrubbed);
            localStorage.setItem('audit_registry_main', JSON.stringify(scrubbed));
        } else {
            // Check for recently added audit from UploadPurchaseOrder
            const recent = localStorage.getItem('recentlyAddedAudit');
            if (recent) {
                const parsedRecent = JSON.parse(recent);
                const combined = [parsedRecent, ...initialRecords];
                const scrubbed = scrubRegistry(combined);
                setAllRecords(scrubbed);
                localStorage.setItem('audit_registry_main', JSON.stringify(scrubbed));
            } else {
                setAllRecords(initialRecords);
            }
        }
    }, []);

    // Filtering
    const filteredRecords = allRecords.filter(r =>
        r.vesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.imoNumber.includes(searchQuery)
    );

    // Sorting Logic
    const sortedRecords = [...filteredRecords].sort((a, b) => {
        if (sortBy === 'vesselName') return a.vesselName.localeCompare(b.vesselName);
        if (sortBy === 'imoNumber') return a.imoNumber.localeCompare(b.imoNumber);
        return b.createDate.localeCompare(a.createDate); // Default Newest first
    });

    // Pagination Logic
    const totalPages = Math.ceil(sortedRecords.length / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const currentRecords = sortedRecords.slice(startIndex, startIndex + recordsPerPage);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedVessel, setSelectedVessel] = useState<AuditRecord | null>(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showDuplicateToast, setShowDuplicateToast] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingImo, setDeletingImo] = useState<string | null>(null);
    const [editingVessel, setEditingVessel] = useState<AuditRecord | null>(null);

    const handleEdit = (imoNumber: string) => {
        const record = allRecords.find(r => r.imoNumber === imoNumber);
        if (record) setEditingVessel(record);
    };

    const handleSend = (imoNumber: string) => {
        const record = allRecords.find(r => r.imoNumber === imoNumber);
        if (!record) return;

        // Check for duplicates
        if (record.duplicatePO > 0 || record.duplicateSupplierCode > 0 || record.duplicateProduct > 0) {
            setShowDuplicateToast(true);
            setTimeout(() => setShowDuplicateToast(false), 5000);
            return;
        }

        setSelectedVessel(record);
        setShowReviewModal(true);
    };

    const confirmSendReview = () => {
        if (selectedVessel) {
            const updatedList: AuditRecord[] = allRecords.map(r =>
                r.imoNumber === selectedVessel.imoNumber ? { ...r, status: 'PENDING REVIEW' as const } : r
            );
            setAllRecords(updatedList);
            localStorage.setItem('audit_registry_main', JSON.stringify(updatedList));

            // Persist to localStorage for Pending Reviews page
            const existingSent = JSON.parse(localStorage.getItem('sentToReview') || '[]');
            const newSent = {
                ...selectedVessel,
                reviewStatus: 'Pending',
                createDate: new Date().toISOString().split('T')[0], // Use current date
                assignedTo: { name: 'Unassigned', avatar: 'https://i.pravatar.cc/150?u=unassigned' }
            };
            localStorage.setItem('sentToReview', JSON.stringify([newSent, ...existingSent]));
        }
        setShowReviewModal(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);
    };

    const handleUndo = () => {
        if (selectedVessel) {
            // Update local registry state
            setAllRecords(prev => prev.map(r =>
                r.imoNumber === selectedVessel.imoNumber ? { ...r, status: undefined } : r
            ));

            // Sync the main audit registry
            const updatedMain = allRecords.map(r =>
                r.imoNumber === selectedVessel.imoNumber ? { ...r, status: undefined } : r
            );
            localStorage.setItem('audit_registry_main', JSON.stringify(updatedMain));

            // REMOVE from the Sent to Review registry
            const currentSent = JSON.parse(localStorage.getItem('sentToReview') || '[]');
            const updatedSent = currentSent.filter((r: any) => r.imoNumber !== selectedVessel.imoNumber);
            localStorage.setItem('sentToReview', JSON.stringify(updatedSent));
        }
        setShowSuccessToast(false);
    };
    const handleDelete = (imoNumber: string) => {
        setDeletingImo(imoNumber);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deletingImo) {
            setAllRecords(prev => prev.filter(r => r.imoNumber !== deletingImo));
        }
        setShowDeleteModal(false);
        setDeletingImo(null);
    };

    return (
        <div className="pending-audits-container">
            <Sidebar />
            <main className="pending-audits-main">
                <Header />

                <div className="pending-audits-content">
                    <div className="md-header">
                        <div className="md-title-area">
                            <h1>Pending Audits Registry</h1>
                            <p>Manage and review the latest audits before sending for final review.</p>
                        </div>
                    </div>

                    <div className="audits-top-bar">
                        <div className="search-box">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by IMO or Vessel Name..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <div className="top-bar-right">
                            <div className="sort-dropdown">
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="createDate">Sort by Create Date</option>
                                    <option value="vesselName">Sort by Vessel Name</option>
                                    <option value="imoNumber">Sort by IMO Number</option>
                                </select>
                                <ChevronDown size={16} className="dropdown-icon" />
                            </div>

                            <div className="active-vessels-badge">
                                <span className="badge-label">ACTIVE VESSELS</span>
                                <span className="badge-count">{filteredRecords.length} Active Cases</span>
                            </div>

                            <button className="download-btn"><Download size={18} /></button>
                        </div>
                    </div>

                    <div className="table-container">
                        <div className="table-scroll-wrapper">
                            <table className="audits-table">
                                <thead>
                                    <tr>
                                        <th>IMO NUMBER</th>
                                        <th>VESSEL NAME</th>
                                        <th>TOTAL PO</th>
                                        <th>TOTAL ITEMS</th>
                                        <th>DUPLICATE PO</th>
                                        <th>DUP. SUPPLIER CODE</th>
                                        <th>DUP. PRODUCT CODE</th>
                                        <th>CREATE DATE</th>
                                        <th className="action-column">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRecords.map((record, index) => (
                                        <tr key={record.imoNumber + index}>
                                            <td className="imo-number">{record.imoNumber}</td>
                                            <td className="vessel-name">{record.vesselName}</td>
                                            <td>{record.totalPO}</td>
                                            <td>{record.totalItems.toLocaleString()}</td>
                                            <td>
                                                <span className={`duplicate-badge ${record.duplicatePO > 0 ? 'error' : 'success'}`}>
                                                    {record.duplicatePO}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`duplicate-badge ${record.duplicateSupplierCode > 0 ? 'error' : 'success'}`}>
                                                    {record.duplicateSupplierCode}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`duplicate-badge ${record.duplicateProduct > 0 ? 'error' : 'success'}`}>
                                                    {record.duplicateProduct}
                                                </span>
                                            </td>
                                            <td>{record.createDate}</td>
                                            <td className="action-column">
                                                <div className="action-buttons">
                                                    {record.status === 'PENDING REVIEW' ? (
                                                        <div className="v3-status-badge pending">
                                                            <div className="status-dot-pulse" />
                                                            PENDING REVIEW
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {record.duplicatePO > 0 ? (
                                                                <button className="action-btn edit-btn" onClick={() => handleEdit(record.imoNumber)} title="Edit"><Edit2 size={16} /></button>
                                                            ) : (
                                                                <span className="na-status-text">NA</span>
                                                            )}
                                                            <button className="action-btn send-btn" onClick={() => handleSend(record.imoNumber)} title="Send"><Send size={16} /></button>
                                                            <button className="action-btn delete-btn" onClick={() => handleDelete(record.imoNumber)} title="Delete"><Trash2 size={16} /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="pagination">
                        <span className="pagination-info">
                            Showing {startIndex + 1} to {Math.min(startIndex + recordsPerPage, sortedRecords.length)} of {sortedRecords.length} vessel records
                        </span>
                        <div className="pagination-buttons">
                            <button className="page-btn" style={{ width: 'auto', padding: '0 12px' }} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</button>
                            {[...Array(totalPages)].map((_, idx) => {
                                const pageNum = idx + 1;
                                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                    return (
                                        <button key={pageNum} className={`page-btn ${currentPage === pageNum ? 'active' : ''}`} onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>
                                    );
                                }
                                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) return <span key={pageNum} className="pagination-dots">...</span>;
                                return null;
                            })}
                            <button className="page-btn" style={{ width: 'auto', padding: '0 12px' }} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                        </div>
                    </div>
                </div>

                {/* Send for Review Confirmation Modal */}
                {showReviewModal && (
                    <>
                        <div className="modal-backdrop-blur" onClick={() => setShowReviewModal(false)} />
                        <div className="send-review-modal">
                            <div className="send-review-header">
                                <h2>SEND FOR REVIEW</h2>
                                <button className="close-btn-white" onClick={() => setShowReviewModal(false)}><X size={18} /></button>
                            </div>
                            <div className="send-review-body">
                                <h3>Send <span className="vessel-highlight">{selectedVessel?.vesselName}</span> for final review?</h3>
                                <p>This action will lock the current audit logs and notify the Reviewing Officer.</p>
                            </div>
                            <div className="send-review-footer">
                                <button className="btn-text-cancel" onClick={() => setShowReviewModal(false)}>CANCEL</button>
                                <button className="btn-primary-send" onClick={confirmSendReview}>
                                    YES, SEND REVIEW
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Success Notification with Undo */}
                {showSuccessToast && (
                    <div className="audit-success-toast">
                        <div className="toast-content">
                            <CheckCircle2 size={18} color="#10B981" />
                            <span>Review sent successfully.</span>
                        </div>
                        <button className="undo-btn" onClick={handleUndo}>UNDO</button>
                    </div>
                )}

                {/* Duplicate Alert Notification */}
                {showDuplicateToast && (
                    <div className="audit-error-toast">
                        <div className="toast-content">
                            <XCircle size={18} color="#EF4444" />
                            <span>Cannot send for review: Duplicates detected in high priority fields.</span>
                        </div>
                        <button className="close-toast-btn" onClick={() => setShowDuplicateToast(false)}><X size={16} /></button>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <>
                        <div className="modal-backdrop-blur" onClick={() => setShowDeleteModal(false)} />
                        <div className="send-review-modal">
                            <div className="send-review-header" style={{ background: '#EF4444' }}>
                                <h2>DELETE RECORD</h2>
                                <button className="close-btn-white" onClick={() => setShowDeleteModal(false)}><X size={18} /></button>
                            </div>
                            <div className="send-review-body">
                                <h3>Delete this audit record?</h3>
                                <p>This action cannot be undone. All data associated with this vessel audit will be permanently removed.</p>
                            </div>
                            <div className="send-review-footer">
                                <button className="btn-text-cancel" onClick={() => setShowDeleteModal(false)}>CANCEL</button>
                                <button className="btn-primary-send" style={{ background: '#EF4444' }} onClick={confirmDelete}>
                                    YES, DELETE
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {editingVessel && (
                    <AuditEditorOverlay
                        imo={editingVessel.imoNumber}
                        vesselName={editingVessel.vesselName}
                        onClose={() => setEditingVessel(null)}
                        onSave={(updates) => {
                            const updatedList = allRecords.map(r =>
                                r.imoNumber === editingVessel.imoNumber ? { ...r, ...updates } : r
                            );
                            setAllRecords(updatedList);
                            localStorage.setItem('audit_registry_main', JSON.stringify(updatedList));
                        }}
                    />
                )}
            </main>
        </div>
    );
}
