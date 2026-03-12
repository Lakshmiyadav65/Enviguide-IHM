import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Send } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './SubFleet.css';

interface SubFleetItem {
    id: string;
    name: string;
    parentFleet: string;
    owner: string;
    manager: string;
}

const MOCK_SUB_FLEETS: SubFleetItem[] = [
    { id: '1', name: 'FS Class 211', parentFleet: 'Ice Class', owner: 'Thor Shipping Limited', manager: 'Bernhard Schulte Shipmanagement (British Isles)' },
    { id: '2', name: 'FS Ice class 1A', parentFleet: 'Ice Class', owner: 'Thor Shipping Limited', manager: 'Bernhard Schulte Shipmanagement (British Isles)' },
    { id: '3', name: 'FS Ice class 1B', parentFleet: 'Ice Class', owner: 'Thor Shipping Limited', manager: 'Bernhard Schulte Shipmanagement (British Isles)' },
    { id: '4', name: 'FS Ice CLASS II', parentFleet: 'Ice Class', owner: 'Thor Shipping Limited', manager: 'Bernhard Schulte Shipmanagement (British Isles)' },
    { id: '5', name: 'FS Ice class 1C', parentFleet: 'Ice Class', owner: 'Thor Shipping Limited', manager: 'Bernhard Schulte Shipmanagement (British Isles)' },
    { id: '6', name: 'N', parentFleet: 'Ice Class', owner: 'Thor Shipping Limited', manager: 'Bernhard Schulte Shipmanagement (British Isles)' },
    { id: '7', name: 'Colombo-Vienna Class', parentFleet: 'Colombo Class', owner: 'Hapag-Lloyd Aktiengesellschaft', manager: 'Hapag-Lloyd Aktiengesellschaft' },
    { id: '8', name: 'Colombo-Prague Class', parentFleet: 'Colombo Class', owner: 'Hapag-Lloyd Aktiengesellschaft', manager: 'Hapag-Lloyd Aktiengesellschaft' },
    { id: '9', name: 'Sub Fleet 1', parentFleet: 'Fleet Y', owner: 'Archive Owner', manager: '-' },
    { id: '10', name: 'Sub Fleet 2', parentFleet: 'Fleet Y', owner: 'Archive Owner', manager: '-' },
];

export default function SubFleet() {
    const [search, setSearch] = useState('');

    return (
        <div className="pending-audits-container">
            <Sidebar />
            <main className="pending-audits-main">
                <Header />
                <div className="pending-audits-content">
                    <div className="md-header">
                        <div className="md-title-area">
                            <h1>Sub-Fleet Management</h1>
                            <p>Organize your vessels into specialized sub-fleets for better reporting and tracking.</p>
                        </div>
                    </div>

                    <div className="audits-top-bar">
                        <div className="search-box">
                            <Search size={24} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search here..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="top-bar-right">
                            <button className="add-fleet-btn">
                                <Plus size={18} /> ADD SUB-FLEET
                            </button>
                        </div>
                    </div>

                    <div className="table-container">
                        <div className="table-scroll-wrapper">
                            <table className="audits-table">
                                <thead>
                                    <tr>
                                        <th className="th-action">Action</th>
                                        <th>Name</th>
                                        <th>Parent Fleet</th>
                                        <th>Owner</th>
                                        <th>Manager</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_SUB_FLEETS.map((item) => (
                                        <tr key={item.id}>
                                            <td className="action-column">
                                                <div className="action-buttons">
                                                    <button className="action-btn edit-btn" title="Edit">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button className="action-btn send-btn" title="Send">
                                                        <Send size={14} />
                                                    </button>
                                                    <button className="action-btn delete-btn" title="Delete">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td>{item.name}</td>
                                            <td>{item.parentFleet}</td>
                                            <td>{item.owner}</td>
                                            <td>{item.manager}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="table-footer">
                        <span className="total-count">{MOCK_SUB_FLEETS.length} total</span>
                    </div>

                    <div className="archived-section">
                        <h3>Archived Sub-Fleets</h3>
                    </div>
                </div>
            </main>
        </div>
    );
}
