import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Send, Filter, Download, Package } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './Registered.css'; 

interface SupplierItem {
    id: string;
    supplierName: string;
    category: string;
    location: string;
    contactEmail: string;
    rating: string;
}

const MOCK_SUPPLIERS: SupplierItem[] = [
    { id: '1', supplierName: 'Wilhelmsen Ships Service', category: 'Marine Products', location: 'Norway', contactEmail: 'supply@wilhelmsen.com', rating: 'A+' },
    { id: '2', supplierName: 'Wärtsilä Corporation', category: 'Engine Parts', location: 'Finland', contactEmail: 'support@wartsila.com', rating: 'A' },
    { id: '3', supplierName: 'ABB Marine & Ports', category: 'Electrical', location: 'Switzerland', contactEmail: 'marine.service@abb.com', rating: 'A+' },
    { id: '4', supplierName: 'Alfa Laval', category: 'Heat Transfer', location: 'Sweden', contactEmail: 'info@alfalaval.com', rating: 'A' },
    { id: '5', supplierName: 'Fuji Trading Co.', category: 'General Stores', location: 'Japan', contactEmail: 'sales@fujitrading.co.jp', rating: 'B+' },
];

export default function Supplier() {
    const [search, setSearch] = useState('');

    const filteredSuppliers = MOCK_SUPPLIERS.filter(s => 
        s.supplierName.toLowerCase().includes(search.toLowerCase()) || 
        s.category.toLowerCase().includes(search.toLowerCase()) ||
        s.location.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="registered-container">
            <Sidebar />
            <main className="registered-main">
                <Header />
                <div className="registered-content">
                    <div className="page-header-standard">
                        <div className="header-title-area">
                            <div className="breadcrumb-mini">MENU / SUPPLIER</div>
                            <h1>Managed Suppliers</h1>
                            <p>Directory of approved marine equipment and service suppliers.</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-secondary-standard"><Download size={16} /> Export CSV</button>
                            <button className="btn-primary-standard"><Plus size={18} /> Add New Supplier</button>
                        </div>
                    </div>

                    <div className="table-filter-bar">
                        <div className="search-wrapper-standard">
                            <Search size={18} className="search-icon-standard" />
                            <input 
                                type="text" 
                                placeholder="Search suppliers by name, category or region..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="filter-actions-standard">
                            <button className="filter-pill-btn"><Filter size={14} /> Category</button>
                        </div>
                    </div>

                    <div className="standard-table-container">
                        <div className="table-scroll-wrapper">
                            <table className="standard-table">
                                <thead>
                                    <tr>
                                        <th className="th-action">Action</th>
                                        <th>Supplier Name</th>
                                        <th>Category</th>
                                        <th>Location</th>
                                        <th>Contact Email</th>
                                        <th>Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSuppliers.map((s) => (
                                        <tr key={s.id}>
                                            <td className="action-column">
                                                <div className="action-buttons">
                                                    <button className="action-btn edit-btn" title="Edit"><Edit2 size={14} /></button>
                                                    <button className="action-btn send-btn" title="Send"><Send size={14} /></button>
                                                    <button className="action-btn delete-btn" title="Delete"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                            <td className="font-bold-main">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Package size={14} color="#00B0FA" /> {s.supplierName}
                                                </div>
                                            </td>
                                            <td><span className="doc-type-tag">{s.category}</span></td>
                                            <td>{s.location}</td>
                                            <td className="email-cell">{s.contactEmail}</td>
                                            <td>
                                                <span style={{ 
                                                    padding: '4px 8px', 
                                                    background: s.rating.startsWith('A') ? '#ECFDF5' : '#FEF3C7',
                                                    color: s.rating.startsWith('A') ? '#059669' : '#D97706',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    fontWeight: 800
                                                }}>
                                                    {s.rating}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredSuppliers.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="empty-table-msg">No suppliers found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="table-pagination-standard">
                            <span className="pagination-text">Showing {filteredSuppliers.length} approved suppliers</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
