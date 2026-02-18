import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './DocumentAudit.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    Search,
    ShoppingCart,
    FileText,
    MessageSquare,
    CheckCircle2,
    Flag,
    FileSpreadsheet,
    X,
    Download,
    Mail,
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Link2,
    Image as ImageIcon,
    Paperclip,
    Clock,
    AlertTriangle
} from 'lucide-react';

interface AuditItem {
    id: string;
    supplier: string;
    docType: 'MD' | 'SDOC';
    fileLink: string;
    dateReceived: string;
    clarificationStatus: 'AWAITING CLARIFICATION' | 'RESOLVED' | 'NOT STARTED' | 'ACCEPTED';
    auditDecision?: 'APPROVED' | 'FLAGGED' | 'CLARIFICATION';
}

export default function DocumentAudit() {
    const { imo } = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<AuditItem | null>(null);
    const [isClarificationOpen, setIsClarificationOpen] = useState(false);
    const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
    const [clarificationItem, setClarificationItem] = useState<AuditItem | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastData, setToastData] = useState({ title: '', message: '' });

    const initialAuditItems: AuditItem[] = [
        { id: 'PO-2023-8842', supplier: 'Global Maritime Supplies Ltd', docType: 'MD', fileLink: 'MD_PV_8842.pdf', dateReceived: '24 Oct 2023', clarificationStatus: 'AWAITING CLARIFICATION' },
        { id: 'PO-2023-8845', supplier: 'Nordic Star Engineering', docType: 'SDOC', fileLink: 'SDoC_NS_8845.pdf', dateReceived: '22 Oct 2023', clarificationStatus: 'RESOLVED' },
        { id: 'PO-2023-8901', supplier: 'Oceanic Parts Corp', docType: 'MD', fileLink: 'MD_OP_8901.pdf', dateReceived: '25 Oct 2023', clarificationStatus: 'NOT STARTED' },
        { id: 'PO-2023-8910', supplier: 'Marine Logistics Hub', docType: 'MD', fileLink: 'MD_ML_8910.pdf', dateReceived: '26 Oct 2023', clarificationStatus: 'RESOLVED' },
        { id: 'PO-2023-8922', supplier: 'SeaStar Equipment', docType: 'SDOC', fileLink: 'SDoC_SS_8922.pdf', dateReceived: '27 Oct 2023', clarificationStatus: 'AWAITING CLARIFICATION' },
        { id: 'PO-2023-8935', supplier: 'Horizon Vessels Ltd', docType: 'MD', fileLink: 'MD_HV_8935.pdf', dateReceived: '28 Oct 2023', clarificationStatus: 'NOT STARTED' },
        { id: 'PO-2023-8948', supplier: 'Anchor Marine Services', docType: 'SDOC', fileLink: 'SDoC_AM_8948.pdf', dateReceived: '29 Oct 2023', clarificationStatus: 'RESOLVED' },
        { id: 'PO-2023-8955', supplier: 'BlueOcean Spares', docType: 'MD', fileLink: 'MD_BO_8955.pdf', dateReceived: '30 Oct 2023', clarificationStatus: 'NOT STARTED' },
        { id: 'PO-2023-8962', supplier: 'DeepWater Logistics', docType: 'SDOC', fileLink: 'SDoC_DW_8962.pdf', dateReceived: '01 Nov 2023', clarificationStatus: 'AWAITING CLARIFICATION' },
        { id: 'PO-2023-8975', supplier: 'Portside Supplies', docType: 'MD', fileLink: 'MD_PS_8975.pdf', dateReceived: '02 Nov 2023', clarificationStatus: 'RESOLVED' }
    ];

    const [auditItems, setAuditItems] = useState<AuditItem[]>(initialAuditItems);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const handleAcceptDocument = (item: AuditItem) => {
        setAuditItems(prev => prev.map(i => i.id === item.id ? { ...i, clarificationStatus: 'ACCEPTED' } : i));
        setToastData({
            title: 'Document Accepted Successfully',
            message: `${item.fileLink} has been verified and added to the vessel registry.`
        });
        setShowToast(true);
        if (selectedDoc) setSelectedDoc(null);
    };

    const handleVerifyAll = () => {
        setIsVerified(true);
        setAuditItems(prev => prev.map(item => ({
            ...item,
            clarificationStatus: 'ACCEPTED'
        })));
        setToastData({
            title: 'Bulk Verification Complete',
            message: 'All pending documents have been successfully verified and accepted.'
        });
        setShowToast(true);
    };

    const handleSubmitAudit = () => {
        setIsSubmitted(true);
        setToastData({
            title: 'Audit Submission Complete',
            message: 'Your audit report has been submitted for final review.'
        });
        setShowToast(true);
    };

    const handleOpenClarification = (item: AuditItem | null) => {
        if (!item) return;
        setClarificationItem(item);
        setIsClarificationOpen(true);
        if (selectedDoc) setSelectedDoc(null);
    };

    const handleSendClarification = () => {
        if (!clarificationItem) return;
        setIsClarificationOpen(false);
        setAuditItems(prev => prev.map(i => i.id === clarificationItem.id ? { ...i, clarificationStatus: 'AWAITING CLARIFICATION' } : i));
        setToastData({
            title: 'Clarification Request Sent',
            message: `An email has been sent to ${clarificationItem.supplier} regarding ${clarificationItem.id}`
        });
        setShowToast(true);
    };

    const handleDownload = (filename: string) => {
        const blob = new Blob(['%PDF-1.4\n1 0 obj\n<< /Title (Audit Report) /Body (Sample content for ' + filename + ') >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF'], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleConfirmDiscard = () => {
        setIsDiscardConfirmOpen(false);
        setIsClarificationOpen(false);
        setToastData({
            title: 'Request Discarded',
            message: 'Evidence of the draft clarification request has been cleared.'
        });
        setShowToast(true);
    };

    return (
        <div className="doc-audit-container">
            <Sidebar />
            <main className="doc-audit-main">
                <Header />

                {/* Design-Accurate Notification Toast */}
                {showToast && (
                    <div className="audit-success-toast">
                        <div className="toast-content-wrapper">
                            <div className="toast-icon-green">
                                <CheckCircle2 size={24} fill="#10B981" color="white" />
                            </div>
                            <div className="toast-text-area">
                                <h3>{toastData.title}</h3>
                                <p>{toastData.message}</p>
                            </div>
                        </div>
                        <button className="undo-action-btn" onClick={() => setShowToast(false)}>UNDO</button>
                    </div>
                )}

                <div className="doc-audit-content">
                    {/* Compact Dark Header */}
                    <div className="audit-sub-header">
                        <div className="audit-header-main">
                            <div className="header-title-section">
                                <h1>Document Audit - Pacific Venture</h1>
                                <div className="imo-badge">IMO: <span>{imo || '9448748'}</span></div>
                            </div>
                            <button
                                className={`verify-all-documents-btn ${isVerified ? 'verified' : ''}`}
                                onClick={handleVerifyAll}
                                disabled={isVerified}
                            >
                                <CheckCircle2 size={18} />
                                {isVerified ? 'Documents Verified' : 'Verify All Documents'}
                            </button>
                        </div>
                    </div>

                    <div className="audit-scroll-area">
                        <div className="metrics-grid">
                            <div className="metric-card">
                                <div className="metric-info">
                                    <span className="metric-label">TOTAL POS</span>
                                    <span className="metric-number">42</span>
                                </div>
                                <div className="metric-icon-box cart">
                                    <ShoppingCart size={20} />
                                </div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-info">
                                    <span className="metric-label">PENDING MDS</span>
                                    <span className="metric-number">{isVerified ? '0' : '07'}</span>
                                </div>
                                <div className="metric-icon-box doc">
                                    <FileText size={20} />
                                </div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-info">
                                    <span className="metric-label">PENDING SDOCS</span>
                                    <span className="metric-number">{isVerified ? '0' : '12'}</span>
                                </div>
                                <div className="metric-icon-box sdoc">
                                    <FileSpreadsheet size={20} />
                                </div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-info">
                                    <span className="metric-label">FLAGGED FOR CLARIFICATION</span>
                                    <span className="metric-number highlight">{isVerified ? '0' : '05'}</span>
                                </div>
                                <div className="metric-icon-box msg">
                                    <MessageSquare size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="audit-table-card">
                            <div className="card-header">
                                <h2>Audit Queue</h2>
                                <div className="search-wrapper">
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search POs or Suppliers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="table-container">
                                <table className="audit-table">
                                    <thead>
                                        <tr>
                                            <th>PO ID</th>
                                            <th>SUPPLIER</th>
                                            <th>DOCUMENT TYPE</th>
                                            <th>FILE LINK</th>
                                            <th>DATE RECEIVED</th>
                                            <th>CLARIFICATION STATUS</th>
                                            <th style={{ textAlign: 'center' }}>AUDIT DECISION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditItems.map((item) => (
                                            <tr key={item.id}>
                                                <td className="po-ident">{item.id}</td>
                                                <td className="supplier-name">{item.supplier}</td>
                                                <td>
                                                    <span className="doc-badge-v3">
                                                        {item.docType}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="file-link-v3" onClick={() => setSelectedDoc(item)}>
                                                        <FileText size={16} className="pdf-icon-v3" />
                                                        {item.fileLink}
                                                    </div>
                                                </td>
                                                <td>{item.dateReceived}</td>
                                                <td>
                                                    <span className={`status-pill-v3 ${item.clarificationStatus.toLowerCase().replace(' ', '-')}`}>
                                                        {item.clarificationStatus}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="decision-cell-v3">
                                                        <button
                                                            className={`decision-icon-v3 check ${item.clarificationStatus === 'ACCEPTED' ? 'completed' : ''}`}
                                                            onClick={() => handleAcceptDocument(item)}
                                                        >
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                        <button className="decision-icon-v3 flag">
                                                            <Flag size={18} />
                                                        </button>
                                                        <button
                                                            className="decision-icon-v3 message"
                                                            onClick={() => handleOpenClarification(item)}
                                                        >
                                                            <MessageSquare size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="pagination">
                                <span className="pagination-info">Showing {auditItems.length} of 42 pending PO audits for Pacific Venture</span>
                                <div className="pagination-buttons">
                                    <button className="page-btn" style={{ width: 'auto', padding: '0 16px' }}>Previous</button>
                                    <button className="page-btn active">1</button>
                                    <button className="page-btn">2</button>
                                    <button className="page-btn" style={{ width: 'auto', padding: '0 16px' }}>Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="audit-progress-footer-fixed">
                    <div className="progress-info-v3">
                        <span className="label-v3">AUDIT PROGRESS:</span>
                        <div className="bar-bg-v3">
                            <div className="bar-fill-v3" style={{ width: isVerified ? '100%' : '73.5%' }}></div>
                        </div>
                        <span className="percent-v3">{isVerified ? '100%' : '73.5%'}</span>
                    </div>
                    <div className="metrics-info-v3">
                        <div className="metric-v3">
                            <span className="label-v3">AUDITED:</span>
                            <span className="val-v3">{isVerified ? '42' : '30'}</span>
                        </div>
                        <div className="metric-v3">
                            <span className="label-v3">REMAINING:</span>
                            <span className={`val-v3 ${!isVerified ? 'orange' : ''}`}>{isVerified ? '0' : '12'}</span>
                        </div>
                    </div>
                    <div className="footer-actions-v3">
                        <button className="discard-btn-v3">DISCARD DRAFT</button>
                        <button
                            className={`submit-report-btn-v3 ${isSubmitted ? 'submitted' : ''}`}
                            onClick={handleSubmitAudit}
                            disabled={isSubmitted}
                        >
                            {isSubmitted ? 'SUBMITTED' : 'Submit Audit Report'}
                        </button>
                    </div>
                </div>

                {/* Material Declaration Viewer Modal */}
                {selectedDoc && (
                    <div className="doc-modal-overlay">
                        <div className="doc-modal-container">
                            <div className="doc-modal-header">
                                <div className="header-doc-info">
                                    <div className="pdf-icon-box">
                                        <FileText size={20} color="#EF4444" />
                                    </div>
                                    <div className="doc-meta">
                                        <h3>{selectedDoc.fileLink}</h3>
                                        <p>Material Declaration • {selectedDoc.id}</p>
                                    </div>
                                </div>
                                <button className="close-modal-btn" onClick={() => setSelectedDoc(null)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="doc-modal-body">
                                <div className="md-document-page">
                                    <div className="document-inner-header">
                                        <div className="main-title">
                                            <h1>MATERIAL DECLARATION</h1>
                                            <p>In accordance with IMO Resolution MEPC.269(68)</p>
                                        </div>
                                        <div className="doc-number">
                                            <span>DOCUMENT NO.</span>
                                            <strong>MD-GMS-2023-8842</strong>
                                        </div>
                                    </div>

                                    <div className="info-grid">
                                        <div className="info-section">
                                            <h4>SUPPLIER INFORMATION</h4>
                                            <div className="info-content">
                                                <strong>Global Maritime Supplies Ltd</strong>
                                                <p>124 Harbour Front Way, Suite 400<br />Rotterdam, 3011 AA<br />Netherlands</p>
                                            </div>
                                        </div>
                                        <div className="info-section">
                                            <h4>PRODUCT INFORMATION</h4>
                                            <div className="info-content">
                                                <strong>Marine Grade Valve Assembly - 400 Series</strong>
                                                <p>Part Number: VLV-A-421-XB</p>
                                                <p>Weight: 42.5 kg</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md-table-section">
                                        <h5>TABLE A: MATERIALS LISTED IN APPENDIX 1 OF THE CONVENTION</h5>
                                        <table className="md-inner-table">
                                            <thead>
                                                <tr>
                                                    <th>Material Name</th>
                                                    <th>Threshold Level</th>
                                                    <th>Present Above Threshold?</th>
                                                    <th>Details</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Asbestos</td>
                                                    <td>No Threshold</td>
                                                    <td className="status-no">No</td>
                                                    <td className="italic">None present</td>
                                                </tr>
                                                <tr>
                                                    <td>Ozone Depleting Substances</td>
                                                    <td>No Threshold</td>
                                                    <td className="status-no">No</td>
                                                    <td className="italic">None present</td>
                                                </tr>
                                                <tr>
                                                    <td>Organotin Compounds</td>
                                                    <td>2,500 mg/kg</td>
                                                    <td className="status-no">No</td>
                                                    <td>-</td>
                                                </tr>
                                                <tr>
                                                    <td>Polychlorinated Biphenyls (PCBs)</td>
                                                    <td>50 mg/kg</td>
                                                    <td className="status-pending">PENDING REVIEW</td>
                                                    <td>Trace amounts noted in sealants</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="declaration-section">
                                        <h5>DECLARATION OF CONFORMITY</h5>
                                        <p>
                                            We, Global Maritime Supplies Ltd, hereby declare that the information provided in this Material Declaration is true and correct to the best of our knowledge. We further certify that the products supplied are in full compliance with the relevant environmental regulations as specified in the IMO Hong Kong Convention for the Safe and Environmentally Sound Recycling of Ships.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="doc-modal-footer">
                                <div className="footer-left">
                                    <button className="btn-accept" onClick={() => handleAcceptDocument(selectedDoc)}>
                                        <CheckCircle2 size={18} />
                                        Accept
                                    </button>
                                    <button className="btn-clarification" onClick={() => handleOpenClarification(selectedDoc)}>
                                        <MessageSquare size={18} />
                                        Clarification
                                    </button>
                                </div>
                                <button className="btn-download" onClick={() => handleDownload(selectedDoc.fileLink)}>
                                    <Download size={18} />
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Send Clarification Request Modal */}
                {isClarificationOpen && clarificationItem && (
                    <div className="doc-modal-overlay">
                        <div className="clarification-modal-container">
                            <div className="doc-modal-header">
                                <div className="header-doc-info">
                                    <div className="mail-icon-box">
                                        <Mail size={20} color="#00A3FF" />
                                    </div>
                                    <div className="doc-meta">
                                        <h3>Send Clarification Request</h3>
                                        <p>Finalizing communication for {clarificationItem.id}</p>
                                    </div>
                                </div>
                                <button className="close-modal-btn" onClick={() => setIsClarificationOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="clarification-body">
                                <div className="mail-field">
                                    <span className="field-label">TO</span>
                                    <div className="field-value-pill">
                                        <strong>{clarificationItem.supplier}</strong>
                                        <span className="email-addr">(compliance@globalmaritime.com)</span>
                                    </div>
                                </div>
                                <div className="mail-field">
                                    <span className="field-label">SUBJECT</span>
                                    <div className="field-value-text">
                                        Clarification Required: {clarificationItem.fileLink.replace('.pdf', '')} for {clarificationItem.id}
                                    </div>
                                </div>

                                <div className="mail-toolbar">
                                    <div className="toolbar-group">
                                        <button className="tool-btn"><Bold size={16} /></button>
                                        <button className="tool-btn"><Italic size={16} /></button>
                                        <button className="tool-btn"><Underline size={16} /></button>
                                    </div>
                                    <div className="toolbar-divider" />
                                    <div className="toolbar-group">
                                        <button className="tool-btn"><List size={16} /></button>
                                        <button className="tool-btn"><ListOrdered size={16} /></button>
                                    </div>
                                    <div className="toolbar-divider" />
                                    <div className="toolbar-group">
                                        <button className="tool-btn"><Link2 size={16} /></button>
                                        <button className="tool-btn"><ImageIcon size={16} /></button>
                                    </div>
                                    <div className="toolbar-group right">
                                        <button className="tool-btn"><Paperclip size={16} /></button>
                                    </div>
                                </div>

                                <div className="mail-editor-area">
                                    <p>Dear {clarificationItem.supplier.split(' ')[0]} Team,</p>
                                    <p>We have reviewed the Material Declaration for {clarificationItem.id} and require further clarification on Table A: PCBs.</p>
                                    <p>The submitted documentation does not clearly specify the concentration of polychlorinated biphenyls for the electrical components listed in Annex II. Specifically, we noted that the threshold levels reported for the 'Main Control Unit' (GMS-MCU-102) seem inconsistent with international regulatory requirements for this class of maritime hardware.</p>
                                    <p>Please provide additional supporting documentation from the component manufacturer or re-verify the threshold levels against current IHM guidelines. Failure to provide this clarification may delay the certification process for the vessel 'Pacific Venture'.</p>

                                    <div className="upload-docs-center-btn">
                                        UPLOAD DOCUMENTS
                                    </div>

                                    <div className="signature-area">
                                        <p>Regards,</p>
                                        <strong>IHM Administrator</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="doc-modal-footer">
                                <div className="footer-left">
                                    <button className="btn-send-request" onClick={handleSendClarification}>
                                        <Mail size={18} />
                                        Send Request
                                    </button>
                                    <button className="btn-discard" onClick={() => setIsDiscardConfirmOpen(true)}>
                                        Discard
                                    </button>
                                </div>
                                <div className="auto-save-info">
                                    <div className="save-text">
                                        <span>AUTO-SAVED</span>
                                        <p>2:45 PM today</p>
                                    </div>
                                    <Clock size={16} color="#94A3B8" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Discard Confirmation Modal */}
                {isDiscardConfirmOpen && (
                    <div className="confirm-overlay-v3">
                        <div className="discard-confirm-card">
                            <div className="confirm-header">
                                <div className="warn-icon">
                                    <AlertTriangle size={20} color="#F59E0B" />
                                </div>
                                <h2>Discard Request</h2>
                            </div>
                            <div className="confirm-body">
                                <p>Are you sure you want to discard this clarification request? Any unsaved changes will be lost.</p>
                            </div>
                            <div className="confirm-footer">
                                <button className="btn-cancel-discard" onClick={() => setIsDiscardConfirmOpen(false)}>
                                    No, Keep Draft
                                </button>
                                <button className="btn-confirm-discard" onClick={handleConfirmDiscard}>
                                    Yes, Discard
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
