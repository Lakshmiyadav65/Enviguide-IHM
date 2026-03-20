import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Send, Filter, Download, Wrench } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import './Registered.css'; 

interface EquipmentItem {
    id: string;
    equipmentName: string;
    modelCode: string;
    manufacturer: string;
    systemType: string;
    nextService: string;
}

const MOCK_EQUIPMENT: EquipmentItem[] = [
    { id: '1', equipmentName: 'Main Engine - 6S60MC', modelCode: 'MAN-2022-X1', manufacturer: 'MAN Energy Solutions', systemType: 'Propulsion', nextService: '2026-08-15' },
    { id: '2', equipmentName: 'Auxiliary Generator', modelCode: 'CAT-3516B', manufacturer: 'Caterpillar Marine', systemType: 'Electrical', nextService: '2026-05-20' },
    { id: '3', equipmentName: 'Oily Water Separator', modelCode: 'GEA-WSD5', manufacturer: 'GEA Westfalia', systemType: 'Environmental', nextService: '2026-06-10' },
    { id: '4', equipmentName: 'Inert Gas System', modelCode: 'AL-IGS-99', manufacturer: 'Alfa Laval', systemType: 'Safety', nextService: '2026-12-05' },
    { id: '5', equipmentName: 'Ballast Water Treatment', modelCode: 'PW-BWTS-P1', manufacturer: 'Panasia', systemType: 'Environmental', nextService: '2026-10-30' },
];

export default function Equipment() {
    const [search, setSearch] = useState('');

    const filteredEquipment = MOCK_EQUIPMENT.filter(e => 
        e.equipmentName.toLowerCase().includes(search.toLowerCase()) || 
        e.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
        e.systemType.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="registered-container">
            <Sidebar />
            <main className="registered-main">
                <Header />
                <div className="registered-content">
                    <div className="page-header-standard">
                        <div className="header-title-area">
                            <div className="breadcrumb-mini">MENU / EQUIPMENT</div>
                            <h1>Vessel Equipment</h1>
                            <p>Global database of critical ship equipment and maintenance schedules.</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-secondary-standard"><Download size={16} /> Export Specs</button>
                            <button className="btn-primary-standard"><Plus size={18} /> Register Equipment</button>
                        </div>
                    </div>

                    <div className="table-filter-bar">
                        <div className="search-wrapper-standard">
                            <Search size={18} className="search-icon-standard" />
                            <input 
                                type="text" 
                                placeholder="Search by name, model or manufacturer..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="filter-actions-standard">
                            <button className="filter-pill-btn"><Filter size={14} /> System Systems</button>
                        </div>
                    </div>

                    <div className="standard-table-container">
                        <div className="table-scroll-wrapper">
                            <table className="standard-table">
                                <thead>
                                    <tr>
                                        <th className="th-action">Action</th>
                                        <th>Equipment Name</th>
                                        <th>Model Code</th>
                                        <th>Manufacturer</th>
                                        <th>System Type</th>
                                        <th>Next Service</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEquipment.map((e) => (
                                        <tr key={e.id}>
                                            <td className="action-column">
                                                <div className="action-buttons">
                                                    <button className="action-btn edit-btn" title="Edit"><Edit2 size={14} /></button>
                                                    <button className="action-btn send-btn" title="Send"><Send size={14} /></button>
                                                    <button className="action-btn delete-btn" title="Delete"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                            <td className="font-bold-main">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Wrench size={14} color="#00B0FA" /> {e.equipmentName}
                                                </div>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{e.modelCode}</td>
                                            <td>{e.manufacturer}</td>
                                            <td><span className="doc-type-tag">{e.systemType}</span></td>
                                            <td className="date-cell">{e.nextService}</td>
                                        </tr>
                                    ))}
                                    {filteredEquipment.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="empty-table-msg">No equipment found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="table-pagination-standard">
                            <span className="pagination-text">Showing {filteredEquipment.length} critical systems</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
