import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MDSdocAudit.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Download, Eye, Ship, Search } from 'lucide-react';

interface AuditRecord {
    imoNumber: string;
    vesselName: string;
    totalPOs: number;
    pendingMDS: number;
    pendingSdocs: number;
    clarificationStatus: 'Awaiting Clarification' | 'Resolved';
    lastSubmissionDate: string;
}

export default function MDSdocAudit() {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const [allRecords, setAllRecords] = useState<AuditRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const vesselNames = ['Pacific Venture', 'Nordic Star', 'Ocean Atlas', 'Arctic Peak', 'Baltic Sea', 'Caspian Ray', 'Indian Wave', 'Golden Gate', 'Silver Stream', 'Emerald Wave'];

        // Match specific design records first
        const designRecords: AuditRecord[] = [
            {
                imoNumber: '9448748',
                vesselName: 'Pacific Venture',
                totalPOs: 42,
                pendingMDS: 8,
                pendingSdocs: 12,
                clarificationStatus: 'Awaiting Clarification',
                lastSubmissionDate: '24 Oct 2023'
            },
            {
                imoNumber: '9311234',
                vesselName: 'Nordic Star',
                totalPOs: 15,
                pendingMDS: 3,
                pendingSdocs: 3,
                clarificationStatus: 'Resolved',
                lastSubmissionDate: '22 Oct 2023'
            }
        ];

        // Fill remaining up to 150 records
        const fillerRecords: AuditRecord[] = Array.from({ length: 148 }).map((_, idx) => ({
            imoNumber: (9448748 - (idx + 2) * 1234).toString(),
            vesselName: vesselNames[(idx + 2) % vesselNames.length],
            totalPOs: Math.floor(Math.random() * 60) + 10,
            pendingMDS: [5, 2, 1, 9, 4, 3][idx % 6],
            pendingSdocs: [7, 4, 3, 11, 6, 2][idx % 6],
            clarificationStatus: idx % 3 === 0 ? 'Awaiting Clarification' : 'Resolved',
            lastSubmissionDate: `${20 - (idx % 15)} Oct 2023`
        }));

        setAllRecords([...designRecords, ...fillerRecords]);
    }, []);

    const filteredRecords = allRecords.filter(record =>
        record.vesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.imoNumber.includes(searchQuery)
    );

    // Reset pagination on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, startIndex + recordsPerPage);

    return (
        <div className="md-sdoc-container">
            <Sidebar />
            <main className="md-sdoc-main">
                <Header />

                <div className="md-sdoc-content">
                    <div className="md-header">
                        <div className="md-title-area">
                            <h1>MD SDoC Audit Registry</h1>
                            <p>Registry of Material Declarations and Supplier's Declaration of Conformity pending audit.</p>
                        </div>
                        <div className="md-header-actions">
                            <div className="registry-search-wrapper">
                                <Search size={22} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search Vessel Name or IMO..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="export-audit-btn">
                                <Download size={18} />
                                Export Audit List
                            </button>
                        </div>
                    </div>

                    <div className="registry-card" style={{ marginBottom: 0 }}>
                        <div className="table-scroll-wrapper" style={{ overflowX: 'auto' }}>
                            <table className="md-table">
                                <thead>
                                    <tr>
                                        <th>IMO NUMBER</th>
                                        <th>VESSEL NAME</th>
                                        <th>TOTAL POS</th>
                                        <th style={{ whiteSpace: 'nowrap' }}>PENDING MDS</th>
                                        <th style={{ whiteSpace: 'nowrap' }}>PENDING SDOCS</th>
                                        <th>CLARIFICATION STATUS</th>
                                        <th>LAST SUBMISSION DATE</th>
                                        <th style={{ textAlign: 'center' }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRecords.map((record) => (
                                        <tr key={record.imoNumber}>
                                            <td className="imo-cell">{record.imoNumber}</td>
                                            <td className="vessel-cell">
                                                <div className="vessel-icon">
                                                    <Ship size={16} />
                                                </div>
                                                <span className="vessel-name">{record.vesselName}</span>
                                            </td>
                                            <td>{record.totalPOs}</td>
                                            <td>
                                                <div className="pending-mds-badge" style={{ whiteSpace: 'nowrap' }}>
                                                    <div className="badge-dot" />
                                                    {record.pendingMDS} Pending
                                                </div>
                                            </td>
                                            <td>
                                                <div className="pending-sdoc-badge" style={{ whiteSpace: 'nowrap' }}>
                                                    <div className="badge-dot" />
                                                    {record.pendingSdocs} Pending
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`clarification-badge ${record.clarificationStatus === 'Awaiting Clarification' ? 'awaiting' : 'resolved'}`}>
                                                    {record.clarificationStatus === 'Awaiting Clarification' ? 'AWAITING CLARIFICATION' : 'RESOLVED'}
                                                </span>
                                            </td>
                                            <td>{record.lastSubmissionDate}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    className="action-btn"
                                                    style={{ background: 'none', border: 'none', color: '#0088CC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}
                                                    onClick={() => navigate(`/administration/document-audit/${record.imoNumber}`)}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="pagination">
                            <span className="pagination-info">
                                Showing {startIndex + 1} to {Math.min(startIndex + recordsPerPage, filteredRecords.length)} of {filteredRecords.length} records in audit phase
                            </span>
                            <div className="pagination-buttons">
                                <button className="page-btn" style={{ width: 'auto', padding: '0 16px' }} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</button>
                                {[...Array(totalPages)].map((_, idx) => {
                                    const pageNum = idx + 1;
                                    // Show first, last, and pages around current
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
                                <button className="page-btn" style={{ width: 'auto', padding: '0 16px' }} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metrics Summary footer (Bottom photograph area) */}
                <div className="metrics-footer-bar">
                    <div className="metric-items">
                        <div className="metric-item">
                            <span className="metric-label">TOTAL POS:</span>
                            <span className="metric-value">57</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">MDS REQUESTED:</span>
                            <span className="metric-value">202</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">MDS RECEIVED:</span>
                            <span className="metric-value">187</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">MDS PENDING:</span>
                            <span className="metric-value">15</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">HM GREEN:</span>
                            <span className="metric-value green">172</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">HM RED:</span>
                            <span className="metric-value red">11</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">PCHM QTY:</span>
                            <span className="metric-value">18</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
