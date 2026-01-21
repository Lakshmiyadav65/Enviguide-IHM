import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Ship,
    Layers,
    FileText,
    ShoppingCart,
    Settings,
    Users,
    Database,
    Upload,
    Mail,
    ChevronDown
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/vessels', icon: Ship, label: 'Vessels' },
        { path: '/decks', icon: Layers, label: 'Decks & Materials', hasSubmenu: true },
        { path: '/materials', icon: FileText, label: 'Materials Record', hasSubmenu: true },
        { path: '/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders' },
        { path: '/administration', icon: Settings, label: 'Administration', hasSubmenu: true },
        { path: '/inventory', icon: Upload, label: 'Inventory Onboarding', hasSubmenu: true },
        { path: '/security', icon: Users, label: 'Security & Users', hasSubmenu: true },
        { path: '/master-data', icon: Database, label: 'Master Data', hasSubmenu: true },
        { path: '/contact', icon: Mail, label: 'Contact Us' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <Ship size={24} />
                    </div>
                    <div className="logo-text">
                        <h2>IHM Platform</h2>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <item.icon size={20} className="nav-icon" />
                        <span className="nav-label">{item.label}</span>
                        {item.hasSubmenu && <ChevronDown size={16} className="nav-chevron" />}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
