import { useState } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './Fleet.css';

interface FleetItem {
    id: string;
    name: string;
    owner: string;
    manager: string;
}

const MOCK_FLEETS: FleetItem[] = [
    { id: '1', name: 'Ice Class', owner: 'Thor Shipping Limited', manager: 'Bernhard Schulte Shipmanagement (British Isles)' },
    { id: '2', name: 'Colombo Class', owner: '-', manager: 'Bernhard Schulte Shipmanagement (British Isles)' },
    { id: '3', name: 'Dalian Class', owner: 'Hapag-Lloyd Aktiengesellschaft', manager: 'Hapag-Lloyd Aktiengesellschaft' },
    { id: '4', name: 'Hamburg Class', owner: 'Hapag-Lloyd Aktiengesellschaft', manager: 'Hapag-Lloyd Aktiengesellschaft' },
    { id: '5', name: 'Dublin Class', owner: 'Hapag-Lloyd Aktiengesellschaft', manager: 'Hapag-Lloyd Aktiengesellschaft' },
    { id: '6', name: 'Dallas Class', owner: 'Hapag-Lloyd Aktiengesellschaft', manager: 'Hapag-Lloyd Aktiengesellschaft' },
    { id: '7', name: 'Valparaiso Class', owner: 'Hapag-Lloyd Aktiengesellschaft', manager: 'Hapag-Lloyd Aktiengesellschaft' },
    { id: '8', name: 'A18 Class', owner: 'NF Shipping Maritime 3 Ltd', manager: 'Hapag-Lloyd Aktiengesellschaft' },
    { id: '9', name: 'Fleet Y', owner: 'AABBCC1', manager: '-' },
    { id: '10', name: 'ICE PEARL NAVIGATION CORP.', owner: 'YASA TANKER ISLETMECILIGI A.S.', manager: 'YASA TANKER ISLETMECILIGI A.S.' },
];

export default function Fleet() {
    const [search, setSearch] = useState('');
    const totalItems = 14;

    return (
        <div className="pending-audits-container">
            <Sidebar />
            <main className="pending-audits-main">
                <Header />
                <div className="pending-audits-content">
                    <div className="md-header">
                        <div className="md-title-area">
                            <h1>Fleet Management</h1>
                            <p>Manage and organize your vessel fleets and ownership records.</p>
                        </div>
                    </div>

                    <div className="audits-top-bar">
                        <div className="search-box">
                            <Search size={24} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search Fleets by Name, Owner or Manager..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="top-bar-right">
                            <button className="add-fleet-btn">
                                <Plus size={18} /> ADD NEW FLEET
                            </button>
                        </div>
                    </div>

                    <div className="table-container">
                        <div className="table-scroll-wrapper">
                            <table className="audits-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '120px' }}>ACTION</th>
                                        <th>NAME</th>
                                        <th>OWNER</th>
                                        <th>MANAGER</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_FLEETS.map((fleet) => (
                                        <tr key={fleet.id}>
                                            <td className="action-column">
                                                <div className="action-buttons">
                                                    <button className="action-btn edit-btn" title="Edit"><Edit2 size={16} /></button>
                                                    <button className="action-btn delete-btn" title="Delete"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                            <td className="vessel-name">{fleet.name}</td>
                                            <td>{fleet.owner}</td>
                                            <td>{fleet.manager}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="pagination">
                        <span className="pagination-info">
                            Showing 1 to 10 of {totalItems} fleet records
                        </span>
                        <div className="pagination-buttons">
                            <button className="page-btn active">1</button>
                            <button className="page-btn">2</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
