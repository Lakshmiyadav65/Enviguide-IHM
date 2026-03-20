import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Send, Filter, Download } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import './Registered.css';

interface Vessel {
    id?: string;
    name: string;
    imoNo: string;
    shipType?: string;
    shipOwner: string;
    shipManager: string;
    keelLaidDate?: string;
    flag?: string;
}

export default function Registered() {
    const [search, setSearch] = useState('');
    const [vessels, setVessels] = useState<Vessel[]>([]);

    useEffect(() => {
        const savedVessels = localStorage.getItem('vessel_list_main');
        if (savedVessels) {
            setVessels(JSON.parse(savedVessels));
        } else {
            // Mock data if none in localStorage
            setVessels([
                { name: 'MV Ocean Pioneer', imoNo: '9123456', shipOwner: 'Maersk Line', shipManager: 'V.Ships', keelLaidDate: '2015-05-12' },
                { name: 'ACOSTA', imoNo: '9876543', shipOwner: 'MSC', shipManager: 'Bernhard Schulte', keelLaidDate: '2018-09-20' },
                { name: 'PACIFIC HORIZON', imoNo: '9345678', shipOwner: 'CMA CGM', shipManager: 'Columbia Shipmanagement', keelLaidDate: '2012-03-15' },
                { name: 'NORTHERN STAR', imoNo: '9556677', shipOwner: 'Hapag-Lloyd', shipManager: 'V.Ships', keelLaidDate: '2020-11-30' },
            ]);
        }
    }, []);

    const filteredVessels = vessels.filter(v => 
        v.name.toLowerCase().includes(search.toLowerCase()) || 
        v.imoNo.includes(search) ||
        v.shipOwner.toLowerCase().includes(search.toLowerCase()) ||
        v.shipManager.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="registered-container">
            <Sidebar />
            <main className="registered-main">
                <Header />
                <div className="registered-content">
                    <div className="page-header-standard">
                        <div className="header-title-area">
                            <div className="breadcrumb-mini">MENU / REGISTERED</div>
                            <h1>Registered Vessels</h1>
                            <p>Overview of all vessels currently registered in the IHM system.</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-secondary-standard"><Download size={16} /> Export</button>
                            <button className="btn-primary-standard"><Plus size={18} /> Register New Vessel</button>
                        </div>
                    </div>

                    <div className="table-filter-bar">
                        <div className="search-wrapper-standard">
                            <Search size={18} className="search-icon-standard" />
                            <input 
                                type="text" 
                                placeholder="Search by name, IMO, owner or manager..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="filter-actions-standard">
                            <button className="filter-pill-btn"><Filter size={14} /> Filters</button>
                            <button className="filter-pill-btn">All Vessels</button>
                        </div>
                    </div>

                    <div className="standard-table-container">
                        <div className="table-scroll-wrapper">
                            <table className="standard-table">
                                <thead>
                                    <tr>
                                        <th className="th-action">Action</th>
                                        <th>Vessel Name</th>
                                        <th>IMO Number</th>
                                        <th>Ship Owner</th>
                                        <th>Ship Manager</th>
                                        <th>Keel Laid Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVessels.map((v, idx) => (
                                        <tr key={idx}>
                                            <td className="action-column">
                                                <div className="action-buttons">
                                                    <button className="action-btn edit-btn" title="Edit"><Edit2 size={14} /></button>
                                                    <button className="action-btn send-btn" title="Send"><Send size={14} /></button>
                                                    <button className="action-btn delete-btn" title="Delete"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                            <td className="font-bold-main">{v.name}</td>
                                            <td className="imo-cell">{v.imoNo}</td>
                                            <td>{v.shipOwner}</td>
                                            <td>{v.shipManager}</td>
                                            <td className="date-cell">{v.keelLaidDate || 'N/A'}</td>
                                        </tr>
                                    ))}
                                    {filteredVessels.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="empty-table-msg">No vessels found matching your search.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="table-pagination-standard">
                            <span className="pagination-text">Showing {filteredVessels.length} vessels</span>
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
