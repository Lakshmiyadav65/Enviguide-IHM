import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PendingReviews.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Download, Eye, Edit2, Trash2, Ship, X, Search } from 'lucide-react';

interface ReviewRecord {
    imoNumber: string;
    vesselName: string;
    totalPO: number;
    totalItems: number;
    reviewStatus: 'In Review' | 'Pending';
    assignedTo: {
        name: string;
        avatar: string;
    };
    createDate: string;
}

interface ReviewEditorProps {
    record: ReviewRecord;
    onClose: () => void;
    onSave: (updated: ReviewRecord) => void;
}

const ReviewEditor = ({ record, onClose, onSave }: ReviewEditorProps) => {
    const [formData, setFormData] = useState({ ...record });

    return (
        <>
            <div className="modal-backdrop-blur" onClick={onClose} />
            <div className="send-review-modal">
                <div className="send-review-header">
                    <h2>EDIT REVIEW RECORD</h2>
                    <button className="close-btn-white" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="send-review-body">
                    <h3>Modify <span className="vessel-highlight">{record.vesselName}</span></h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '4px' }}>VESSEL NAME</label>
                            <input
                                type="text"
                                value={formData.vesselName}
                                onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
                                style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: '6px' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '4px' }}>TOTAL PO</label>
                                <input
                                    type="number"
                                    value={formData.totalPO}
                                    onChange={(e) => setFormData({ ...formData, totalPO: parseInt(e.target.value) })}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: '6px' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '4px' }}>TOTAL ITEMS</label>
                                <input
                                    type="number"
                                    value={formData.totalItems}
                                    onChange={(e) => setFormData({ ...formData, totalItems: parseInt(e.target.value) })}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: '6px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="send-review-footer">
                    <button className="btn-text-cancel" onClick={onClose}>CANCEL</button>
                    <button className="btn-primary-send" onClick={() => onSave(formData)}>
                        SAVE CHANGES
                    </button>
                </div>
            </div>
        </>
    );
};

