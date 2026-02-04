import {
    Ship,
    FileText,
    TrendingUp,
    AlertTriangle,
    Filter,
    ChevronDown,
    Users,
    UserCheck,
    UserX,
    ShoppingCart,
    Package,
    Activity,
    Clock,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './Dashboard.css';

export default function Dashboard() {
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
                    <div className="filters-row">
                        <button className="filter-btn">
                            <Filter size={16} /> Filters
                        </button>
                        <button className="filter-btn">
                            Yearly <ChevronDown size={16} />
                        </button>
                        <button className="filter-btn">
                            Ship Owner <ChevronDown size={16} />
                        </button>
                        <button className="filter-btn">
                            Ship Manager <ChevronDown size={16} />
                        </button>
                        <button className="filter-btn">
                            Supplier <ChevronDown size={16} />
                        </button>
                        <button className="filter-btn">
                            Vessel <ChevronDown size={16} />
                        </button>
                        <button className="clear-filters">Clear Filters</button>
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
                            <div className="kpi-value">24</div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-top">
                                <span className="kpi-label">Active POs</span>
                                <div className="kpi-icon-box">
                                    <FileText size={24} color="#00B0FA" />
                                </div>
                            </div>
                            <div className="kpi-middle">
                                <div className="kpi-value">156</div>
                                <div className="kpi-trend up">
                                    <TrendingUp size={16} /> 12%
                                </div>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-top">
                                <span className="kpi-label">Compliance Rate</span>
                                <div className="kpi-icon-box green">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                            <div className="kpi-middle">
                                <div className="kpi-value">94%</div>
                                <div className="kpi-trend up">
                                    <TrendingUp size={16} /> 3%
                                </div>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-top">
                                <span className="kpi-label">Pending Actions</span>
                                <div className="kpi-icon-box orange">
                                    <AlertTriangle size={24} />
                                </div>
                            </div>
                            <div className="kpi-value">18</div>
                        </div>
                    </div>

                    {/* 4. Content Split */}
                    <div className="content-split">
                        <div className="left-column">
                            {/* Users Overview */}
                            <div className="section-card">
                                <div className="card-title">
                                    <div className="title-icon blue-bg">
                                        <Users size={18} />
                                    </div>
                                    <h3>Users Overview</h3>
                                </div>
                                <div className="users-grid">
                                    <div className="user-metric">
                                        <div className="user-icon-circle u-green">
                                            <UserCheck size={22} />
                                        </div>
                                        <div className="u-val">124</div>
                                        <div className="u-label">New Registrations</div>
                                    </div>
                                    <div className="user-metric">
                                        <div className="user-icon-circle u-blue">
                                            <Users size={22} />
                                        </div>
                                        <div className="u-val">89</div>
                                        <div className="u-label">IHM Registrations</div>
                                    </div>
                                    <div className="user-metric">
                                        <div className="user-icon-circle u-red">
                                            <UserX size={22} />
                                        </div>
                                        <div className="u-val">12</div>
                                        <div className="u-label">Inactive Users</div>
                                    </div>
                                </div>
                            </div>

                            {/* Purchase Orders */}
                            <div className="section-card">
                                <div className="card-title">
                                    <div className="title-icon blue-bg">
                                        <ShoppingCart size={18} />
                                    </div>
                                    <h3>Purchase Orders</h3>
                                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Package size={16} color="#667085" />
                                        <span style={{ fontSize: 13, color: '#667085' }}>Total Line Items</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#101828' }}>1,247</span>
                                    </div>
                                </div>

                                <div className="po-status-row">
                                    <div className="po-status-card po-pending">
                                        <div className="po-s-label">
                                            <Clock size={14} /> Pending
                                        </div>
                                        <div className="po-s-val">34</div>
                                        <div style={{ fontSize: 12, color: '#B54708', fontWeight: 600 }}>MDs</div>
                                    </div>
                                    <div className="po-status-card po-received">
                                        <div className="po-s-label">
                                            <UserCheck size={14} /> Received
                                        </div>
                                        <div className="po-s-val">189</div>
                                        <div style={{ fontSize: 12, color: '#027A48', fontWeight: 600 }}>MDs</div>
                                    </div>
                                </div>

                                <div className="haz-mat-container">
                                    <div className="haz-title-block">Hazardous Materials</div>
                                    <div className="haz-metrics-row">
                                        <div className="haz-item">
                                            <div className="dot dot-red"></div>
                                            <span>Red <span className="haz-count">23</span></span>
                                        </div>
                                        <div className="haz-division-line"></div>
                                        <div className="haz-item">
                                            <div className="dot dot-green"></div>
                                            <span>Green <span className="haz-count">156</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="section-card">
                                <div className="card-title">
                                    <div className="title-icon blue-bg">
                                        <Activity size={18} />
                                    </div>
                                    <h3>Recent Activity</h3>
                                </div>
                                <div className="activity-list">
                                    <div className="activity-item">
                                        <div className="act-icon green">
                                            <Ship size={20} />
                                        </div>
                                        <div className="act-content">
                                            <h4>Vessel Onboarded</h4>
                                            <p>MV Atlantic Voyager successfully onboarded</p>
                                            <span className="act-time">2 hours ago</span>
                                        </div>
                                    </div>
                                    <div className="activity-item">
                                        <div className="act-icon blue">
                                            <FileText size={20} />
                                        </div>
                                        <div className="act-content">
                                            <h4>PO Updated</h4>
                                            <p>23 new line items added to PO-2024-156</p>
                                            <span className="act-time">4 hours ago</span>
                                        </div>
                                    </div>
                                    <div className="activity-item">
                                        <div className="act-icon green">
                                            <Package size={20} />
                                        </div>
                                        <div className="act-content">
                                            <h4>Materials Received</h4>
                                            <p>45 items marked as received from supplier</p>
                                            <span className="act-time">5 hours ago</span>
                                        </div>
                                    </div>
                                    <div className="activity-item">
                                        <div className="act-icon blue">
                                            <Users size={20} />
                                        </div>
                                        <div className="act-content">
                                            <h4>New User Registration</h4>
                                            <p>Sarah Johnson registered as Ship Manager</p>
                                            <span className="act-time">6 hours ago</span>
                                        </div>
                                    </div>
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
                                    <h3>Vessels</h3>
                                </div>
                                <div className="vessels-color-grid">
                                    <div className="v-color-card v-green">
                                        <div className="v-top"><TrendingUp size={14} /> Onboarded</div>
                                        <div className="v-count">8</div>
                                        <div className="v-sub">• New</div>
                                    </div>
                                    <div className="v-color-card v-red">
                                        <div className="v-top"><AlertTriangle size={14} /> Expired</div>
                                        <div className="v-count">3</div>
                                        <div className="v-sub">SOC</div>
                                    </div>
                                    <div className="v-color-card v-blue">
                                        <div className="v-top"><ArrowUpRight size={14} /> From Deck</div>
                                        <div className="v-count">145</div>
                                        <div className="v-sub">Items moved</div>
                                    </div>
                                    <div className="v-color-card v-purple">
                                        <div className="v-top"><ArrowUpRight size={14} /> To Ashore</div>
                                        <div className="v-count">67</div>
                                        <div className="v-sub">Items moved</div>
                                    </div>
                                </div>
                            </div>

                            {/* SOC Expiry */}
                            <div className="section-card">
                                <div className="card-title">
                                    <div className="title-icon orange-bg">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <h3>SOC Expiry</h3>
                                        <div style={{ fontSize: 11, color: '#98A2B3' }}>Statement of Compliance</div>
                                    </div>
                                </div>
                                <div className="soc-list">
                                    {[
                                        { name: 'MV Nordic Star', imo: '9123456', date: '2024-08-20', badge: '45 days overdue', type: 'red' },
                                        { name: 'MV Atlantic Voyager', imo: '9654321', date: '2024-12-01', badge: '38 days left', type: 'orange' },
                                        { name: 'MV Pacific Horizon', imo: '9234567', date: '2025-03-10', badge: '127 days left', type: 'green' },
                                        { name: 'MV Ocean Pioneer', imo: '9876543', date: '2025-06-15', badge: '254 days left', type: 'green' }
                                    ].map((v, i) => (
                                        <div key={i} className="soc-item">
                                            <div className="soc-left">
                                                <div className="soc-icon"><Ship size={20} /></div>
                                                <div className="soc-info">
                                                    <h4>{v.name}</h4>
                                                    <p>IMO: {v.imo}</p>
                                                </div>
                                            </div>
                                            <div className="soc-right">
                                                <span className="soc-date-label">Expiry Date</span>
                                                <span className="soc-date-val">{v.date}</span>
                                                <span className={`soc-badge badge-${v.type}`}>{v.badge}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Operational Overview Table */}
                    <div className="section-card ops-table-container">
                        <div className="ops-table-header">
                            <h3>Operational Overview</h3>
                            <p>Track purchase orders and supplier responses across vessels</p>
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
                                        <th><div className="th-inner"><div className="th-dot orange"></div>REMINDER 1</div></th>
                                        <th><div className="th-inner"><div className="th-dot red"></div>REMINDER 2</div></th>
                                        <th><div className="th-inner"><div className="th-dot dark-red"></div>NON-RESPONSIVE</div></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { imo: '9876543', name: 'MV Ocean Pioneer', pos: 45, items: 320, r1: 5, r2: 2, non: 1 },
                                        { imo: '9654321', name: 'MV Atlantic Voyager', pos: 38, items: 275, r1: 0, r2: 3, non: 2 },
                                        { imo: '9123456', name: 'MV Nordic Star', pos: 52, items: 410, r1: 3, r2: 1, non: 0 },
                                        { imo: '9234567', name: 'MV Pacific Horizon', pos: 29, items: 185, r1: 12, r2: 8, non: 3 }
                                    ].map((v, i) => (
                                        <tr key={i}>
                                            <td><div className="chevron-cell"><ChevronRight size={18} /></div></td>
                                            <td className="row-imo">{v.imo}</td>
                                            <td className="row-name">{v.name}</td>
                                            <td>{v.pos}</td>
                                            <td>{v.items}</td>
                                            <td><div className={v.r1 > 0 ? 'reminder-badge rem-1' : 'reminder-badge rem-0'}>{v.r1}</div></td>
                                            <td><div className={v.r2 > 0 ? 'reminder-badge rem-2' : 'reminder-badge rem-0'}>{v.r2}</div></td>
                                            <td>
                                                {v.non > 0 ? (
                                                    <div className="reminder-badge non-resp">{v.non}</div>
                                                ) : (
                                                    <div className="reminder-badge rem-good">0</div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
