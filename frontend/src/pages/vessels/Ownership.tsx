import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Send, Filter, Download, Briefcase } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import './Ownership.css';

interface OwnershipItem {
    id: string;
    ownerName: string;
    contactPerson: string;
    email: string;
    totalVessels: number;
    headquarters: string;
}

const MOCK_OWNERS: OwnershipItem[] = [
    { id: '1', ownerName: 'Thor Shipping Limited', contactPerson: 'Erik Thorson', email: 'erik.t@thorshipping.com', totalVessels: 12, headquarters: 'Oslo, Norway' },
    { id: '2', ownerName: 'Hapag-Lloyd Aktiengesellschaft', contactPerson: 'Hans Mueller', email: 'h.mueller@hapag-lloyd.de', totalVessels: 45, headquarters: 'Hamburg, Germany' },
    { id: '3', ownerName: 'Maersk Line', contactPerson: 'SÃ¸ren Skou', email: 's.skou@maersk.com', totalVessels: 88, headquarters: 'Copenhagen, Denmark' },
    { id: '4', ownerName: 'NF Shipping Maritime 3 Ltd', contactPerson: 'Elena Costa', email: 'elena@nfshipping.gr', totalVessels: 5, headquarters: 'Piraeus, Greece' },
    { id: '5', ownerName: 'YASA TANKER ISLETMECILIGI A.S.', contactPerson: 'Mehmet Yilmaz', email: 'mehmet@yasa.com.tr', totalVessels: 24, headquarters: 'Istanbul, Turkey' },
];

export default function Ownership() {
    const [search, setSearch] = useState('');

    const filteredOwners = MOCK_OWNERS.filter(o => 
        o.ownerName.toLowerCase().includes(search.toLowerCase()) || 
        o.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        o.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="registered-container">
            <Sidebar />
            <main className="registered-main">
                <Header />
                <div className="registered-content">
                    <div className="page-header-standard">
                        <div className="header-title-area">
                            <div className="breadcrumb-mini">MENU / OWNERSHIP</div>
                            <h1>Vessel Ownership</h1>
                            <p>Manage and track shipping companies and vessel owners.</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-secondary-standard"><Download size={16} /> Export List</button>
                            <button className="btn-primary-standard"><Plus size={18} /> Add New Owner</button>
                        </div>
                    </div>

                    <div className="table-filter-bar">
                        <div className="search-wrapper-standard">
                            <Search size={18} className="search-icon-standard" />
                            <input 
                                type="text" 
                                placeholder="Search owners by name or contact..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="filter-actions-standard">
                            <button className="filter-pill-btn"><Filter size={14} /> Regions</button>
                        </div>
                    </div>

                    <div className="standard-table-container">
                        <div className="table-scroll-wrapper">
                            <table className="standard-table">
                                <thead>
                                    <tr>
                                        <th className="th-action">Action</th>
                                        <th>Owner Name</th>
                                        <th>Contact Person</th>
                                        <th>Email Address</th>
                                        <th>Vessels Owned</th>
                                        <th>Headquarters</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOwners.map((owner) => (
                                        <tr key={owner.id}>
                                            <td className="action-column">
                                                <div className="action-buttons">
                                                    <button className="action-btn edit-btn" title="Edit"><Edit2 size={14} /></button>
                                                    <button className="action-btn send-btn" title="Send"><Send size={14} /></button>
                                                    <button className="action-btn delete-btn" title="Delete"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                            <td className="font-bold-main">{owner.ownerName}</td>
                                            <td>{owner.contactPerson}</td>
                                            <td className="email-cell">{owner.email}</td>
                                            <td className="vessel-count-cell">
                                                <div className="vessel-indicator">
                                                    <Briefcase size={14} /> {owner.totalVessels}
                                                </div>
                                            </td>
                                            <td>{owner.headquarters}</td>
                                        </tr>
                                    ))}
                                    {filteredOwners.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="empty-table-msg">No owners found matching your criteria.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="table-pagination-standard">
                            <span className="pagination-text">Showing {filteredOwners.length} ownership records</span>
                            <div className="pagination-btns">
                                <button className="page-btn active">1</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
