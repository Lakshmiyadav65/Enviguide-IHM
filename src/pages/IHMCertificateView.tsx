import React, { useState } from 'react';
import {
    FileText, Calendar, ShieldCheck, Landmark, Upload, Info,
    Search, Plus, ChevronDown, ChevronUp, Eye, Download, RefreshCw,
    CheckCircle2, Clock, Ship, ChevronRight, ChevronLeft,
    Trash2, Lock, X, Layers
} from 'lucide-react';
import './IHMCertificateView.css';

interface IHMCertificateViewProps {
    vesselName: string;
    onCertificateSubmit?: () => void;
}

const IHMCertificateView: React.FC<IHMCertificateViewProps> = ({ vesselName, onCertificateSubmit }) => {
    const [view, setView] = useState<'dashboard' | 'add-form' | 'cert-detail'>('dashboard');
    const [currentStep, setCurrentStep] = useState(1);
    const [expandedSection, setExpandedSection] = useState<string | null>('ihm');
    const [showToast, setShowToast] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [fullContentMode, setFullContentMode] = useState(false);

    // Certificate Type Management
    interface Certificate {
        id: string;
        name: string;
        issueDate: string;
        expiryDate: string;
        status: 'Valid' | 'Action Required' | 'Expired';
        isNew?: boolean;
        fileName?: string;
        authority: string;
    }

    const [certificates, setCertificates] = useState<Certificate[]>([
        {
            id: '1',
            name: 'IHM Part I, II & III - Main Vessel',
            issueDate: '2023-01-12',
            expiryDate: '2028-01-11',
            status: 'Valid',
            authority: 'DNV'
        },
        {
            id: '2',
            name: 'IHM Part II - Supplementary Survey',
            issueDate: '2023-05-05',
            expiryDate: '2024-05-04',
            status: 'Action Required',
            authority: 'DNV'
        }
    ]);

    const [activeCert, setActiveCert] = useState<Certificate | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        type: 'Statement of Compliance (SoC)',
        authority: '',
        certNumber: '',
        placeOfIssue: '',
        issueDate: '',
        expiryDate: ''
    });

    const safeVesselName = vesselName || 'Unknown Vessel';
    const hasCerts = safeVesselName !== 'MV NORTH STAR' || certificates.length > 0;

    const handleAddClick = () => {
        setView('add-form');
        setCurrentStep(1);
        setUploadedFile(null);
        setFormData({
            type: 'Statement of Compliance (SoC)',
            authority: '',
            certNumber: '',
            placeOfIssue: '',
            issueDate: '',
            expiryDate: ''
        });
    };

    const handleNext = () => setCurrentStep(prev => Math.min(3, prev + 1));
    const handleBack = () => setCurrentStep(prev => Math.max(1, prev - 1));

    const handleSubmit = () => {
        const newCert: Certificate = {
            id: Date.now().toString(),
            name: formData.type === 'Statement of Compliance (SoC)' ? `${formData.type} - ${safeVesselName}` : formData.type,
            issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
            expiryDate: formData.expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
            status: 'Valid',
            isNew: true,
            fileName: uploadedFile ? uploadedFile.name : undefined,
            authority: formData.authority || 'DNV'
        };

        setCertificates(prev => [newCert, ...prev]);
        setActiveCert(newCert); // Set active cert so toast can link to it
        setView('dashboard');
        setShowToast(true);
        if (onCertificateSubmit) onCertificateSubmit();
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleCancel = () => {
        setView('dashboard');
    };

    const handleViewCert = (cert: Certificate) => {
        setActiveCert(cert);
        setView('cert-detail');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
        }
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,This%20is%20a%20dummy%20certificate%20file.';
        link.download = activeCert?.fileName || `${safeVesselName}_Certificate.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Helper to format date for display
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (view === 'cert-detail' && activeCert) {
        return (
            <div className={`ihm-certificate-container cert-detail-view ${fullContentMode ? 'full-content-mode' : ''}`}>
                <div className="cert-document-layout">
                    {/* Main Content Area (Left/Main Part) */}
                    <div className="document-main-area">
                        {/* PDF Viewer Header - now restricted to this area */}
                        <div className="pdf-viewer-header">
                            <div className="pdf-header-left">
                                <span className="pdf-file-name">{activeCert.fileName || `${activeCert.name}.pdf`}</span>
                            </div>
                            <div className="pdf-center-controls">
                                <button className="pdf-icon-btn"><span style={{ fontSize: '18px' }}>-</span></button>
                                <span className="pdf-zoom-level">100%</span>
                                <button className="pdf-icon-btn"><span style={{ fontSize: '18px' }}>+</span></button>
                                <button
                                    className={`pdf-icon-btn i-mode-btn ${fullContentMode ? 'active' : ''}`}
                                    title="Toggle Content Only Mode"
                                    onClick={() => setFullContentMode(!fullContentMode)}
                                >
                                    <Info size={16} />
                                </button>
                            </div>
                            <div className="pdf-right-actions">
                                <button className="pdf-icon-btn" onClick={() => window.print()} title="Print"><RefreshCw size={16} /></button>
                                <button className="pdf-download-btn" onClick={handleDownload}>
                                    <Download size={14} /> Download
                                </button>
                            </div>
                        </div>

                        {/* The Document Paper Container */}
                        <div className="document-paper-wrapper">
                            <div className="document-paper">
                                <div className="doc-watermark"><ShieldCheck size={120} /></div>

                                <div className="doc-header-section">
                                    {/* Removed h1 Statement of Compliance as per request */}
                                    <p className="doc-subtitle">Issued under the provisions of the International Convention for the Safe and Environmentally Sound Recycling of Ships</p>
                                </div>

                                <div className="doc-grid">
                                    {/* Removed Name of Ship field as per request */}
                                    <div className="doc-field">
                                        <label>IMO NUMBER</label>
                                        <div className="value">9876543</div>
                                    </div>
                                    <div className="doc-field">
                                        <label>DISTINCTIVE NUMBERS OR LETTERS</label>
                                        <div className="value">D5YX3</div>
                                    </div>
                                    <div className="doc-field">
                                        <label>PORT OF REGISTRY</label>
                                        <div className="value">Monrovia</div>
                                    </div>
                                </div>

                                <div className="doc-body-text">
                                    <p>
                                        This is to certify that the Inventory of Hazardous Materials (IHM) required by regulation 5 of the Annex to the Convention has been verified and found to be in accordance with the requirements of the Convention.
                                    </p>
                                </div>

                                <div className="doc-footer-section">
                                    <div className="place-date">
                                        <label>PLACE AND DATE OF ISSUE</label>
                                        <div className="value">Oslo, Norway - {formatDate(activeCert.issueDate)}</div>
                                    </div>
                                    <div className="signature-box">
                                        <div className="sig-line"></div>
                                        <label>AUTHORIZED SIGNATURE</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Intelligence */}
                    <div className="cert-intelligence-sidebar">
                        <div className="sidebar-title">CERTIFICATE INTELLIGENCE</div>

                        <div className="data-group importance-top">
                            <label>ISSUING AUTHORITY</label>
                            <div className="authority-box">
                                <div className="logo-sq">BV</div>
                                <div>
                                    <div className="auth-name">{activeCert.authority}</div>
                                    <div className="auth-sub">Classification Society</div>
                                </div>
                            </div>
                        </div>

                        <div className={`intel-card status-card ${activeCert.status === 'Valid' ? 'valid' : 'action'}`}>
                            <div className="intel-header">
                                <span>CURRENT STATUS</span>
                                <span className={`status-badge ${activeCert.status === 'Valid' ? 'valid' : 'action'}`}>
                                    <CheckCircle2 size={12} fill="white" color={activeCert.status === 'Valid' ? '#10b981' : '#ef4444'} />
                                    {activeCert.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="days-count">
                                <span className="big">420</span>
                                <span className="label">Days until expiry</span>
                            </div>
                            <div className="progress-bar"><div className="fill" style={{ width: '65%', background: activeCert.status === 'Valid' ? '#10b981' : '#ef4444' }}></div></div>
                        </div>

                        <div className="data-group">
                            <label>CERTIFICATE NO</label>
                            <div className="value-text">{activeCert.id.length > 5 ? `SOC-${new Date().getFullYear()}-${activeCert.id}` : 'SOC-2023-9981-REV2'}</div>
                        </div>

                        <div className="dates-row-clean">
                            <div className="data-group">
                                <label>ISSUE DATE</label>
                                <div className="value-text">{formatDate(activeCert.issueDate)}</div>
                            </div>
                            <div className="data-group">
                                <label>SURVEY DATE</label>
                                <div className="value-text">05 Oct 2023</div>
                            </div>
                        </div>

                        <div className="sidebar-actions">
                            <button className="sidebar-btn primary">Renew Certificate <RefreshCw size={14} /></button>
                            <div className="btn-row">
                                <button className="sidebar-btn" onClick={() => setView('add-form')} title="Filter Edit"><FileText size={14} /> Edit</button>
                                <button className="sidebar-btn" title="Retest Survey"><RefreshCw size={14} /> Retest</button>
                            </div>
                            <button className="sidebar-btn" onClick={handleDownload} title="Download Document"><Download size={14} /> Download PDF</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'add-form') {
        return (
            <div className="ihm-certificate-container add-form-container">
                <div className="form-wizard-layout">
                    {/* Left Progress Sidebar */}
                    <div className="wizard-progress-sidebar">
                        <h3>Progress</h3>
                        <p>Follow the steps to complete certificate registration</p>

                        <div className="steps-vertical">
                            <div className={`step-indicator ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
                                <div className="step-point">
                                    {currentStep > 1 ? <CheckCircle2 size={18} /> : <span>i</span>}
                                </div>
                                <div className="step-label">
                                    <h4>General Information</h4>
                                    <p>{currentStep > 1 ? 'Completed' : 'IN PROGRESS'}</p>
                                </div>
                            </div>
                            <div className="step-line"></div>
                            <div className={`step-indicator ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
                                <div className="step-point">
                                    {currentStep > 2 ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                </div>
                                <div className="step-label">
                                    <h4>Validity Dates</h4>
                                    <p>{currentStep === 2 ? 'IN PROGRESS' : currentStep > 2 ? 'Completed' : 'Pending'}</p>
                                </div>
                            </div>
                            <div className="step-line"></div>
                            <div className={`step-indicator ${currentStep === 3 ? 'active' : ''}`}>
                                <div className="step-point">
                                    <FileText size={18} />
                                </div>
                                <div className="step-label">
                                    <h4>Documents & Review</h4>
                                    <p>{currentStep === 3 ? 'IN PROGRESS' : 'Pending'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Form Content */}
                    <div className="wizard-form-content">
                        {currentStep === 1 && (
                            <div className="step-content">
                                <h2>General Information</h2>
                                <p className="step-desc">Step 1 of 3: Enter the primary details of the IHM certificate.</p>

                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>Certificate Type</label>
                                        <select
                                            className="standard-input"
                                            style={{ height: '42px', padding: '0 12px' }}
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option>Statement of Compliance (SoC)</option>
                                            <option>IHM Part I</option>
                                            <option>IHM Part II</option>
                                            <option>Exemption Certificate</option>
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label>Issuing Authority</label>
                                        <div className="search-input-wrapper">
                                            <Search size={18} className="icon" />
                                            <input
                                                type="text"
                                                placeholder="Search Class Society (e.g. DNV, Lloyd's Register)"
                                                value={formData.authority}
                                                onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                                            />
                                        </div>
                                        <div className="authority-chips">
                                            <span>COMMON: DNV</span>
                                            <span>CLASSNK</span>
                                            <span>ABS</span>
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label>Certificate Number</label>
                                        <input type="text" placeholder="Enter certificate ID" className="standard-input"
                                            value={formData.certNumber}
                                            onChange={(e) => setFormData({ ...formData, certNumber: e.target.value })}
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label>Vessel Name</label>
                                        <div className="read-only-box">
                                            <Ship size={16} />
                                            <span>{safeVesselName}</span>
                                        </div>
                                        <p className="hint">Vessel context is automatically assigned.</p>
                                    </div>
                                </div>

                                <div className="wizard-info-footer">
                                    <Info size={16} />
                                    <p>Ensure the Certificate Number matches exactly as shown on the physical document issued by the Authority. This is used for verification during port state control inspections.</p>
                                </div>

                                <div className="form-footer">
                                    <button className="btn-ghost cancel-btn" onClick={handleCancel}>Cancel</button>
                                    <div className="footer-right">
                                        <button className="btn-secondary">SAVE DRAFT</button>
                                        <button className="btn-primary" onClick={handleNext}>NEXT STEP <ChevronRight size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="step-content">
                                <h2>Validity & Survey Details</h2>
                                <p className="step-desc">Step 2 of 3: Define the timeframe for the IHM certificate.</p>

                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>Place of Issue</label>
                                        <input type="text" className="standard-input" placeholder="e.g. Rotterdam"
                                            value={formData.placeOfIssue}
                                            onChange={(e) => setFormData({ ...formData, placeOfIssue: e.target.value })}
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label>Last Audit / Survey Date <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span></label>
                                        <input type="date" className="standard-input" style={{ minHeight: '42px' }} />
                                    </div>

                                    <div className="input-group">
                                        <label>Date of Issue</label>
                                        <input type="date" className="standard-input" style={{ minHeight: '42px' }}
                                            value={formData.issueDate}
                                            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label>Date of Expiry</label>
                                        <input type="date" className="standard-input" style={{ minHeight: '42px' }}
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        />
                                        <div className="renewal-chip">
                                            <div className="dot"></div>
                                            5 YEAR RENEWAL CYCLE
                                        </div>
                                    </div>
                                </div>

                                <div className="wizard-info-footer">
                                    <Info size={16} />
                                    <p>According to IMO guidelines, the Statement of Compliance for IHM remains valid for a maximum period of 5 years. Please ensure the expiry date aligns with the vessel's main class survey cycle.</p>
                                </div>

                                <div className="form-footer">
                                    <button className="btn-ghost cancel-btn" onClick={handleCancel}>Cancel</button>
                                    <div className="footer-right">
                                        <button className="btn-ghost back-btn" onClick={handleBack}><ChevronLeft size={18} /> BACK</button>
                                        <button className="btn-secondary">SAVE DRAFT</button>
                                        <button className="btn-primary" onClick={handleNext}>NEXT STEP <ChevronRight size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="step-content">
                                <h2>Documents & Review</h2>
                                <p className="step-desc">Step 3 of 3: Upload the certificate document and review all entered details.</p>

                                <div className="upload-section">
                                    <label>Upload Certificate</label>
                                    {!uploadedFile ? (
                                        <div className="dropzone-area" style={{ position: 'relative' }}>
                                            <div className="upload-circle"><Upload size={24} /></div>
                                            <p className="main-text">Choose certificate file (PDF, PNG, JPG)</p>
                                            <p className="sub-text">or drag and drop here (max. 10MB)</p>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="file-input-hidden"
                                                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }}
                                                accept=".pdf,.png,.jpg,.jpeg"
                                            />
                                        </div>
                                    ) : (
                                        <div className="uploaded-file-card">
                                            <div className="file-info">
                                                <FileText size={20} color="#e11d48" />
                                                <div className="text">
                                                    <span className="name">{uploadedFile.name}</span>
                                                    <span className="meta">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Uploaded</span>
                                                </div>
                                            </div>
                                            <button className="delete-file-btn" onClick={() => setUploadedFile(null)}><Trash2 size={18} /></button>
                                        </div>
                                    )}
                                </div>

                                <div className="record-summary">
                                    <h3>Record Summary</h3>
                                    <div className="summary-grid">
                                        <div className="summary-item">
                                            <label>CERTIFICATE TYPE</label>
                                            <p>{formData.type}</p>
                                        </div>
                                        <div className="summary-item">
                                            <label>ISSUING AUTHORITY</label>
                                            <p>{formData.authority || 'Not specified'}</p>
                                        </div>
                                        <div className="summary-item">
                                            <label>EXPIRY DATE</label>
                                            <p>{formatDate(formData.expiryDate)}</p>
                                        </div>
                                    </div>
                                    <div className="read-only-disclaimer">
                                        <Lock size={12} />
                                        <span>Fields are read-only in this step. Go back to edit.</span>
                                    </div>
                                </div>

                                <div className="wizard-info-footer">
                                    <Info size={16} />
                                    <p>By submitting this certificate, you confirm that all entered data matches the attached official document. Verification will be performed by the compliance officer.</p>
                                </div>

                                <div className="form-footer">
                                    <button className="btn-ghost cancel-btn" onClick={handleCancel}>Cancel</button>
                                    <div className="footer-right">
                                        <button className="btn-secondary">SAVE DRAFT</button>
                                        <button className="btn-primary submit" onClick={handleSubmit}>SUBMIT CERTIFICATE <RefreshCw size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!hasCerts) {
        return (
            <div className="ihm-certificate-container">
                {/* Empty State Section */}
                <div className="cert-empty-state-card" style={{ margin: 'auto' }}>
                    <div className="empty-state-visual">
                        <div className="document-icon-wrapper">
                            <FileText size={48} color="#94a3b8" />
                            <div className="missing-badge">
                                <Info size={12} color="white" />
                            </div>
                        </div>
                    </div>

                    <h2 className="empty-state-title">No Certificates Yet</h2>
                    <p className="empty-state-description">
                        There is no certificate yet for this vessel. Start by<br />
                        uploading an IHM Certificate, SoC, or Interim document to<br />
                        track compliance.
                    </p>

                    <button className="upload-cert-btn" onClick={handleAddClick}>
                        <Upload size={18} />
                        <span>Upload First Certificate</span>
                    </button>
                </div>
            </div>
        );
    }

    // Active State Rendering
    return (
        <div className="ihm-certificate-container active-state">
            {/* Toast Notification - only rendered after adding a certificate */}
            {showToast && (
                <div className="toast-notification show">
                    <div className="toast-icon-box">
                        <CheckCircle2 size={24} color="white" />
                    </div>
                    <div className="toast-content">
                        <div className="toast-title">Certificate Added Successfully</div>
                        <div className="toast-message">The IHM Certificate for {safeVesselName} has been verified and added to the registry</div>
                    </div>
                    <div className="toast-actions">
                        <button className="view-btn" onClick={() => activeCert && handleViewCert(activeCert)}>VIEW CERTIFICATE</button>
                        <button className="undo-btn">UNDO</button>
                    </div>
                    <button className="toast-close" onClick={() => setShowToast(false)}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Top Summary Cards (Active State) */}
            <div className="certificate-summary-grid">
                <div className="cert-card active-cert">
                    <div className="cert-card-header">
                        <span className="cert-card-title">Current Certificate</span>
                        <CheckCircle2 size={18} className="status-icon-valid" />
                    </div>
                    <div className="cert-card-value">Valid</div>
                    <div className="cert-status-badge compliant">
                        <div className="dot"></div>
                        COMPLIANT
                    </div>
                </div>

                <div className="cert-card">
                    <div className="cert-card-header">
                        <span className="cert-card-title">Issuing Authority</span>
                        <Landmark size={18} className="cert-card-icon" />
                    </div>
                    <div className="cert-card-value">Lloyd's Regi...</div>
                    <div className="cert-card-sub">Class Society</div>
                </div>

                <div className="cert-card">
                    <div className="cert-card-header">
                        <span className="cert-card-title">Issue Date</span>
                        <Calendar size={18} className="cert-card-icon" />
                    </div>
                    <div className="cert-card-value">12 Jan 2023</div>
                    <div className="cert-card-sub">342 days ago</div>
                </div>

                <div className="cert-card alert-card">
                    <div className="cert-card-header">
                        <span className="cert-card-title">Expiry Date</span>
                        <Clock size={18} className="status-icon-expiry" />
                    </div>
                    <div className="cert-card-value">11 Jan 2028</div>
                    <div className="cert-card-sub highlight">1,482 days remaining</div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="cert-actions-bar">
                <div className="cert-search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search certificates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="add-cert-btn-main" onClick={handleAddClick}>
                    <Plus size={18} />
                    <span>Add New Certificate</span>
                </button>
            </div>

            {/* Accordion Sections */}
            <div className="cert-sections-scroll-area">
                {/* 1. IHM Certificates */}
                <div className={`cert-accordion-item ${expandedSection === 'ihm' ? 'expanded' : ''}`}>
                    <div className="accordion-header" onClick={() => setExpandedSection(expandedSection === 'ihm' ? null : 'ihm')}>
                        <div className="header-left">
                            <div className="header-icon-box"><FileText size={20} color="#3b82f6" /></div>
                            <div className="header-text">
                                <h3>Inventory of Hazardous Materials (IHM) Certificates</h3>
                                <p>Full list of active and pending IHM certification for {safeVesselName}.</p>
                            </div>
                        </div>
                        {expandedSection === 'ihm' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>

                    {expandedSection === 'ihm' && (
                        <div className="accordion-content">
                            <table className="cert-table">
                                <thead>
                                    <tr>
                                        <th>CERTIFICATE NAME</th>
                                        <th>ISSUE DATE</th>
                                        <th>EXPIRY DATE</th>
                                        <th>STATUS</th>
                                        <th className="text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {certificates.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((cert) => (
                                        <tr key={cert.id} className={cert.isNew ? "new-cert-row" : ""}>
                                            <td className="font-medium">
                                                <div className="cert-name-wrapper">
                                                    {cert.name}
                                                    {cert.isNew && <span className="new-badge">NEW</span>}
                                                </div>
                                            </td>
                                            <td>{formatDate(cert.issueDate)}</td>
                                            <td>{formatDate(cert.expiryDate)}</td>
                                            <td>
                                                <span className={`status-pill ${cert.status === 'Valid' ? 'valid' : 'action'}`}>
                                                    {cert.status === 'Valid' ? 'Valid' : 'Action Required'}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                <button className="action-icon-btn" onClick={() => handleViewCert(cert)}><Eye size={16} /></button>
                                                <button className="action-icon-btn" onClick={handleDownload}><Download size={16} /></button>
                                                {cert.status !== 'Valid' ? (
                                                    <button className="renew-btn">RENEW NOW</button>
                                                ) : (
                                                    <button className="action-icon-btn"><RefreshCw size={16} /></button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 2. IHM Part II & III */}
                <div className={`cert-accordion-item ${expandedSection === 'part23' ? 'expanded' : ''}`}>
                    <div className="accordion-header" onClick={() => setExpandedSection(expandedSection === 'part23' ? null : 'part23')}>
                        <div className="header-left">
                            <div className="header-icon-box"><Layers size={20} color="#00B0FA" /></div>
                            <div className="header-text">
                                <h3>IHM Part II & III (Operationally Generated Waste)</h3>
                                <p>Manage operationally generated waste and relevant documentation.</p>
                            </div>
                        </div>
                        {expandedSection === 'part23' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    {expandedSection === 'part23' && (
                        <div className="accordion-content">
                            <div className="data-placeholder-row">
                                <Info size={16} />
                                <span>Specific waste data and disposal records will be listed here.</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Annual Compliance Review */}
                <div className={`cert-accordion-item ${expandedSection === 'annual' ? 'expanded' : ''}`}>
                    <div className="accordion-header" onClick={() => setExpandedSection(expandedSection === 'annual' ? null : 'annual')}>
                        <div className="header-left">
                            <div className="header-icon-box"><CheckCircle2 size={20} color="#10b981" /></div>
                            <div className="header-text">
                                <h3>Annual Compliance Review</h3>
                                <p>Track yearly audits and self-assessment results.</p>
                            </div>
                        </div>
                        {expandedSection === 'annual' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>

                {/* 4. Statement of Compliance (SoC) */}
                <div className={`cert-accordion-item ${expandedSection === 'soc' ? 'expanded' : ''}`}>
                    <div className="accordion-header" onClick={() => setExpandedSection(expandedSection === 'soc' ? null : 'soc')}>
                        <div className="header-left">
                            <div className="header-icon-box"><ShieldCheck size={20} color="#3b82f6" /></div>
                            <div className="header-text">
                                <h3>Statement of Compliance (SoC)</h3>
                            </div>
                        </div>
                        {expandedSection === 'soc' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>

                {/* 5. Archived Certifications */}
                <div className={`cert-accordion-item ${expandedSection === 'archived' ? 'expanded' : ''}`}>
                    <div className="accordion-header" onClick={() => setExpandedSection(expandedSection === 'archived' ? null : 'archived')}>
                        <div className="header-left">
                            <div className="header-icon-box"><RefreshCw size={20} color="#64748b" /></div>
                            <div className="header-text">
                                <h3>Archived Certifications</h3>
                            </div>
                        </div>
                        {expandedSection === 'archived' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IHMCertificateView;
