import { useState, useEffect, useRef, useCallback } from 'react';
import './ReviewWizard.css';
import { ChevronDown } from 'lucide-react';

interface ReviewWizardProps {
    imo: string;
    vesselName: string;
    onClose: () => void;
    onComplete: () => void;
}

const ReviewWizard = ({ imo, vesselName, onClose, onComplete }: ReviewWizardProps) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<any[][]>([]);
    const [visibleCols, setVisibleCols] = useState<boolean[]>([]);

    // Excel-like Drag selection
    const [dragStart, setDragStart] = useState<{ r: number, c: number } | null>(null);
    const [dragEnd, setDragEnd] = useState<{ r: number, c: number } | null>(null);
    const isDragging = useRef(false);

    // Filter state
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [filters, setFilters] = useState<Record<number, string[]>>({});
    const [filterSearch, setFilterSearch] = useState('');

    // Column resizing
    const [columnWidths, setColumnWidths] = useState<number[]>([]);
    const resizingCol = useRef<{ idx: number, startX: number, startWidth: number } | null>(null);

    // Edit state
    const [editingCell, setEditingCell] = useState<{ r: number, c: number } | null>(null);

    const [, setHistory] = useState<any[][][]>([]);

    useEffect(() => {
        const rows = localStorage.getItem(`audit_rows_${imo}`);
        if (rows) {
            const parsed = JSON.parse(rows);
            setData(parsed);
            setVisibleCols(new Array(parsed[0]?.length || 0).fill(true));
            setColumnWidths(new Array(parsed[0]?.length || 0).fill(150));
        } else {
            const sampleHeaders = ['PO Number', 'Item Description', 'MD Requested Date', 'Sent Date', 'IMPA Code', 'ISSA Code', 'Issue', 'Equipment Code', 'Equipment Name', 'Maker', 'Model', 'Part Number', 'Unit', 'Quantity', 'Vendor Remark', 'Vendor Email', 'Vendor Name'];
            const sampleRows = Array.from({ length: 25 }).map((_, i) => [
                `PO - 123${456 + i}`,
                'Battery',
                '2026-02-19',
                '46072',
                'AM1234',
                '564362',
                'yes',
                'EQ-001',
                'Main Battery',
                'Exide',
                'XP - 200',
                'PN - 99',
                'PCS',
                '2',
                'Urgent',
                'supplier@example.com',
                'Global Marine Parts'
            ]);
            setData([sampleHeaders, ...sampleRows]);
            setVisibleCols(new Array(sampleHeaders.length).fill(true));
            setColumnWidths(new Array(sampleHeaders.length).fill(150));
        }
    }, [imo, vesselName]);

    const pushToHistory = useCallback(() => {
        setHistory(prev => [...prev.slice(-49), JSON.parse(JSON.stringify(data))]);
    }, [data]);

    const handleUndo = useCallback(() => {
        setHistory(prev => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            setData(last);
            return prev.slice(0, -1);
        });
    }, []);

    useEffect(() => {
        const handleGlobalKeys = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                handleUndo();
            }
        };
        window.addEventListener('keydown', handleGlobalKeys);
        return () => window.removeEventListener('keydown', handleGlobalKeys);
    }, [handleUndo]);

    const handleMouseDown = (r: number, c: number) => {
        if (editingCell) return;
        setDragStart({ r, c });
        setDragEnd({ r, c });
        isDragging.current = true;
    };

    const handleMouseEnter = (r: number, c: number) => {
        if (isDragging.current) setDragEnd({ r, c });
    };

    const handleMouseUp = () => {
        if (dragStart && dragEnd && (dragStart.r !== dragEnd.r || dragStart.c !== dragEnd.c)) {
            pushToHistory();
            const startR = Math.min(dragStart.r, dragEnd.r);
            const endR = Math.max(dragStart.r, dragEnd.r);
            const startC = Math.min(dragStart.c, dragEnd.c);
            const endC = Math.max(dragStart.c, dragEnd.c);

            // Anchor value is from the drag start cell
            const sourceValue = data[dragStart.r][dragStart.c];

            const newData = JSON.parse(JSON.stringify(data));
            for (let r = startR; r <= endR; r++) {
                for (let c = startC; c <= endC; c++) {
                    newData[r][c] = sourceValue;
                }
            }
            setData(newData);
        }
        isDragging.current = false;
        setDragStart(null);
        setDragEnd(null);
    };

    const getSelectionClass = (r: number, c: number) => {
        if (!dragStart || !dragEnd) return '';
        const startR = Math.min(dragStart.r, dragEnd.r);
        const endR = Math.max(dragStart.r, dragEnd.r);
        const startC = Math.min(dragStart.c, dragEnd.c);
        const endC = Math.max(dragStart.c, dragEnd.c);

        if (r < startR || r > endR || c < startC || c > endC) return '';

        let classes = 'selected';
        if (r === startR) classes += ' sel-top';
        if (r === endR) classes += ' sel-bottom';
        if (c === startC) classes += ' sel-left';
        if (c === endC) classes += ' sel-right';
        if (r === endR && c === endC) classes += ' sel-handle';

        return classes;
    };

    const handleResizeStart = (e: React.MouseEvent, idx: number) => {
        e.preventDefault(); e.stopPropagation();
        resizingCol.current = { idx, startX: e.pageX, startWidth: columnWidths[idx] };
        window.addEventListener('mousemove', handleResizeMove);
        window.addEventListener('mouseup', handleResizeEnd);
    };

    const handleResizeMove = (e: MouseEvent) => {
        if (!resizingCol.current) return;
        const diff = e.pageX - resizingCol.current.startX;
        const next = [...columnWidths];
        next[resizingCol.current.idx] = Math.max(50, resizingCol.current.startWidth + diff);
        setColumnWidths(next);
    };

    const handleResizeEnd = () => {
        resizingCol.current = null;
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
    };

    const handleCellDoubleClick = (r: number, c: number) => {
        setEditingCell({ r, c });
    };

    const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
        if (e.ctrlKey && e.key === ';') {
            e.preventDefault();
            const dateStr = new Date().toISOString().split('T')[0];
            const nd = [...data]; nd[r][c] = dateStr; setData(nd);
        }
        if (e.key === 'Enter') {
            setEditingCell(null);
        }
    };

    const insertColumn = (colIdx: number, direction: 'left' | 'right') => {
        const insertIdx = direction === 'left' ? colIdx : colIdx + 1;
        setData(prev => prev.map((row, i) => {
            const next = [...row]; next.splice(insertIdx, 0, i === 0 ? 'New Column' : '');
            return next;
        }));
        setVisibleCols(prev => { const next = [...prev]; next.splice(insertIdx, 0, true); return next; });
        setColumnWidths(prev => { const next = [...prev]; next.splice(insertIdx, 0, 150); return next; });
        setActiveMenu(null);
    };

    const filteredRows = data.slice(1).map((row, i) => ({ row, originalIdx: i + 1 }))
        .filter(({ row }) =>
            Object.entries(filters).every(([colIdx, activeValues]) =>
                !activeValues || activeValues.length === 0 || activeValues.includes(String(row[parseInt(colIdx)]))
            )
        );

    const nextStep = () => {
        // Persist data to localStorage on every step transition or finish
        localStorage.setItem(`audit_rows_${imo}`, JSON.stringify(data));

        if (step < 3) {
            setStep(step + 1);
        }
        else {
            onComplete();
        }
    };

    return (
        <div className="review-wizard-overlay" onMouseUp={handleMouseUp} onMouseLeave={() => isDragging.current = false}>
            {/* Header */}
            <div className="wizard-header">
                <div className={`step-item ${step >= 1 ? 'active' : ''}`} style={{ justifySelf: 'start' }}>
                    <div className="step-number">1</div>
                    <span>Adjust Data or Suppliers</span>
                </div>
                <div className={`step-item ${step >= 2 ? 'active' : ''}`} style={{ justifySelf: 'center' }}>
                    <div className="step-number">2</div>
                    <span>Supplier Product Creation</span>
                </div>
                <div className={`step-item ${step >= 3 ? 'active' : ''}`} style={{ justifySelf: 'end' }}>
                    <div className="step-number">3</div>
                    <span>Finish</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="wizard-content">
                {step === 1 && (
                    <>
                        <div className="wizard-title-row">
                            <h1>Audit Purchase Orders</h1>
                        </div>

                        {/* Toolbar — column toggles on the left, bulk buttons on the right */}
                        <div className="toolbar-container">
                            <div className="col-toggles">
                                {data[0]?.map((header, i) => (
                                    <label key={i} className="col-toggle">
                                        <input type="checkbox" checked={visibleCols[i]} onChange={() => {
                                            const n = [...visibleCols]; n[i] = !n[i]; setVisibleCols(n);
                                        }} /> {String(header)}
                                    </label>
                                ))}
                            </div>
                            {/* Bulk action buttons — right side of toolbar */}
                            <div className="bulk-actions">
                                <button className="bulk-btn accept">✓ Bulk Accept</button>
                                <button className="bulk-btn reject">✕ Bulk Reject</button>
                            </div>
                        </div>

                        {/* Main layout: scrollable table + fixed sidebar */}
                        <div className="main-layout">
                            <div className="table-section">
                                <table className="wizard-table">
                                    <thead>
                                        <tr>
                                            {data[0]?.map((header, i) => visibleCols[i] && (
                                                <th key={i} style={{ width: columnWidths[i], minWidth: columnWidths[i] }}>
                                                    <div className="header-content">
                                                        <span>{String(header)}</span>
                                                        <button className="filter-trigger" onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === i ? null : i); }}>
                                                            <ChevronDown size={12} />
                                                        </button>
                                                    </div>
                                                    <div className="resizer" onMouseDown={(e) => handleResizeStart(e, i)} />
                                                    {activeMenu === i && (
                                                        <div className="column-menu" onClick={e => e.stopPropagation()}>
                                                            <div className="menu-item" onClick={() => insertColumn(i, 'left')}>Insert column left</div>
                                                            <div className="menu-item" onClick={() => insertColumn(i, 'right')}>Insert column right</div>
                                                            <div className="menu-item" onClick={() => { const n = [...visibleCols]; n[i] = false; setVisibleCols(n); setActiveMenu(null); }}>Remove column</div>
                                                            <div className="menu-divider" />
                                                            <div className="menu-filter-section">
                                                                <div className="menu-filter-label">Filter by value:</div>
                                                                <input className="menu-search-input" placeholder="Search values..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} autoFocus />
                                                                <div className="menu-value-list">
                                                                    {Array.from(new Set(data.slice(1).map(r => String(r[i]))))
                                                                        .filter(v => v.toLowerCase().includes(filterSearch.toLowerCase()))
                                                                        .map(val => (
                                                                            <label key={val} className="menu-value-item">
                                                                                <input type="checkbox" checked={(filters[i] || []).includes(val)} onChange={() => {
                                                                                    const cur = filters[i] || [];
                                                                                    const next = cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val];
                                                                                    setFilters({ ...filters, [i]: next });
                                                                                }} /> {val}
                                                                            </label>
                                                                        ))}
                                                                </div>
                                                                <div className="menu-footer">
                                                                    <button className="menu-btn ok" onClick={() => setActiveMenu(null)}>Apply</button>
                                                                    <button className="menu-btn" onClick={() => { setFilters({}); setActiveMenu(null); }}>Clear</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRows.map(({ row, originalIdx }) => (
                                            <tr key={originalIdx}>
                                                {row.map((cell: any, ci: number) => visibleCols[ci] && (
                                                    <td key={ci}
                                                        onMouseDown={() => handleMouseDown(originalIdx, ci)}
                                                        onMouseEnter={() => handleMouseEnter(originalIdx, ci)}
                                                        onDoubleClick={() => handleCellDoubleClick(originalIdx, ci)}
                                                    >
                                                        <div className={`cell-inner ${getSelectionClass(originalIdx, ci)}`}>
                                                            {editingCell?.r === originalIdx && editingCell.c === ci ? (
                                                                <input
                                                                    autoFocus
                                                                    className="cell-input"
                                                                    value={String(cell)}
                                                                    onChange={(e) => {
                                                                        setData(prev => {
                                                                            const nd = JSON.parse(JSON.stringify(prev));
                                                                            nd[originalIdx][ci] = e.target.value;
                                                                            return nd;
                                                                        });
                                                                    }}
                                                                    onFocus={() => pushToHistory()}
                                                                    onKeyDown={(e) => handleKeyDown(e, originalIdx, ci)}
                                                                    onBlur={() => setEditingCell(null)}
                                                                />
                                                            ) : String(cell)}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="summary-sidebar">
                                <div className="summary-header">Review Summary</div>
                                <div className="summary-body">
                                    <div className="summary-group">
                                        <h4>Inactive Suppliers</h4>
                                        <div className="summary-empty">All Suppliers Are Active</div>
                                    </div>
                                    <div className="summary-group">
                                        <h4>New Suppliers</h4>
                                        <div className="summary-empty">No New Suppliers Added</div>
                                    </div>
                                    <div className="summary-group">
                                        <h4>Active Supplier New Emails</h4>
                                        <div className="summary-empty">No Supplier New Emails Added</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </>
                )}

                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                        <div className="wizard-title-row">
                            <h1>Supplier Product Creation</h1>
                        </div>
                        <div className="table-section" style={{ border: 'none', borderTop: '1px solid #E2E8F0' }}>
                            <table className="wizard-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 100 }}>Is Active</th>
                                        {data[0]?.map((h, i) => (
                                            <th key={i} style={{ width: columnWidths[i] || 150 }}>{String(h)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.slice(1).map((row, ri) => (
                                        <tr key={ri}>
                                            <td><div className="cell-inner" style={{ justifyContent: 'center' }}>
                                                <input type="checkbox" defaultChecked />
                                            </div></td>
                                            {row.map((cell, ci) => (
                                                <td key={ci}><div className="cell-inner">{String(cell)}</div></td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                        <div className="wizard-title-row">
                            <h1>Final Review & Confirmation</h1>
                        </div>
                        <div className="table-section" style={{ border: 'none', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                            <table className="wizard-table" style={{ opacity: 0.8 }}>
                                <tbody>
                                    {data.slice(1).map((row, ri) => (
                                        <tr key={ri}>
                                            {row.map((cell, ci) => (
                                                <td key={ci}><div className="cell-inner">{String(cell)}</div></td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="wizard-footer">
                <div className="footer-stats">
                    <span>Total Line Items: <strong>{data.length - 1}</strong></span>
                    <span>Audit POs: <strong>17</strong></span>
                    <span>Verified: <strong>{filteredRows.length}/{data.length - 1}</strong></span>
                </div>
                <div className="footer-btns">
                    <button className="footer-btn discard" onClick={onClose}>Discard Changes</button>
                    <button className="footer-btn next" onClick={() => (step === 3 ? onComplete() : nextStep())}>
                        {step === 3 ? 'FINALIZE REVIEW' : 'NEXT STEP'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewWizard;
