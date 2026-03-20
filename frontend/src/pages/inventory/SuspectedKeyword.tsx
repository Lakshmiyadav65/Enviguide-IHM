import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Send, Filter, AlertCircle, Tag } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import '../auth/Registered.css'; 

interface KeywordItem {
    id: string;
    keyword: string;
    hazardType: string;
    severity: string;
    lastUpdated: string;
}

const MOCK_KEYWORDS: KeywordItem[] = [
    { id: '1', keyword: 'ASBESTOS', hazardType: 'Health Hazard', severity: 'Critical', lastUpdated: '2026-01-10' },
    { id: '2', keyword: 'PCB - POLYCHLORINATED BIPHENYLS', hazardType: 'Environmental', severity: 'High', lastUpdated: '2026-02-15' },
    { id: '3', keyword: 'HEXAVALENT CHROMIUM', hazardType: 'Chemical', severity: 'High', lastUpdated: '2025-12-05' },
    { id: '4', keyword: 'CADMIUM COMPOUNDS', hazardType: 'Heavy Metal', severity: 'Medium', lastUpdated: '2026-03-01' },
    { id: '5', keyword: 'CHLOROFLUOROCARBONS', hazardType: 'Ozone Depleting', severity: 'Medium', lastUpdated: '2026-03-10' },
];

export default function SuspectedKeyword() {
    const [search, setSearch] = useState('');

    const filteredKeywords = MOCK_KEYWORDS.filter(k => 
        k.keyword.toLowerCase().includes(search.toLowerCase()) || 
        k.hazardType.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="registered-container">
            <Sidebar />
            <main className="registered-main">
                <Header />
                <div className="registered-content">
                    <div className="page-header-standard">
                        <div className="header-title-area">
                            <div className="breadcrumb-mini">MENU / SUSPECTED KEYWORD</div>
                            <h1>Suspected Keywords</h1>
                            <p>Global list of keywords indicating potential Presence of Hazardous Materials (IHM).</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-primary-standard"><Plus size={18} /> Add New Keyword</button>
                        </div>
                    </div>

                    <div className="table-filter-bar">
                        <div className="search-wrapper-standard">
                            <Search size={18} className="search-icon-standard" />
                            <input 
                                type="text" 
                                placeholder="Search targeted keywords..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="filter-actions-standard">
                            <button className="filter-pill-btn"><Filter size={14} /> Hazard Type</button>
                        </div>
                    </div>

                    <div className="standard-table-container">
                        <div className="table-scroll-wrapper">
                            <table className="standard-table">
                                <thead>
                                    <tr>
                                        <th className="th-action">Action</th>
                                        <th>Keyword</th>
                                        <th>Hazard Type</th>
                                        <th>Severity Level</th>
                                        <th>Last System Update</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredKeywords.map((k) => (
                                        <tr key={k.id}>
                                            <td className="action-column">
                                                <div className="action-buttons">
                                                    <button className="action-btn edit-btn" title="Edit"><Edit2 size={14} /></button>
                                                    <button className="action-btn send-btn" title="Send"><Send size={14} /></button>
                                                    <button className="action-btn delete-btn" title="Delete"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                            <td className="font-bold-main">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Tag size={16} color="#00B0FA" />
                                                    <span style={{ letterSpacing: '0.02em' }}>{k.keyword}</span>
                                                </div>
                                            </td>
                                            <td><span className="doc-type-tag">{k.hazardType}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <AlertCircle size={14} color={k.severity === 'Critical' ? '#EF4444' : '#F59E0B'} />
                                                    <span style={{ 
                                                        color: k.severity === 'Critical' ? '#EF4444' : '#F59E0B',
                                                        fontWeight: 700,
                                                        fontSize: '12px'
                                                    }}>{k.severity}</span>
                                                </div>
                                            </td>
                                            <td className="date-cell">{k.lastUpdated}</td>
                                        </tr>
                                    ))}
                                    {filteredKeywords.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="empty-table-msg">No keywords found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="table-pagination-standard">
                            <span className="pagination-text">Showing {filteredKeywords.length} high-risk keywords</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
