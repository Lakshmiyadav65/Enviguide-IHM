import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './UploadPurchaseOrder.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    Cloud,
    ArrowUp,
    Upload,
    X,
    ChevronDown,
    FileText,
    RefreshCw,
    Wand2,
    CheckCircle2
} from 'lucide-react';

type ExcelRow = (string | number)[];
type ExcelData = ExcelRow[];

const SHIP_MANAGERS_DATA = [
    { name: 'John', vessels: [{ name: 'SHIP A', imo: '9123456' }, { name: 'SHIP B', imo: '9234567' }, { name: 'SHIP C', imo: '9345678' }, { name: 'SHIP D', imo: '9456789' }, { name: 'SHIP E', imo: '9567890' }] },
    { name: 'Amit', vessels: [{ name: 'TITANIC II', imo: '9111111' }, { name: 'OCEANIC', imo: '9222222' }, { name: 'MARINER', imo: '9333333' }, { name: 'EXPLORER', imo: '9444444' }, { name: 'VOYAGER', imo: '9555555' }] },
    { name: 'Carlos', vessels: [{ name: 'SANTA MARIA', imo: '9666666' }, { name: 'PINTA', imo: '9777777' }] },
    { name: 'David', vessels: [{ name: 'VICTORY', imo: '9888888' }, { name: 'CONSTITUTION', imo: '9999999' }] },
    { name: 'Ellen', vessels: [{ name: 'ARK', imo: '9000000' }, { name: 'GALAXY', imo: '9010101' }] },
    { name: 'Frank', vessels: [{ name: 'MERCURY', imo: '9020202' }, { name: 'VENUS', imo: '9030303' }] },
    { name: 'Grace', vessels: [{ name: 'MARS', imo: '9040404' }, { name: 'JUPITER', imo: '9050505' }] },
    { name: 'Henry', vessels: [{ name: 'SATURN', imo: '9060606' }, { name: 'URANUS', imo: '9070707' }] },
];

