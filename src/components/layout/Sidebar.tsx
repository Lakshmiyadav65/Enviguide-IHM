import { Link, useLocation } from 'react-router-dom';
import { Ship, LayoutDashboard, Layers, ClipboardList, FileText, Settings, Users, Database, Upload, Mail } from 'lucide-react';
import { mockVessels } from '../../services/mockData';
import './Sidebar.css';

interface SidebarProps {
    selectedVessel: string | null;
    onVesselSelect: (vesselId: string) => void;
}

export default function Sidebar({ selectedVessel, onVesselSelect }: SidebarProps) {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const getStatusDotClass = (status: string) => {
        switch (status) {
            case 'compliant':
                return 'status-dot-compliant';
            case 'warning':
                return 'status-dot-warning';
            case 'expired':
                return 'status-dot-expired';
            default:
                return '';
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container">
                    <Ship className="logo-icon float" size={32} />
                    <div className="logo-text">
                        <h1>IHM Platform</h1>
                        <p>Maritime Safety</p>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                    <LayoutDashboard size={18} />
                    <span>Admin Dashboard</span>
                </Link>

                <Link to="/vessels" className={`nav-item ${isActive('/vessels') ? 'active' : ''}`}>
                    <Ship size={18} />
                    <span>Vessels</span>
                </Link>

                <Link to="/decks" className={`nav-item ${isActive('/decks') ? 'active' : ''}`}>
                    <Layers size={18} />
                    <span>Decks & Materials</span>
                </Link>

                <Link to="/materials" className={`nav-item ${isActive('/materials') ? 'active' : ''}`}>
                    <ClipboardList size={18} />
                    <span>Materials Record</span>
                </Link>

                <Link to="/purchase-orders" className={`nav-item ${isActive('/purchase-orders') ? 'active' : ''}`}>
                    <FileText size={18} />
                    <span>Purchase Orders</span>
                </Link>

                <div className="nav-divider"></div>

                <Link to="/administration" className={`nav-item ${isActive('/administration') ? 'active' : ''}`}>
                    <Settings size={18} />
                    <span>Administration</span>
                </Link>

                <Link to="/users" className={`nav-item ${isActive('/users') ? 'active' : ''}`}>
                    <Users size={18} />
                    <span>Users & Security</span>
                </Link>

                <Link to="/master-data" className={`nav-item ${isActive('/master-data') ? 'active' : ''}`}>
                    <Database size={18} />
                    <span>Master Data</span>
                </Link>

                <Link to="/inventory-onboarding" className={`nav-item ${isActive('/inventory-onboarding') ? 'active' : ''}`}>
                    <Upload size={18} />
                    <span>Inventory Onboarding</span>
                </Link>

                <div className="nav-divider"></div>

                <Link to="/contact" className={`nav-item ${isActive('/contact') ? 'active' : ''}`}>
                    <Mail size={18} />
                    <span>Contact Us</span>
                </Link>
            </nav>

            {/* Vessel List Section */}
            <div className="vessel-list-section">
                <div className="vessel-list-header">
                    <h3>My Vessels</h3>
                    <button className="add-vessel-btn">
                        <span>+</span>
                    </button>
                </div>
                <div className="vessel-list">
                    {mockVessels.map((vessel) => (
                        <div
                            key={vessel.id}
                            className={`vessel-list-item ${selectedVessel === vessel.id ? 'active' : ''}`}
                            onClick={() => onVesselSelect(vessel.id)}
                        >
                            <Ship size={16} />
                            <div className="vessel-list-info">
                                <strong>{vessel.name}</strong>
                                <span>IMO {vessel.imoNumber}</span>
                            </div>
                            <div className={`vessel-status-dot ${getStatusDotClass(vessel.complianceStatus)}`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
