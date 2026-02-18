import { useState, useEffect } from 'react';
import './PendingReviews.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Download, Eye, Edit2, Trash2, Ship } from 'lucide-react';

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

export default function PendingReviews() {
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const [allRecords, setAllRecords] = useState<ReviewRecord[]>([]);

    useEffect(() => {
        // Sample records as per design - Expanded to 50
        const reviewers = [
            { name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?u=sarah' },
            { name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?u=michael' },
            { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
            { name: 'Emily White', avatar: 'https://i.pravatar.cc/150?u=emily' }
        ];

        const vesselNames = ['Pacific Venture', 'Nordic Star', 'Ocean Atlas', 'Arctic Peak', 'Baltic Sea', 'Caspian Ray', 'Indian Wave', 'Golden Gate', 'Silver Stream', 'Emerald Wave'];

        const initialRecords: ReviewRecord[] = Array.from({ length: 50 }).map((_, idx) => ({
            imoNumber: (9448748 - idx * 1234).toString(),
            vesselName: vesselNames[idx % vesselNames.length],
            totalPO: Math.floor(Math.random() * 50) + 10,
            totalItems: Math.floor(Math.random() * 2000) + 200,
            reviewStatus: idx % 2 === 0 ? 'In Review' : 'Pending',
            assignedTo: reviewers[idx % reviewers.length],
            createDate: `2023-11-${((idx + 1) % 28) + 1}`
        }));

        // Load sent items from Pending Audits
        const sentItems = JSON.parse(localStorage.getItem('sentToReview') || '[]');
        setAllRecords([...sentItems, ...initialRecords]);
    }, []);

    // Filtering logic (only search if needed, but removing the bars as requested)
    const filteredRecords = allRecords;

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
                        <button className="export-btn">
                            <Download size={18} />
                            EXPORT LIST
                        </button>
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
                                                    <button className="action-btn" title="View"><Eye size={18} /></button>
                                                    <button className="action-btn" title="Edit"><Edit2 size={16} /></button>
                                                    <button className="action-btn delete" title="Delete"><Trash2 size={16} /></button>
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
        </div>
    );
}
