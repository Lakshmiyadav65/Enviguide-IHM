import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Send, Filter, Download, UserCheck } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import './Ownership.css'; // Reusing established styles

interface ManagerItem {
    id: string;
    managerName: string;
    responsiblePerson: string;
    email: string;
    vesselsManaged: number;
    officeLocation: string;
}

const MOCK_MANAGERS: ManagerItem[] = [
    { id: '1', managerName: 'Bernhard Schulte Shipmanagement', responsiblePerson: 'Klaus Schmidt', email: 'k.schmidt@bs-shipmanagement.com', vesselsManaged: 32, officeLocation: 'Limassol, Cyprus' },
    { id: '2', managerName: 'V.Ships Greece', responsiblePerson: 'Nikos Papadopoulos', email: 'nikos.p@vships.com', vesselsManaged: 18, officeLocation: 'Athens, Greece' },
    { id: '3', managerName: 'Columbia Shipmanagement', responsiblePerson: 'Markus Weber', email: 'm.weber@columbia-ship.com', vesselsManaged: 25, officeLocation: 'Hamburg, Germany' },
    { id: '4', managerName: 'Thome Ship Management', responsiblePerson: 'Li Wei', email: 'li.wei@thome.com.sg', vesselsManaged: 40, officeLocation: 'Singapore' },
    { id: '5', managerName: 'Wilhelmsen Ship Management', responsiblePerson: 'Arne Jensen', email: 'arne.j@wilhelmsen.com', vesselsManaged: 55, officeLocation: 'Oslo, Norway' },
];

export default function OwnershipManager() {
    const [search, setSearch] = useState('');

    const filteredManagers = MOCK_MANAGERS.filter(m => 
        m.managerName.toLowerCase().includes(search.toLowerCase()) || 
        m.responsiblePerson.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="registered-container">
            <Sidebar />
            <main className="registered-main">
                <Header />
                <div className="registered-content">
                    <div className="page-header-standard">
                        <div className="header-title-area">
                            <div className="breadcrumb-mini">MENU / OWNERSHIP MANAGER</div>
                            <h1>Ownership Managers</h1>
                            <p>Manage and track technical and commercial vessel management entities.</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-secondary-standard"><Download size={16} /> Export</button>
                            <button className="btn-primary-standard"><Plus size={18} /> Add Manager</button>
                        </div>
                    </div>

                    <div className="table-filter-bar">
                        <div className="search-wrapper-standard">
                            <Search size={18} className="search-icon-standard" />
                            <input 
                                type="text" 
                                placeholder="Search managers by name or email..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="filter-actions-standard">
                            <button className="filter-pill-btn"><Filter size={14} /> All Regions</button>
                        </div>
                    </div>

                    <div className="standard-table-container">
                        <div className="table-scroll-wrapper">
                            <table className="standard-table">
                                <thead>
                                    <tr>
                                        <th className="th-action">Action</th>
                                        <th>Manager Name</th>
                                        <th>Responsible Person</th>
                                        <th>Email</th>
                                        <th>Vessels Managed</th>
                                        <th>Office Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredManagers.map((m) => (
                                        <tr key={m.id}>
                                            <td className="action-column">
                                                <div className="action-buttons">
                                                    <button className="action-btn edit-btn" title="Edit"><Edit2 size={14} /></button>
                                                    <button className="action-btn send-btn" title="Send"><Send size={14} /></button>
                                                    <button className="action-btn delete-btn" title="Delete"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                            <td className="font-bold-main">{m.managerName}</td>
                                            <td>{m.responsiblePerson}</td>
                                            <td className="email-cell">{m.email}</td>
                                            <td className="vessel-count-cell">
                                                <div className="vessel-indicator">
                                                    <UserCheck size={14} /> {m.vesselsManaged}
                                                </div>
                                            </td>
                                            <td>{m.officeLocation}</td>
                                        </tr>
                                    ))}
                                    {filteredManagers.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="empty-table-msg">No managers found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="table-pagination-standard">
                            <span className="pagination-text">Showing {filteredManagers.length} management records</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
