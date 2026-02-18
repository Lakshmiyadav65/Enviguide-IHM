import { useState, useEffect } from 'react';
import './PendingAudits.css';
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

        // Check for recently added audit from UploadPurchaseOrder
        const recent = localStorage.getItem('recentlyAddedAudit');
        if (recent) {
            const parsedRecent = JSON.parse(recent);
            setAllRecords([parsedRecent, ...initialRecords]);
            // Optional: clear it after reading
            // localStorage.removeItem('recentlyAddedAudit'); 
        } else {
            setAllRecords(initialRecords);
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

    const handleEdit = (imoNumber: string) => console.log('Edit:', imoNumber);

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
            setAllRecords(prev => prev.map(r =>
                r.imoNumber === selectedVessel.imoNumber ? { ...r, status: 'PENDING REVIEW' } : r
            ));

            // Persist to localStorage for Pending Reviews page
            const existingSent = JSON.parse(localStorage.getItem('sentToReview') || '[]');
            const newSent = {
                ...selectedVessel,
                reviewStatus: 'Pending',
                assignedTo: { name: 'Unassigned', avatar: 'https://i.pravatar.cc/150?u=unassigned' }
            };
            localStorage.setItem('sentToReview', JSON.stringify([...existingSent, newSent]));
        }
        setShowReviewModal(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);
    };

    const handleUndo = () => {
        if (selectedVessel) {
            setAllRecords(prev => prev.map(r =>
                r.imoNumber === selectedVessel.imoNumber ? { ...r, status: undefined } : r
            ));
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
                                                            <button className="action-btn edit-btn" onClick={() => handleEdit(record.imoNumber)} title="Edit"><Edit2 size={16} /></button>
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
            </main>
        </div>
    );
}
