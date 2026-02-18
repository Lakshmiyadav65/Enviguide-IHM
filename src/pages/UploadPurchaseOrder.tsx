import { useState, useRef, useEffect } from 'react';
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
    Search,
    ChevronDown,
    FileText,
    RefreshCw,
    Wand2,
    ChevronLeft,
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
    const [fileSource, setFileSource] = useState('Upload from local');
    const [importProgress, setImportProgress] = useState(0);
    const [rowsProcessed, setRowsProcessed] = useState(0);
    const [totalRows, setTotalRows] = useState(0);
    const [excelData, setExcelData] = useState<ExcelData>([]);

    // Duplicate counts for audit
    const [duplicates, setDuplicates] = useState({ po: 0, supplier: 0, product: 0 });

    // Dropdown Visibility States
    const [showManagerDropdown, setShowManagerDropdown] = useState(false);
    const [showVesselDropdown, setShowVesselDropdown] = useState(false);

    // Filtered Lists
    const filteredManagers = SHIP_MANAGERS_DATA.filter(m => m.name.toLowerCase().includes(shipManager.toLowerCase()));
    const activeManager = SHIP_MANAGERS_DATA.find(m => m.name === shipManager);
    const filteredVessels = activeManager ? activeManager.vessels.filter(v => v.name.toLowerCase().includes(shipName.toLowerCase())) : [];

    const [fieldMappings, setFieldMappings] = useState({
        poNumber: '',
        supplierName: '',
        itemDescription: '',
        quantity: '',
        orderDate: ''
    });
    const [autoMappedFields, setAutoMappedFields] = useState<Record<string, boolean>>({});
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [unmappedFields, setUnmappedFields] = useState<string[]>([]);
    const [showValidationErrors, setShowValidationErrors] = useState(false);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as ExcelData;
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

        // System target names for matching (Case-insensitive exact match logic)
        const targets = {
            poNumber: ['po number', 'purchase order', 'po #', 'po_number', 'ponumber'],
            supplierName: ['supplier name', 'supplier', 'vendor', 'vendor name', 'supplier_name'],
            itemDescription: ['item description', 'description', 'item', 'product', 'product description'],
            quantity: ['quantity', 'qty', 'units', 'count'],
            orderDate: ['order date', 'date', 'po date']
        };

        headers.forEach((header, index) => {
            const h = String(header).toLowerCase().trim();
            const idx = index.toString();

            Object.entries(targets).forEach(([field, keywords]) => {
                if (keywords.includes(h)) {
                    (newMappings as any)[field] = idx;
                    newAutoMapped[field] = true;
                }
            });
        });

        setFieldMappings(newMappings);
        setAutoMappedFields(newAutoMapped);
    };

    const handleManualMappingChange = (field: string, value: string) => {
        setFieldMappings({ ...fieldMappings, [field]: value });
        setAutoMappedFields({ ...autoMappedFields, [field]: false });
    };

    const calculateTotalQuantity = () => {
        if (!fieldMappings.quantity || excelData.length <= 1) return 0;
        const qIdx = parseInt(fieldMappings.quantity);
        return excelData.slice(1).reduce((acc, row) => {
            const val = parseFloat(String(row[qIdx]));
            return acc + (isNaN(val) ? 0 : val);
        }, 0);
    };

    const finalizeImport = () => {
        const selectedVessel = activeManager?.vessels.find(v => v.name === shipName);
        const totalItemsValue = calculateTotalQuantity();

        const newAudit = {
            imoNumber: selectedVessel?.imo || '9000000',
            vesselName: shipName,
            totalPO: 1,
            totalItems: totalItemsValue || 0,
            duplicatePO: duplicates.po,
            duplicateSupplierCode: duplicates.supplier,
            duplicateProduct: duplicates.product,
            createDate: new Date().toISOString().split('T')[0]
        };

        localStorage.setItem('recentlyAddedAudit', JSON.stringify(newAudit));
        navigate('/administration/pending-audits');
    };

    const handleStartImport = async () => {
        if (!selectedFile || !shipManager || !shipName) return;
        setShowModal(false);
        setShowImportingModal(true);
        setImportProgress(0);

        try {
            const parsedData = await parseExcelFile(selectedFile);
            setExcelData(parsedData);
            setTotalRows(parsedData.length);

            // Mock duplicate detection
            let poD = 0;
            const headers = parsedData[0]?.map(h => String(h).toLowerCase()) || [];
            headers.forEach((h, idx) => { if (h.includes('duplicate')) poD++; });
            setDuplicates({ po: poD, supplier: 0, product: 0 });

            const steps = 40;
            for (let i = 0; i <= steps; i++) {
                await new Promise(r => setTimeout(r, 40));
                setImportProgress((i / steps) * 100);
                setRowsProcessed(Math.floor((i / steps) * parsedData.length));
            }

            setShowImportingModal(false);
            setShowDataViewer(true);
        } catch (error) {
            setShowImportingModal(false);
            alert('File parsing failed');
        }
    };

    const getMappedCount = () => {
        let count = 0;
        if (fieldMappings.poNumber) count++;
        if (fieldMappings.supplierName) count++;
        if (fieldMappings.itemDescription) count++;
        if (fieldMappings.quantity) count++;
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
                                    <div className="modal-field"><label>FILES*</label>
                                        <div className="custom-select">
                                            <select value={fileSource} onChange={(e) => setFileSource(e.target.value)}>
                                                <option value="Upload from local">Upload from local</option>
                                            </select>
                                            <ChevronDown size={16} className="select-icon" />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-field full-width"><label>CHOOSE FILE*</label>
                                    <div className="file-upload-area" onClick={() => fileInputRef.current?.click()}>
                                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept={getAcceptedFileTypes()} style={{ display: 'none' }} />
                                        <div className={selectedFile ? "file-selected" : "file-placeholder"}>
                                            <span className="file-label">description</span>
                                            <span className="file-name">{selectedFile ? selectedFile.name : "No file selected"}</span>
                                            <button className="upload-btn-small">upload</button>
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
                                    <div className="v3-file-icon-box">
                                        <FileText size={24} />
                                    </div>
                                    <div className="v3-import-info">
                                        <div className="v3-info-label">CURRENTLY IMPORTING</div>
                                        <div className="v3-info-filename">{selectedFile?.name}</div>
                                    </div>
                                </div>
                                <div className="v3-progress-container">
                                    <div className="v3-progress-bar-bg">
                                        <div className="v3-progress-bar-fill" style={{ width: `${importProgress}%` }} />
                                    </div>
                                    <div className="v3-progress-text">Validating PO entries and checking for hazardous material matches...</div>
                                    <div className="v3-rows-badge">
                                        ROWS PROCESSED: {rowsProcessed} / {totalRows}
                                    </div>
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
                                <button className="v3-close-view" onClick={() => setShowDataViewer(false)}>
                                    CLOSE VIEW <X size={16} />
                                </button>
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
                                        <thead>
                                            <tr>{excelData[0]?.map((h, i) => <th key={i}>{h}</th>)}</tr>
                                        </thead>
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
                                        <h3>Field Mapping</h3>
                                        <button className="v3-map-all-btn" onClick={handleMapAll}>
                                            <Wand2 size={12} /> MAP ALL
                                        </button>
                                    </div>
                                    <p className="v3-sidebar-subtitle">Assign Excel columns to the required platform data fields.</p>

                                    <div className="v3-mapping-fields">
                                        {[
                                            { id: 'poNumber', label: 'PO NUMBER*', req: true },
                                            { id: 'supplierName', label: 'SUPPLIER NAME*', req: true },
                                            { id: 'itemDescription', label: 'ITEM DESCRIPTION*', req: true },
                                            { id: 'quantity', label: 'QUANTITY*', req: true },
                                            { id: 'orderDate', label: 'ORDER DATE', req: false }
                                        ].map(f => (
                                            <div key={f.id} className="v3-mapping-field">
                                                <div className="v3-field-labels">
                                                    <label>{f.label}</label>
                                                    {fieldMappings[f.id as keyof typeof fieldMappings] && autoMappedFields[f.id] ?
                                                        <span className="v3-auto-matched-badge">AUTO-MATCHED</span> :
                                                        (f.req ? <span className="v3-optional-badge" style={{ color: '#EF4444' }}>REQUIRED</span> : <span className="v3-optional-badge">OPTIONAL</span>)
                                                    }
                                                </div>
                                                <div className={`v3-select-box ${fieldMappings[f.id as keyof typeof fieldMappings] ? 'active' : ''}`}>
                                                    <select value={fieldMappings[f.id as keyof typeof fieldMappings]} onChange={(e) => handleManualMappingChange(f.id, e.target.value)}>
                                                        <option value="">Select Column...</option>
                                                        {excelData[0]?.map((h, i) => <option key={i} value={i.toString()}>{h}</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className="v3-chevron" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="v3-sidebar-footer">
                                    <div className="v3-mandatory-status">
                                        <span className="v3-mandatory-label">Mandatory fields mapped</span>
                                        <span className="v3-mandatory-count">{getMappedCount()} / 4</span>
                                    </div>
                                    <div className="v3-footer-progress-bg">
                                        <div className="v3-footer-progress-fill" style={{ width: `${(getMappedCount() / 4) * 100}%` }} />
                                    </div>
                                    <button className="v3-confirm-mapping-btn" onClick={() => {
                                        const missing = [];
                                        if (!fieldMappings.poNumber) missing.push('PO Number');
                                        if (!fieldMappings.supplierName) missing.push('Supplier Name');
                                        if (!fieldMappings.itemDescription) missing.push('Item Description');
                                        if (!fieldMappings.quantity) missing.push('Quantity');
                                        if (missing.length > 0) { setUnmappedFields(missing); setShowValidationErrors(true); setShowErrorModal(true); } else { setShowSuccessNotification(true); }
                                    }}>CONFIRM MAPPING</button>
                                </div>
                            </div>
                        </div>

                        <div className="v3-global-footer">
                            <div className="v3-footer-item">
                                <span className="v3-footer-label">TOTAL RECORDS FOUND:</span>
                                <span className="v3-footer-value">{excelData.length - 1}</span>
                            </div>
                            <div className="v3-footer-item">
                                <span className="v3-footer-label">VALIDATION ERRORS:</span>
                                <div className="v3-validation-badge">
                                    <CheckCircle2 size={16} /> 0
                                </div>
                            </div>
                            <div className="v3-system-status">
                                <div className="v3-status-dot" />
                                SYSTEM READY FOR IMPORT
                            </div>
                        </div>

                        {showSuccessNotification && (
                            <div className="success-notification">
                                <div style={{ color: 'white' }}>
                                    <div style={{ fontWeight: 700 }}>Mapping Confirmed</div>
                                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>Your data is ready for final audit.</div>
                                </div>
                                <button className="finalize-import-btn" onClick={finalizeImport}>FINALIZE IMPORT</button>
                            </div>
                        )}
                    </div>
                )}

                {showErrorModal && (
                    <>
                        <div className="modal-backdrop" onClick={() => setShowErrorModal(false)} />
                        <div className="error-modal" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '32px', borderRadius: '12px', zIndex: 10001, maxWidth: '400px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#EF4444' }}><X size={24} /> <h3 style={{ margin: 0, color: '#0F172A' }}>Missing Fields</h3></div>
                            <p style={{ fontSize: '14px', color: '#64748B' }}>Please map all required fields: {unmappedFields.join(', ')}</p>
                            <button className="v3-confirm-mapping-btn" style={{ marginTop: '20px' }} onClick={() => setShowErrorModal(false)}>BACK TO MAPPING</button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
