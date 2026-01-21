import { useNavigate } from 'react-router-dom';
import {
    Users,
    ShoppingCart,
    Ship,
    AlertTriangle,
    ChevronDown,
    ArrowUpRight,
    UserCheck,
    Package,
    ShieldCheck,
    Clock,
    ChevronRight,
    Filter
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();

    // Mock data for the dashboard
    const kpis = [
        { label: 'Total Vessels', value: '24', trend: '8%', icon: Ship, color: 'blue' },
        { label: 'Active POs', value: '156', trend: '12%', icon: Package, color: 'white' },
        { label: 'Compliance Rate', value: '94%', trend: '3%', icon: ShieldCheck, color: 'white' },
        { label: 'Pending Actions', value: '18', trend: null, icon: AlertTriangle, color: 'white' }
    ];

    const socExpiryList = [
        { name: 'MV Nordic Star', imo: '9123456', date: '2024-08-20', status: 'overdue', message: '45 days overdue' },
        { name: 'MV Atlantic Voyager', imo: '9654321', date: '2024-12-01', status: 'warning', message: '58 days left' },
        { name: 'MV Pacific Horizon', imo: '9234567', date: '2025-03-10', status: 'good', message: '157 days left' },
        { name: 'MV Ocean Pioneer', imo: '9876543', date: '2025-06-15', status: 'good', message: '254 days left' }
    ];

    const operationalOverview = [
        { imo: '9876543', name: 'MV Ocean Pioneer', pos: 45, items: 320, r1: 5, r2: 2, nr: 1 },
        { imo: '9654321', name: 'MV Atlantic Voyager', pos: 38, items: 275, r1: 8, r2: 3, nr: 2 },
        { imo: '9123456', name: 'MV Nordic Star', pos: 52, items: 410, r1: 3, r2: 1, nr: 0 },
        { imo: '9234567', name: 'MV Pacific Horizon', pos: 29, items: 185, r1: 12, r2: 6, nr: 3 }
    ];

    return (
        <div className="dashboard-wrapper">
            <Sidebar />

            <main className="main-content">
                <Header />

                <div className="dashboard-content">
                    <div className="welcome-section">
                        <h1>Welcome back, John</h1>
                        <p>Here's what's happening with your IHM operations today.</p>
                    </div>

                    <div className="filters-bar">
                        <div className="filter-group">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Filter size={16} color="#718096" />
                                <span className="filter-label">Filters</span>
                            </div>
                        </div>

                        <div className="filter-group">
                            <span className="filter-label">Yearly</span>
                            <ChevronDown size={14} color="#a0aec0" />
                        </div>

                        <div className="filter-group">
                            <span className="filter-label">Ship Owner</span>
                            <ChevronDown size={14} color="#a0aec0" />
                        </div>

                        <div className="filter-group">
                            <span className="filter-label">Ship Manager</span>
                            <ChevronDown size={14} color="#a0aec0" />
                        </div>

                        <div className="filter-group">
                            <span className="filter-label">Supplier</span>
                            <ChevronDown size={14} color="#a0aec0" />
                        </div>

                        <div className="filter-group">
                            <span className="filter-label">Vessel</span>
                            <ChevronDown size={14} color="#a0aec0" />
                        </div>

                        <button className="clear-filters">Clear Filters</button>
                    </div>

                    <div className="kpi-grid">
                        {kpis.map((kpi, index) => (
                            <div key={index} className={`kpi-card ${kpi.color}`}>
                                <div className="kpi-info">
                                    <h4>{kpi.label}</h4>
                                    <div className="kpi-value">{kpi.value}</div>
                                    {kpi.trend && (
                                        <div className="kpi-trend">
                                            <span className="trend-up">↑ {kpi.trend}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="kpi-icon">
                                    <kpi.icon size={24} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="detail-grid">
                        {/* Users Overview */}
                        <div className="detail-card">
                            <div className="card-title">
                                <Users size={20} color="#3182ce" />
                                <h3>Users Overview</h3>
                            </div>
                            <div className="stats-list">
                                <div className="stat-item">
                                    <div className="stat-label-group">
                                        <UserCheck size={16} color="#48bb78" />
                                        <span className="stat-label">New Registrations</span>
                                    </div>
                                    <span className="stat-count">12</span>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label-group">
                                        <Ship size={16} color="#3182ce" />
                                        <span className="stat-label">IHM Registrations</span>
                                    </div>
                                    <span className="stat-count">45</span>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label-group">
                                        <Users size={16} color="#e53e3e" />
                                        <span className="stat-label">Inactive Users</span>
                                    </div>
                                    <span className="stat-count">3</span>
                                </div>
                            </div>
                        </div>

                        {/* Purchase Orders */}
                        <div className="detail-card">
                            <div className="card-title">
                                <ShoppingCart size={20} color="#3182ce" />
                                <h3>Purchase Orders</h3>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <div className="stat-item" style={{ background: '#f7fafc', marginBottom: '12px' }}>
                                    <span className="stat-label">Total Line Items</span>
                                    <span className="stat-count">1248</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ padding: '12px', background: '#fffaf0', borderRadius: '10px', border: '1px solid #feebc8', textAlign: 'center' }}>
                                        <div style={{ fontSize: '11px', color: '#dd6b20', marginBottom: '4px' }}>Pending MDs</div>
                                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a202c' }}>156</div>
                                    </div>
                                    <div style={{ padding: '12px', background: '#f0fff4', borderRadius: '10px', border: '1px solid #c6f6d5', textAlign: 'center' }}>
                                        <div style={{ fontSize: '11px', color: '#38a169', marginBottom: '4px' }}>Received MDs</div>
                                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a202c' }}>892</div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e53e3e' }}></div>
                                        <span style={{ fontSize: '12px', color: '#718096' }}>HM Red: 23</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#48bb78' }}></div>
                                        <span style={{ fontSize: '12px', color: '#718096' }}>HM Green: 1069</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vessel Status */}
                        <div className="detail-card">
                            <div className="card-title">
                                <Ship size={20} color="#3182ce" />
                                <h3>Vessel Status</h3>
                            </div>
                            <div className="stats-list">
                                <div className="stat-item">
                                    <span className="stat-label">New Onboarded</span>
                                    <span className="stat-count" style={{ color: '#38a169' }}>4</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Moved from Deck</span>
                                    <span className="stat-count">28</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Moved Ashore</span>
                                    <span className="stat-count">15</span>
                                </div>
                                <div style={{ padding: '12px', background: '#fff5f5', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#e53e3e' }}>
                                    <AlertTriangle size={16} />
                                    <span style={{ fontSize: '13px', fontWeight: '600' }}>SOC Expired: 2</span>
                                </div>
                            </div>
                        </div>

                        {/* SOC Expiry */}
                        <div className="detail-card">
                            <div className="card-title">
                                <Clock size={20} color="#3182ce" />
                                <h3>SOC Expiry</h3>
                            </div>
                            <div className="soc-list">
                                {socExpiryList.map((soc, idx) => (
                                    <div key={idx} className="soc-item">
                                        <div className="vessel-header">
                                            <div className="vessel-details">
                                                <h5>{soc.name}</h5>
                                                <span>IMO: {soc.imo}</span>
                                            </div>
                                            <span className={`status-badge status-${soc.status}`}>
                                                {soc.message}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#718096' }}>
                                            Expiry Date: <span style={{ fontWeight: '600', color: '#2d3748' }}>{soc.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="table-container">
                        <div className="table-header">
                            <h3>Operational Overview</h3>
                            <p>Track purchase orders and supplier responses across vessels</p>
                        </div>
                        <table className="overview-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>IMO Number</th>
                                    <th>Vessel Name</th>
                                    <th>Total POs</th>
                                    <th>Line Items</th>
                                    <th style={{ textAlign: 'center' }}>Reminder 1</th>
                                    <th style={{ textAlign: 'center' }}>Reminder 2</th>
                                    <th style={{ textAlign: 'center' }}>Non-Responsive</th>
                                </tr>
                            </thead>
                            <tbody>
                                {operationalOverview.map((row, idx) => (
                                    <tr key={idx}>
                                        <td><ChevronRight size={14} color="#a0aec0" /></td>
                                        <td style={{ fontWeight: '600' }}>{row.imo}</td>
                                        <td style={{ fontWeight: '600' }}>{row.name}</td>
                                        <td>{row.pos}</td>
                                        <td>{row.items}</td>
                                        <td><div className="reminder-badge reminder-1">{row.r1}</div></td>
                                        <td><div className="reminder-badge reminder-2">{row.r2}</div></td>
                                        <td><div className="reminder-badge non-responsive">{row.nr}</div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