export default function UploadPurchaseOrder() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showImportingModal, setShowImportingModal] = useState(false);
    const [showDataViewer, setShowDataViewer] = useState(false);
    const [source, setSource] = useState('Excel');
    const [shipManager, setShipManager] = useState('');
    const [shipName, setShipName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importProgress, setImportProgress] = useState(0);
    const [rowsProcessed, setRowsProcessed] = useState(0);
    const [totalRows, setTotalRows] = useState(0);
    const [excelData, setExcelData] = useState<ExcelData>([]);

    const [showManagerDropdown, setShowManagerDropdown] = useState(false);
    const [showVesselDropdown, setShowVesselDropdown] = useState(false);

    const filteredManagers = SHIP_MANAGERS_DATA.filter(m => m.name.toLowerCase().includes(shipManager.toLowerCase()));
    const activeManager = SHIP_MANAGERS_DATA.find(m => m.name === shipManager);
    const filteredVessels = activeManager ? activeManager.vessels.filter(v => v.name.toLowerCase().includes(shipName.toLowerCase())) : [];

    // Order per user request:
    // PO number, item description, MD requested date, sent date, IMPA code, ISSA code, equipment code, equipment name, maker, model, part number, unit, quantity, Vendor Remark, Vendor email, vendor name
    const [fieldMappings, setFieldMappings] = useState({
        poNumber: '',
        itemDescription: '',
        mdRequestedDate: '',
        sentDate: '',
        impaCode: '',
        issaCode: '',
        equipmentCode: '',
        equipmentName: '',
        maker: '',
        model: '',
        partNumber: '',
        unit: '',
        quantity: '',
        vendorRemark: '',
        vendorEmail: '',
        vendorName: ''
    });

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [unmappedFields, setUnmappedFields] = useState<{ id: string; label: string }[]>([]);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const jumpToField = (fieldId: string) => {
        setShowErrorModal(false);
        setTimeout(() => {
            const element = fieldRefs.current[fieldId];
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('v3-highlight-field');
                setTimeout(() => {
                    element.classList.remove('v3-highlight-field');
                }, 2000);
            }
        }, 100);
    };

    const ALL_MAPPING_FIELDS = [
        { id: 'poNumber', label: 'PO NUMBER', req: true },
        { id: 'itemDescription', label: 'ITEM DESCRIPTION', req: true },
        { id: 'mdRequestedDate', label: 'MD REQUESTED DATE', req: false },
        { id: 'sentDate', label: 'SENT DATE', req: true },
        { id: 'impaCode', label: 'IMPA CODE', req: false },
        { id: 'issaCode', label: 'ISSA CODE', req: false },
        { id: 'equipmentCode', label: 'EQUIPMENT CODE', req: false },
        { id: 'equipmentName', label: 'EQUIPMENT NAME', req: false },
        { id: 'maker', label: 'MAKER', req: false },
        { id: 'model', label: 'MODEL', req: false },
        { id: 'partNumber', label: 'PART NUMBER', req: false },
        { id: 'unit', label: 'UNIT', req: true },
        { id: 'quantity', label: 'QUANTITY', req: true },
        { id: 'vendorRemark', label: 'VENDOR REMARK', req: false },
        { id: 'vendorEmail', label: 'VENDOR EMAIL', req: true },
        { id: 'vendorName', label: 'VENDOR NAME', req: true },
    ];

    const [autoMappedFields, setAutoMappedFields] = useState<Record<string, boolean>>({});

    const usedColumns = useMemo(() => {
        return Object.values(fieldMappings).filter(v => v !== '');
    }, [fieldMappings]);

    const getAcceptedFileTypes = () => source === 'Excel' ? '.xls,.xlsx' : source === 'PDF' ? '.pdf' : '.csv';

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setSelectedFile(file); }
    };

    const parseExcelFile = async (file: File): Promise<ExcelData> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    // Use defval: "" to prevent column shifting when cells are empty
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as ExcelData;
                    resolve(jsonData);
                } catch (error) { reject(error); }
            };
            reader.readAsBinaryString(file);
        });
    };

    const handleMapAll = () => {
        if (excelData.length === 0) return;
        const headers = excelData[0] as string[];
        const newMappings = { ...fieldMappings };
        const newAutoMapped = { ...autoMappedFields };
        const mappingUsed = new Set<string>();

        const keywords_map = {
            poNumber: ['po number', 'purchase order', 'po #', 'po_number', 'ponumber', 'po no', 'po no.', 'order number'],
            itemDescription: ['item description', 'description', 'item', 'product', 'product description', 'material description', 'desc'],
            mdRequestedDate: ['md requested date', 'md_requested_date', 'requested date', 'req date', 'order date'],
            sentDate: ['sent date', 'po sent date', 'order date', 'date sent', 'creation date'],
            impaCode: ['impa code', 'impa', 'code impa', 'impa_code'],
            issaCode: ['issa code', 'issa', 'code issa', 'issa_code'],
            equipmentCode: ['equipment code', 'equipment_code', 'eq code', 'machinery code'],
            equipmentName: ['equipment name', 'equipment', 'eq name', 'machinery'],
            maker: ['maker', 'manufacturer', 'brand', 'mfr'],
            model: ['model', 'model number', 'type', 'serial'],
            partNumber: ['part number', 'part #', 'part_number', 'p/n', 'partno'],
            unit: ['unit', 'uom', 'units', 'unit of measure'],
            quantity: ['quantity', 'qty', 'units', 'count', 'amount'],
            vendorRemark: ['vendor remark', 'remark', 'vendor_remark', 'notes', 'supplier remark'],
            vendorEmail: ['vendor email', 'email', 'vendor_email', 'supplier email', 'vendor_e-mail'],
            vendorName: ['vendor name', 'vendor', 'supplier', 'supplier name', 'mfr name'],
        };

        ALL_MAPPING_FIELDS.forEach(f => {
            const field = f.id as keyof typeof keywords_map;
            const keywords = keywords_map[field];

            for (let i = 0; i < headers.length; i++) {
                const h = String(headers[i] || '').toLowerCase().trim();
                const idx = i.toString();
                if (keywords.includes(h) && !mappingUsed.has(idx)) {
                    (newMappings as any)[field] = idx;
                    newAutoMapped[field] = true;
                    mappingUsed.add(idx);
                    break;
                }
            }
        });

        setFieldMappings(newMappings);
        setAutoMappedFields(newAutoMapped);
    };

    const handleManualMappingChange = (field: string, value: string) => {
        setFieldMappings({ ...fieldMappings, [field]: value });
        setAutoMappedFields({ ...autoMappedFields, [field]: false });
    };

    const finalizeImport = () => {
        // Find IMO for the vessel
        const manager = SHIP_MANAGERS_DATA.find(m => m.name === shipManager);
        const vessel = manager?.vessels.find(v => v.name === shipName);
        const imo = vessel?.imo || '9999999';

        // 1. Save data rows
        localStorage.setItem(`audit_rows_${imo}`, JSON.stringify(excelData));
        // 2. Save mapping
        localStorage.setItem(`audit_mapping_${imo}`, JSON.stringify(fieldMappings));

        // 3. Update audit_registry_main
        const existingRegistry = JSON.parse(localStorage.getItem('audit_registry_main') || '[]');
        const poColIdx = fieldMappings.poNumber ? parseInt(fieldMappings.poNumber) : -1;
        const itemColIdx = fieldMappings.itemDescription ? parseInt(fieldMappings.itemDescription) : -1;

        let totalPO = 0;
        let dupPO = 0;
        if (poColIdx !== -1 && excelData.length > 1) {
            const pos = excelData.slice(1).map(r => String(r[poColIdx] || '').trim()).filter(p => p !== '');
            totalPO = new Set(pos).size;
            const counts: Record<string, number> = {};
            pos.forEach(p => counts[p] = (counts[p] || 0) + 1);
            dupPO = Object.values(counts).filter(c => c > 1).length;
        }

        const newAudit: any = {
            imoNumber: imo,
            vesselName: shipName,
            totalPO: totalPO,
            totalItems: excelData.length - 1,
            duplicatePO: dupPO,
            duplicateSupplierCode: 0,
            duplicateProduct: 0,
            createDate: new Date().toISOString().split('T')[0],
        };

        // If duplicate was already there, update it
        const entryIdx = existingRegistry.findIndex((r: any) => r.imoNumber === imo);
        if (entryIdx !== -1) {
            existingRegistry[entryIdx] = newAudit;
        } else {
            existingRegistry.unshift(newAudit);
        }

        localStorage.setItem('audit_registry_main', JSON.stringify(existingRegistry));
        localStorage.removeItem('recentlyAddedAudit'); // Clear old temporary flag if any

        navigate('/administration/pending-audits');
    };

    const handleStartImport = async () => {
        if (!selectedFile || !shipManager || !shipName) return;
        setShowModal(false); setShowImportingModal(true); setImportProgress(0);
        try {
            const parsedData = await parseExcelFile(selectedFile);
            setExcelData(parsedData); setTotalRows(parsedData.length);
            const steps = 40;
            for (let i = 0; i <= steps; i++) {
                await new Promise(r => setTimeout(r, 40));
                setImportProgress((i / steps) * 100);
                setRowsProcessed(Math.floor((i / steps) * parsedData.length));
            }
            setShowImportingModal(false); setShowDataViewer(true);
        } catch (error) { setShowImportingModal(false); alert('File parsing failed'); }
    };

    const getMappedCount = () => {
        let count = 0;
        ALL_MAPPING_FIELDS.forEach(f => {
            if (fieldMappings[f.id as keyof typeof fieldMappings]) count++;
        });
        return count;
    };

    return (
        <div className="upload-po-container">
            <Sidebar />
            <main className="upload-po-main">
                <Header />
                <div className="upload-po-content">
                    <div className="po-header-section">
                        <h1>Upload Purchase Order</h1>
                        <p>Manage and initiate the compliance review process for your maritime purchase orders.</p>
                    </div>
                    <div className="upload-area-card">
                        <div className="upload-icon-wrapper">
                            <div className="icon-inner-box">
                                <Cloud size={60} fill="#00B0FA" color="#00B0FA" strokeWidth={0} />
                                <ArrowUp size={24} color="white" strokeWidth={3.5} style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                            </div>
                        </div>
                        <h2 className="upload-title">Upload Your Purchase Orders</h2>
                        <p className="upload-desc">Select your fleet files to begin the compliance review process.</p>
                        <button className="upload-action-btn" onClick={() => setShowModal(true)}>
                            <Upload size={18} /> SELECT FILES TO UPLOAD
                        </button>
                    </div>
                </div>

                {showModal && (
                    <>
                        <div className="modal-backdrop" onClick={() => setShowModal(false)} />
                        <div className="po-upload-modal">
                            <div className="modal-header">
                                <h2>PO Upload Configuration</h2>
                                <button className="modal-close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                            </div>
                            <div className="modal-body">
                                <div className="modal-row">
                                    <div className="modal-field"><label>SOURCE*</label>
                                        <div className="custom-select">
                                            <select value={source} onChange={(e) => setSource(e.target.value)}>
                                                <option value="Excel">Excel</option><option value="PDF">PDF</option><option value="CSV">CSV</option>
                                            </select>
                                            <ChevronDown size={16} className="select-icon" />
                                        </div>
                                    </div>
                                    <div className="modal-field"><label>SHIP MANAGER*</label>
                                        <div className="dropdown-wrapper">
                                            <input type="text" value={shipManager} onChange={(e) => { setShipManager(e.target.value); setShowManagerDropdown(true); setShipName(''); }} onFocus={() => setShowManagerDropdown(true)} placeholder="Search ship manager..." />
                                            {showManagerDropdown && filteredManagers.length > 0 && (
                                                <div className="custom-dropdown-list">
                                                    {filteredManagers.map((m, idx) => <div key={idx} className="dropdown-item" onClick={() => { setShipManager(m.name); setShowManagerDropdown(false); }}>{m.name}</div>)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-row">
                                    <div className="modal-field"><label>SHIP NAME*</label>
                                        <div className="dropdown-wrapper">
                                            <input type="text" value={shipName} onChange={(e) => { setShipName(e.target.value); setShowVesselDropdown(true); }} onFocus={() => setShowVesselDropdown(true)} placeholder="Search ship name..." disabled={!shipManager} />
                                            {showVesselDropdown && filteredVessels.length > 0 && (
                                                <div className="custom-dropdown-list">
                                                    {filteredVessels.map((v, idx) => <div key={idx} className="dropdown-item" onClick={() => { setShipName(v.name); setShowVesselDropdown(false); }}>{v.name}</div>)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-field"><label>CHOOSE FILE*</label>
                                        <div className="file-upload-area" onClick={() => fileInputRef.current?.click()}>
                                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept={getAcceptedFileTypes()} style={{ display: 'none' }} />
                                            <div className={selectedFile ? "file-selected" : "file-placeholder"}>
                                                <span className="file-label">description</span>
                                                <span className="file-name" style={{ fontSize: '12px' }}>{selectedFile ? selectedFile.name : "No file..."}</span>
                                                <button className="upload-btn-small">upload</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-cancel" onClick={() => setShowModal(false)}>CANCEL</button>
                                <button className={`btn-import ${(!selectedFile || !shipManager || !shipName) ? 'disabled' : ''}`} onClick={handleStartImport} disabled={!selectedFile || !shipManager || !shipName}>START IMPORT</button>
                            </div>
                        </div>
                    </>
                )}

                {showImportingModal && (
                    <>
                        <div className="modal-backdrop" />
                        <div className="v3-importing-modal">
                            <div className="v3-modal-header">
                                <h2>IMPORTING DATA</h2>
                                <button className="modal-close-btn" onClick={() => setShowImportingModal(false)}><X size={20} /></button>
                            </div>
                            <div className="v3-modal-body">
                                <div className="v3-currently-importing">
                                    <div className="v3-file-icon-box"><FileText size={24} /></div>
                                    <div className="v3-import-info">
                                        <div className="v3-info-label">CURRENTLY IMPORTING</div>
                                        <div className="v3-info-filename">{selectedFile?.name}</div>
                                    </div>
                                </div>
                                <div className="v3-progress-container">
                                    <div className="v3-progress-bar-bg"><div className="v3-progress-bar-fill" style={{ width: `${importProgress}%` }} /></div>
                                    <div className="v3-progress-text">Validating PO entries and checking for hazardous material matches...</div>
                                    <div className="v3-rows-badge">ROWS PROCESSED: {rowsProcessed} / {totalRows}</div>
                                </div>
                            </div>
                            <div className="v3-modal-footer">
                                <button className="v3-btn-cancel" onClick={() => setShowImportingModal(false)}>CANCEL</button>
                                <button className="v3-btn-processing">
                                    <RefreshCw size={16} className="spinning" /> PROCESSING...
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {showDataViewer && (
                    <div className="v3-mapping-overlay">
                        <div className="v3-top-navbar">
                            <div className="v3-breadcrumbs">
                                <span className="v3-crumb">Administration</span>
                                <span className="v3-crumb-sep">&rsaquo;</span>
                                <span className="v3-crumb">Upload PO</span>
                                <span className="v3-crumb-sep">&rsaquo;</span>
                                <span className="v3-crumb-active">Data Mapping</span>
                            </div>
                            <div className="v3-nav-right">
                                <div className="v3-file-tag">
                                    <div className="v3-status-dot" style={{ background: '#10B981', boxShadow: 'none', width: '6px', height: '6px' }} />
                                    FILE: {selectedFile?.name}
                                </div>
                                <button className="v3-close-view" onClick={() => setShowDataViewer(false)}>CLOSE VIEW <X size={16} /></button>
                            </div>
                        </div>
                        <div className="v3-main-body">
                            <div className="v3-preview-section">
                                <div className="v3-section-header">
                                    <div className="v3-header-row">
                                        <h2>Excel Data Preview</h2>
                                        <span className="v3-header-stats">Showing 1-12 of {excelData.length - 1} records</span>
                                    </div>
                                    <p className="v3-header-subtitle">Reviewing source file contents to ensure correct field alignment.</p>
                                </div>
                                <div className="v3-table-container">
                                    <table className="v3-table">
                                        <thead><tr>{excelData[0]?.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
                                        <tbody>
                                            {excelData.slice(1, 13).map((row, ri) => (
                                                <tr key={ri}>{row.map((c, ci) => <td key={ci}>{String(c || '')}</td>)}</tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="v3-sidebar">
                                <div className="v3-sidebar-content">
                                    <div className="v3-sidebar-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <h3>Field Mapping</h3>
                                        </div>
                                        <button className="v3-map-all-btn" onClick={handleMapAll}><Wand2 size={12} /> MAP ALL</button>
                                    </div>
                                    <p className="v3-sidebar-subtitle">Assign Excel columns to the platform data fields.</p>
                                    <div className="v3-mapping-fields">
                                        {ALL_MAPPING_FIELDS.map(f => (
                                            <div
                                                key={f.id}
                                                className="v3-mapping-field"
                                                ref={el => { fieldRefs.current[f.id] = el; }}
                                            >
                                                <div className="v3-field-labels">
                                                    <label>{f.label}</label>
                                                    {fieldMappings[f.id as keyof typeof fieldMappings] && autoMappedFields[f.id] ?
                                                        <span className="v3-auto-matched-badge">AUTO-MATCHED</span> :
                                                        (fieldMappings[f.id as keyof typeof fieldMappings] ? <span className="v3-optional-badge">MAPPED</span> : null)
                                                    }
                                                </div>
                                                <div className={`v3-select-box ${fieldMappings[f.id as keyof typeof fieldMappings] ? 'active' : ''}`}>
                                                    <select
                                                        value={fieldMappings[f.id as keyof typeof fieldMappings]}
                                                        onChange={(e) => handleManualMappingChange(f.id, e.target.value)}
                                                    >
                                                        <option value="">Select Column...</option>
                                                        {excelData[0]?.map((h, i) => {
                                                            const colIdx = i.toString();
                                                            const isUsed = usedColumns.includes(colIdx) && fieldMappings[f.id as keyof typeof fieldMappings] !== colIdx;
                                                            if (isUsed) return null;
                                                            return <option key={i} value={colIdx}>{h || `Column ${i + 1}`}</option>;
                                                        })}
                                                    </select>
                                                    <ChevronDown size={14} className="v3-chevron" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="v3-sidebar-footer" style={{ padding: '24px 32px', borderTop: '1px solid #F1F5F9' }}>
                                    <div className="v3-mandatory-status">
                                        <span className="v3-mandatory-label">Mapping Progress</span>
                                        <span className="v3-mandatory-count">{getMappedCount()} / {ALL_MAPPING_FIELDS.length}</span>
                                    </div>
                                    <div className="v3-footer-progress-bg">
                                        <div className="v3-footer-progress-fill" style={{ width: `${(getMappedCount() / ALL_MAPPING_FIELDS.length) * 100}%` }} />
                                    </div>
                                    <button className="v3-confirm-mapping-btn" onClick={() => {
                                        const unmapped = ALL_MAPPING_FIELDS.filter(f => f.req && !fieldMappings[f.id as keyof typeof fieldMappings]);
                                        if (unmapped.length > 0) {
                                            setUnmappedFields(unmapped);
                                            setShowErrorModal(true);
                                        } else {
                                            setShowSuccessNotification(true);
                                        }
                                    }}>CONFIRM MAPPING</button>
                                </div>
                            </div>
                        </div>

                        {showSuccessNotification && (
                            <div className="success-notification">
                                <div className="success-content">
                                    <div className="success-icon"><CheckCircle2 size={20} color="#10B981" fill="#DCFCE7" /></div>
                                    <div className="success-text">
                                        <div className="success-title">Mapping Complete</div>
                                        <div className="success-desc">You can now proceed to finalize the import.</div>
                                    </div>
                                </div>
                                <button className="finalize-import-btn" onClick={finalizeImport}>FINALIZE IMPORT</button>
                            </div>
                        )}
                    </div>
                )}

                {showErrorModal && (
                    <>
                        <div className="modal-backdrop" onClick={() => setShowErrorModal(false)} />
                        <div className="v3-error-modal">
                            <div className="v3-error-header">
                                <div className="v3-error-title-group">
                                    <div className="v3-error-icon"><RefreshCw size={18} color="#EF4444" /></div>
                                    <h3>Incomplete Mapping</h3>
                                </div>
                                <button className="v3-error-close" onClick={() => setShowErrorModal(false)}><X size={20} /></button>
                            </div>
                            <div className="v3-error-body">
                                <p className="v3-error-summary">There are <strong>{unmappedFields.length} fields</strong> that still need to be mapped before importing.</p>
                                <div className="v3-error-cards">
                                    {unmappedFields.map(field => (
                                        <div key={field.id} className="v3-error-card" onClick={() => jumpToField(field.id)}>
                                            <div className="v3-card-left">
                                                <div className="v3-card-icon"><RefreshCw size={14} color="#EF4444" /></div>
                                                <div className="v3-card-info">
                                                    <span className="v3-card-label">{field.label}</span>
                                                    <span className="v3-card-status">PENDING MAPPING</span>
                                                </div>
                                            </div>
                                            <ArrowUp size={16} className="v3-card-arrow" style={{ transform: 'rotate(90deg)' }} />
                                        </div>
                                    ))}
                                </div>
                                <div className="v3-error-info-box">
                                    <RefreshCw size={16} color="#3B82F6" />
                                    <p>Select a corresponding column from your file for each label listed above.</p>
                                </div>
                            </div>
                            <div className="v3-error-footer">
                                <button className="v3-error-btn-cancel" onClick={() => { setShowErrorModal(false); setShowDataViewer(false); }}>CANCEL IMPORT</button>
                                <button className="v3-error-btn-back" onClick={() => setShowErrorModal(false)}>BACK TO MAPPING</button>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
