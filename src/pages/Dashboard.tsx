import { useState, useRef, useEffect } from 'react';
import {
    Ship,
    FileText,
    TrendingUp,
    AlertTriangle,
    Filter,
    Activity,
    Clock,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './Dashboard.css';

export default function Dashboard() {
    const [activeFilters, setActiveFilters] = useState({
        yearly: 'Yearly',
        shipOwner: 'Ship Owner',
        shipManager: 'Ship Manager',
        supplier: 'Supplier',
        vessel: 'Vessel'
    });

    const [vesselList, setVesselList] = useState<any[]>([]);
    const [auditRegistry, setAuditRegistry] = useState<any[]>([]);

    useEffect(() => {
        const savedVessels = localStorage.getItem('vessel_list_main');
        if (savedVessels) setVesselList(JSON.parse(savedVessels));

        const savedAudits = localStorage.getItem('audit_registry_main');
        if (savedAudits) setAuditRegistry(JSON.parse(savedAudits));
    }, []);

    const totalVessels = vesselList.length;
    const totalPOs = auditRegistry.reduce((acc, curr) => acc + (curr.totalPO || 0), 0);
    const totalItems = auditRegistry.reduce((acc, curr) => acc + (curr.totalItems || 0), 0);

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (name: string) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    const handleSelect = (filterName: string, value: string) => {
        setActiveFilters(prev => ({ ...prev, [filterName]: value }));
        setOpenDropdown(null);
    };

    return (
        <div className="dashboard-wrapper">
            <Sidebar />

            <main className="main-content">
                <Header />

                <div className="dashboard-content">

                    {/* 1. Welcome & Header */}
                    <div className="header-section">
                        <div className="welcome-text">
                            <h1>Welcome back, John</h1>
                            <p>Here's what's happening with your IHM operations today.</p>
                        </div>
                    </div>

                    {/* 2. Filters Row */}
                    <div className="filters-row" ref={filterRef}>
                        <button className="filter-btn">
                            <Filter size={16} /> Filters
                        </button>

                        {/* Yearly Filter */}
                        <div className="custom-select-wrapper" style={{ position: 'relative' }}>
                            <div
                                className={`filter-btn ${openDropdown === 'yearly' ? 'active' : ''}`}
                                onClick={() => toggleDropdown('yearly')}
                            >
                                {activeFilters.yearly}
                            </div>
                            {openDropdown === 'yearly' && (
                                <div className="custom-dropdown-menu">
                                    {['Yearly', '2024', '2023', '2022'].map(option => (
                                        <div
                                            key={option}
                                            className={`custom-dropdown-item ${activeFilters.yearly === option ? 'active' : ''}`}
                                            onClick={() => handleSelect('yearly', option)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ship Owner Filter */}
                        <div className="custom-select-wrapper" style={{ position: 'relative' }}>
                            <div
                                className={`filter-btn ${openDropdown === 'shipOwner' ? 'active' : ''}`}
                                onClick={() => toggleDropdown('shipOwner')}
                            >
                                {activeFilters.shipOwner}
                            </div>
                            {openDropdown === 'shipOwner' && (
                                <div className="custom-dropdown-menu">
                                    {['Ship Owner', 'CMA CGM', 'Maersk Line', 'MSC'].map(option => (
                                        <div
                                            key={option}
                                            className={`custom-dropdown-item ${activeFilters.shipOwner === option ? 'active' : ''}`}
                                            onClick={() => handleSelect('shipOwner', option)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ship Manager Filter */}
                        <div className="custom-select-wrapper" style={{ position: 'relative' }}>
                            <div
                                className={`filter-btn ${openDropdown === 'shipManager' ? 'active' : ''}`}
                                onClick={() => toggleDropdown('shipManager')}
                            >
                                {activeFilters.shipManager}
                            </div>
                            {openDropdown === 'shipManager' && (
                                <div className="custom-dropdown-menu">
                                    {['Ship Manager', 'V.Ships', 'Bernhard Schulte', 'Columbia Shipmanagement'].map(option => (
                                        <div
                                            key={option}
                                            className={`custom-dropdown-item ${activeFilters.shipManager === option ? 'active' : ''}`}
                                            onClick={() => handleSelect('shipManager', option)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Supplier Filter */}
                        <div className="custom-select-wrapper" style={{ position: 'relative' }}>
                            <div
                                className={`filter-btn ${openDropdown === 'supplier' ? 'active' : ''}`}
                                onClick={() => toggleDropdown('supplier')}
                            >
                                {activeFilters.supplier}
                            </div>
                            {openDropdown === 'supplier' && (
                                <div className="custom-dropdown-menu">
                                    {['Supplier', 'Wilhelmsen', 'Wärtsilä', 'ABB'].map(option => (
                                        <div
                                            key={option}
                                            className={`custom-dropdown-item ${activeFilters.supplier === option ? 'active' : ''}`}
                                            onClick={() => handleSelect('supplier', option)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Vessel Filter */}
                        <div className="custom-select-wrapper" style={{ position: 'relative' }}>
                            <div
                                className={`filter-btn ${openDropdown === 'vessel' ? 'active' : ''}`}
                                onClick={() => toggleDropdown('vessel')}
                            >
                                {activeFilters.vessel}
                            </div>
                            {openDropdown === 'vessel' && (
                                <div className="custom-dropdown-menu">
                                    {['Vessel', 'MV Ocean Pioneer', 'ACOSTA', 'PACIFIC HORIZON'].map(option => (
                                        <div
                                            key={option}
                                            className={`custom-dropdown-item ${activeFilters.vessel === option ? 'active' : ''}`}
                                            onClick={() => handleSelect('vessel', option)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button className="clear-filters" onClick={() => setActiveFilters({
                            yearly: 'Yearly',
                            shipOwner: 'Ship Owner',
                            shipManager: 'Ship Manager',
                            supplier: 'Supplier',
                            vessel: 'Vessel'
                        })}>Clear Filters</button>
                    </div>

                    {/* 3. KPI Cards */}
                    <div className="kpi-grid">
                        <div className="kpi-card blue-gradient">
                            <div className="kpi-top">
                                <span className="kpi-label">Total Vessels</span>
                                <div className="kpi-icon-box">
                                    <Ship size={24} />
                                </div>
                            </div>
                            <div className="kpi-value">{totalVessels}</div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-top">
                                <span className="kpi-label">Active POs</span>
                                <div className="kpi-icon-box">
                                    <FileText size={24} color="#00B0FA" />
                                </div>
                            </div>
                            <div className="kpi-middle">
                                <div className="kpi-value">{totalPOs}</div>
                                <div className="kpi-trend up">
                                    <TrendingUp size={16} /> {auditRegistry.length > 0 ? 'Live' : '0%'}
                                </div>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-top">
                                <span className="kpi-label">Total Items Audit</span>
                                <div className="kpi-icon-box green">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                            <div className="kpi-middle">
                                <div className="kpi-value">{totalItems}</div>
                                <div className="kpi-trend up">
                                    <TrendingUp size={16} /> Verified
                                </div>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-top">
                                <span className="kpi-label">Pending Audits</span>
                                <div className="kpi-icon-box orange">
                                    <AlertTriangle size={24} />
                                </div>
                            </div>
                            <div className="kpi-value">{auditRegistry.length}</div>
                        </div>
                    </div>

                    {/* 4. Content Split */}
                    <div className="content-split">
                        <div className="left-column">
                            {/* Recent Activity */}
                            <div className="section-card">
                                <div className="card-title">
                                    <div className="title-icon blue-bg">
                                        <Activity size={18} />
                                    </div>
                                    <h3>Recent Activity</h3>
                                </div>
                                <div className="activity-list">
                                    {auditRegistry.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="activity-item">
                                            <div className="act-icon blue">
                                                <FileText size={20} />
                                            </div>
                                            <div className="act-content">
                                                <h4>Audit Initialized</h4>
                                                <p>{item.totalPO} POs for {item.vesselName} sent to registry</p>
                                                <span className="act-time">{item.uploadDate || 'Recently'}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {auditRegistry.length === 0 && (
                                        <div className="summary-empty" style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>
                                            No recent activity found. Start by uploading a Purchase Order.
                                        </div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <a href="#" className="view-all-link">View All Activity →</a>
                                </div>
                            </div>
                        </div>

                        <div className="right-column">
                            {/* Vessels */}
                            <div className="section-card">
                                <div className="card-title">
                                    <div className="title-icon blue-bg">
                                        <Ship size={18} />
                                    </div>
                                    <h3>Vessel Registry</h3>
                                </div>
                                <div className="vessels-color-grid">
                                    <div className="v-color-card v-green">
                                        <div className="v-top"><TrendingUp size={14} /> Total</div>
                                        <div className="v-count">{vesselList.length}</div>
                                        <div className="v-sub">• Fleet</div>
                                    </div>
                                    <div className="v-color-card v-red">
                                        <div className="v-top"><AlertTriangle size={14} /> In Audit</div>
                                        <div className="v-count">{auditRegistry.length}</div>
                                        <div className="v-sub">Phase</div>
                                    </div>
                                    <div className="v-color-card v-blue">
                                        <div className="v-top"><ArrowUpRight size={14} /> Managers</div>
                                        <div className="v-count">{new Set(vesselList.map(v => v.shipManager)).size}</div>
                                        <div className="v-sub">Active</div>
                                    </div>
                                    <div className="v-color-card v-purple">
                                        <div className="v-top"><ArrowUpRight size={14} /> New</div>
                                        <div className="v-count">0</div>
                                        <div className="v-sub">Pending</div>
                                    </div>
                                </div>
                            </div>

                            {/* SOC Status */}
                            <div className="section-card">
                                <div className="card-title">
                                    <div className="title-icon orange-bg">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <h3>Vessel Status</h3>
                                        <div style={{ fontSize: 11, color: '#98A2B3' }}>Review and Onboarding</div>
                                    </div>
                                </div>
                                <div className="soc-list">
                                    {vesselList.slice(0, 4).map((v, i) => (
                                        <div key={i} className="soc-item">
                                            <div className="soc-left">
                                                <div className="soc-icon"><Ship size={20} /></div>
                                                <div className="soc-info">
                                                    <h4>{v.name}</h4>
                                                    <p>IMO: {v.imoNo}</p>
                                                </div>
                                            </div>
                                            <div className="soc-right">
                                                <span className="soc-date-label">Created</span>
                                                <span className="soc-date-val">{v.keelLaidDate || 'N/A'}</span>
                                                <span className="soc-badge badge-green">Onboarded</span>
                                            </div>
                                        </div>
                                    ))}
                                    {vesselList.length === 0 && (
                                        <div className="summary-empty" style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>
                                            No vessels registered.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Operational Overview Table */}
                    <div className="section-card ops-table-container">
                        <div className="ops-table-header">
                            <h3>Operational Overview - Pending Audits</h3>
                            <p>Track purchase orders awaiting audit across your fleet</p>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="ops-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 60 }}></th>
                                        <th>IMO NUMBER</th>
                                        <th>VESSEL NAME</th>
                                        <th>TOTAL POS</th>
                                        <th>LINE ITEMS</th>
                                        <th>STATUS</th>
                                        <th>PROGRESS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditRegistry.map((v, i) => (
                                        <tr key={i}>
                                            <td><div className="chevron-cell"><ChevronRight size={18} /></div></td>
                                            <td className="row-imo">{v.imoNumber}</td>
                                            <td className="row-name">{v.vesselName}</td>
                                            <td>{v.totalPO}</td>
                                            <td>{v.totalItems}</td>
                                            <td><span className="reminder-badge rem-1">Pending</span></td>
                                            <td><div className="reminder-badge rem-good">0%</div></td>
                                            <td>
                                                <div className="chevron-cell">
                                                    <ArrowUpRight size={18} style={{ cursor: 'pointer', color: '#00B0FA' }} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {auditRegistry.length === 0 && (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                                                No pending audits in the system.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
