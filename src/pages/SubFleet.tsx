import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
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
                            <h1>Sub-Fleets</h1>
                        </div>
                    </div>

                    <div className="sub-fleet-controls">
                        <button className="add-subfleet-btn">
                            <Plus size={24} />
                        </button>
                        
                        <div className="sub-fleet-search">
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-container">
                        <div className="table-scroll-wrapper">
                            <table className="audits-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}>Action</th>
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
                                                    <Edit2 size={16} className="table-edit-icon" />
                                                    <Trash2 size={16} className="table-delete-icon" />
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
