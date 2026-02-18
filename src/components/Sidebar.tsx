import { useState, useEffect } from 'react';
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
    ChevronDown,
    ChevronLeft
} from 'lucide-react';
import './Sidebar.css';

const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
    {
        path: '/vessels',
        icon: Ship,
        label: 'Vessels',
        children: [
            { path: '/vessels/ship', icon: Ship, label: 'Ship' },
            { path: '/vessels/fleet', icon: Layers, label: 'Fleet' },
            { path: '/vessels/sub-fleet', icon: Layers, label: 'Sub Fleet' },
        ]
    },
    { path: '/decks', icon: Layers, label: 'Decks & Materials' },
    { path: '/materials', icon: FileText, label: 'Materials Record' },
    { path: '/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders' },
    {
        path: '/administration',
        icon: Settings,
        label: 'Administration',
        children: [
            { path: '/administration/upload-po', icon: Upload, label: 'Upload Purchase Order' },
            { path: '/administration/pending-audits', icon: FileText, label: 'Pending Audits' },
            { path: '/administration/pending-reviews', icon: FileText, label: 'Pending Reviews' },
            { path: '/administration/md-sdoc-audit', icon: FileText, label: 'MD SDOC Audit Pending' },
        ]
    },
    { path: '/users', icon: Users, label: 'Users & Security' },
    { path: '/master-data', icon: Database, label: 'Master Data' },
    { path: '/inventory', icon: Upload, label: 'Inventory Onboarding' },
    { path: '/contact', icon: Mail, label: 'Contact Us' },
];

export default function Sidebar() {
    const location = useLocation();
    const [expandedItem, setExpandedItem] = useState<string>('');
    const [activeFocus, setActiveFocus] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // Sync expanded state with route
    useEffect(() => {
        const currentPath = location.pathname;
        const parentItem = menuItems.find(item =>
            item.children && item.children.some(child => currentPath === child.path)
        );
        if (parentItem) {
            setExpandedItem(parentItem.label);
        }
    }, [location.pathname]);

    const toggleSubmenu = (label: string) => {
        if (isCollapsed) {
            setIsCollapsed(false);
            setExpandedItem(label);
            setActiveFocus(label);
            return;
        }

        if (expandedItem === label) {
            setExpandedItem('');
            setActiveFocus(null);
        } else {
            setExpandedItem(label);
            setActiveFocus(label);
        }
    };


    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isLocked ? 'locked' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <Ship size={24} />
                    </div>
                    <div className="logo-text">
                        <h2>IHM Platform</h2>
                        <p className="logo-subtitle">Maritime Safety</p>
                    </div>
                </div>
                <button
                    className="sidebar-toggle-btn"
                    onClick={() => {
                        if (!isCollapsed) {
                            setIsLocked(true);
                            setTimeout(() => setIsLocked(false), 500);
                        }
                        setIsCollapsed(!isCollapsed);
                    }}
                >
                    <ChevronLeft size={20} />
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const isExpanded = expandedItem === item.label;
                    const hasChildren = item.children && item.children.length > 0;

                    // Check if we're on a child route of this parent
                    const isOnChildRoute = hasChildren && item.children.some(child => location.pathname === child.path);

                    // A regular page is "active" (blue) if it matches the path AND no category has the manual focus
                    const isActive = !hasChildren && location.pathname === item.path && activeFocus === null;

                    // A category is "blue" if it has the manual focus OR we are on one of its child routes
                    const isCategoryBlue = hasChildren && (activeFocus === item.label || isOnChildRoute);

                    return (
                        <div key={item.path} className="nav-item-container">
                            {hasChildren ? (
                                <div
                                    className={`nav-item ${isCategoryBlue ? 'active' : ''}`}
                                    onClick={() => toggleSubmenu(item.label)}
                                >
                                    <item.icon size={20} className="nav-icon" />
                                    <span className="nav-label">{item.label}</span>
                                    <ChevronDown
                                        size={16}
                                        className={`nav-chevron ${isExpanded ? 'rotate' : ''}`}
                                    />
                                </div>
                            ) : (
                                <Link
                                    to={item.path}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveFocus(null);
                                        if (isCollapsed) setIsCollapsed(false);
                                    }}
                                >
                                    <item.icon size={20} className="nav-icon" />
                                    <span className="nav-label">{item.label}</span>
                                </Link>
                            )}

                            {hasChildren && isExpanded && (
                                <div className="submenu">
                                    {item.children.map((child) => (
                                        <Link
                                            key={child.path}
                                            to={child.path}
                                            className={`nav-item sub-item ${location.pathname === child.path || (child.label === 'Ship' && location.pathname === '/vessels') ? 'sub-active' : ''}`}
                                            onClick={() => {
                                                setActiveFocus(null);
                                                if (isCollapsed) setIsCollapsed(false);
                                            }}
                                        >
                                            <child.icon size={18} className="nav-icon" />
                                            <span className="nav-label">{child.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