export default function PendingReviews() {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const [allRecords, setAllRecords] = useState<ReviewRecord[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingImo, setDeletingImo] = useState<string | null>(null);
    const [editingRecord, setEditingRecord] = useState<ReviewRecord | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Sample records as per design - 150 Diverse Records for testing scale
        const reviewers = [
            { name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?u=sarah' },
            { name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?u=michael' },
            { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
            { name: 'Emily White', avatar: 'https://i.pravatar.cc/150?u=emily' },
            { name: 'David Wilson', avatar: 'https://i.pravatar.cc/150?u=david' },
            { name: 'Jessica Brown', avatar: 'https://i.pravatar.cc/150?u=jessica' }
        ];

        const vesselPool = [
            'Pacific Venture', 'Nordic Star', 'Ocean Atlas', 'Arctic Peak',
            'Baltic Sea', 'Caspian Ray', 'Indian Wave', 'Golden Gate',
            'Silver Stream', 'Emerald Wave', 'Midnight Sun', 'Morning Star',
            'Polaris Express', 'Equator Line', 'Horizon Spirit', 'Deep Sea Explorer',
            'Navigator One', 'Crested Wave', 'Tidal Surge', 'Blue Horizon',
            'Maersk Advancer', 'MSC Isabella', 'Ever Given II', 'CMA CGM Rivoli',
            'Hapag-Lloyd Algeciras', 'COSCO Shipping Universe', 'ONE Minato',
            'Yang Ming Wellhead', 'Hyundai Pride', 'ZIM Rotterdam',
            'Glory of the Seas', 'Storm Runner', 'Arctic Mariner', 'Neptune Chariot',
            'Stolt Tanker 01', 'Berge Bulk 4', 'Global Explorer', 'Sea Sapphire',
            'Iron Maiden', 'Viking Quest', 'Black Pearl', 'Flying Dutchman'
        ];

        const generateRecords = (): ReviewRecord[] => {
            return Array.from({ length: 150 }).map((_, idx) => ({
                imoNumber: (9800000 + idx * 432).toString(),
                vesselName: vesselPool[idx % vesselPool.length],
                totalPO: Math.floor(Math.random() * 95) + 5,
                totalItems: Math.floor(Math.random() * 4500) + 120,
                reviewStatus: idx % 4 === 0 ? 'Pending' : 'In Review',
                assignedTo: reviewers[idx % reviewers.length],
                createDate: `2023-11-${((idx + 5) % 28) + 1}`
            }));
        };

        const storedSent = localStorage.getItem('sentToReview');

        if (!storedSent) {
            // No data at all, generate fresh 150
            const newSet = generateRecords();
            setAllRecords(newSet);
            localStorage.setItem('sentToReview', JSON.stringify(newSet));
        } else {
            const parsedSent = JSON.parse(storedSent) as ReviewRecord[];
            // If we have some data but want to ensure we have enough for testing (150)
            if (parsedSent.length < 150) {
                const dummies = generateRecords();
                // Merge carefully: only add dummies if IMO doesn't exist in existing set
                const existingImos = new Set(parsedSent.map(r => r.imoNumber));
                const uniqueDummies = dummies.filter(d => !existingImos.has(d.imoNumber));

                const merged = [...parsedSent, ...uniqueDummies].slice(0, Math.max(150, parsedSent.length));
                setAllRecords(merged);
                localStorage.setItem('sentToReview', JSON.stringify(merged));
            } else {
                setAllRecords(parsedSent);
            }
        }
    }, []);

    const handleDelete = (imo: string) => {
        setDeletingImo(imo);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deletingImo) {
            const updated = allRecords.filter(r => r.imoNumber !== deletingImo);
            setAllRecords(updated);
            localStorage.setItem('sentToReview', JSON.stringify(updated));
        }
        setShowDeleteModal(false);
        setDeletingImo(null);
    };

    const handleEditSave = (updated: ReviewRecord) => {
        const updatedList = allRecords.map(r => r.imoNumber === updated.imoNumber ? updated : r);
        setAllRecords(updatedList);
        localStorage.setItem('sentToReview', JSON.stringify(updatedList));
        setEditingRecord(null);
    };

    // Filtering logic
    const filteredRecords = allRecords.filter(record =>
        record.vesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.imoNumber.includes(searchQuery)
    );

    // Reset pagination on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Pagination logic
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, startIndex + recordsPerPage);

    return (
        <div className="pending-reviews-container">
            <Sidebar />
            <main className="pending-reviews-main">
                <Header />

                <div className="pending-reviews-content">
                    {/* Header Section */}
                    <div className="registry-header">
                        <div className="header-title-area">
                            <h1>Pending Reviews Registry</h1>
                            <p>Audit submissions awaiting administrative verification and quality review.</p>
                        </div>
                        <div className="header-actions">
                            <div className="search-wrapper">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search Vessel Name or IMO..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="export-btn">
                                <Download size={18} />
                                EXPORT LIST
                            </button>
                        </div>
                    </div>

                    {/* Registry Table Card - Full Width */}
                    <div className="registry-table-card" style={{ width: '100%', maxWidth: 'none' }}>
                        <div className="table-wrapper">
                            <table className="registry-table">
                                <thead>
                                    <tr>
                                        <th>IMO NUMBER</th>
                                        <th>VESSEL NAME</th>
                                        <th>TOTAL PO</th>
                                        <th>TOTAL ITEMS</th>
                                        <th>REVIEW STATUS</th>
                                        <th>REVIEW ASSIGNED TO</th>
                                        <th style={{ textAlign: 'center' }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRecords.map((record, idx) => (
                                        <tr key={record.imoNumber + idx}>
                                            <td className="imo-cell">{record.imoNumber}</td>
                                            <td className="vessel-cell">
                                                <div className="vessel-icon-wrapper">
                                                    <Ship size={16} />
                                                </div>
                                                <span className="vessel-name">{record.vesselName}</span>
                                            </td>
                                            <td>{record.totalPO}</td>
                                            <td>{record.totalItems.toLocaleString()}</td>
                                            <td>
                                                <span className={`status-badge ${record.reviewStatus.toLowerCase().replace(' ', '-')}`}>
                                                    {record.reviewStatus}
                                                </span>
                                            </td>
                                            <td className="assigned-cell">
                                                <img src={record.assignedTo.avatar} alt="" className="reviewer-avatar" />
                                                <span className="reviewer-name">{record.assignedTo.name}</span>
                                            </td>
                                            <td className="action-cell">
                                                <div className="action-group">
                                                    <button
                                                        className="action-btn"
                                                        title="View"
                                                        onClick={() => navigate(`/administration/review-detail/${record.imoNumber}`)}
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        className="action-btn"
                                                        title="Edit"
                                                        onClick={() => setEditingRecord(record)}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        title="Delete"
                                                        onClick={() => handleDelete(record.imoNumber)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Card Pagination Footer - Unified Style with Labels */}
                        <div className="table-footer">
                            <span className="pagination-info">
                                Showing {startIndex + 1} to {Math.min(startIndex + recordsPerPage, filteredRecords.length)} of {filteredRecords.length} pending reviews
                            </span>
                            <div className="pagination-buttons">
                                <button className="page-btn" style={{ width: 'auto', padding: '0 12px' }} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</button>
                                {[...Array(totalPages)].map((_, idx) => {
                                    const pageNum = idx + 1;
                                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                        return (
                                            <button
                                                key={pageNum}
                                                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) return <span key={pageNum} className="pagination-dots">...</span>;
                                    return null;
                                })}
                                <button className="page-btn" style={{ width: 'auto', padding: '0 12px' }} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Footer Bar (Green bar at bottom) */}
                <div className="summary-footer-bar">
                    <div className="summary-items">
                        <div className="summary-item">
                            <span className="summary-label">TOTAL NUMBER OF POS:</span>
                            <span className="summary-value">132</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">MDS REQUESTED:</span>
                            <span className="summary-value">482</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">MDS RECEIVED:</span>
                            <span className="summary-value">412</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">MDS PENDING:</span>
                            <span className="summary-value">70</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">HM GREEN QTY:</span>
                            <span className="summary-value highlight-green">386</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">HM RED QTY:</span>
                            <span className="summary-value highlight-red">24</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">PCHM QTY:</span>
                            <span className="summary-value">18</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals & Overlays */}
            {editingRecord && (
                <ReviewEditor
                    record={editingRecord}
                    onClose={() => setEditingRecord(null)}
                    onSave={handleEditSave}
                />
            )}

            {showDeleteModal && (
                <>
                    <div className="modal-backdrop-blur" onClick={() => setShowDeleteModal(false)} />
                    <div className="send-review-modal">
                        <div className="send-review-header" style={{ background: '#EF4444' }}>
                            <h2>DELETE RECORD</h2>
                            <button className="close-btn-white" onClick={() => setShowDeleteModal(false)}><X size={18} /></button>
                        </div>
                        <div className="send-review-body">
                            <h3>Permanently delete this review record?</h3>
                            <p>This action will remove all audit data for this vessel from the review registry. This cannot be undone.</p>
                        </div>
                        <div className="send-review-footer">
                            <button className="btn-text-cancel" onClick={() => setShowDeleteModal(false)}>CANCEL</button>
                            <button className="btn-primary-send" style={{ background: '#EF4444', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }} onClick={confirmDelete}>
                                YES, DELETE
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
