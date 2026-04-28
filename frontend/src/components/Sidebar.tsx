import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Ship,
    Layers,
    FileText,
    Settings,
    Upload,
    Mail,
    ChevronDown,
    ChevronLeft,
    Menu as MenuIcon,
    Lock
} from 'lucide-react';
import './Sidebar.css';

interface MenuItem {
    path: string;
    icon: any;
    label: string;
    children?: {
        path: string;
        label: string;
        icon?: any;
    }[];
}

/**
 * Detail / wizard pages don't have their own sidebar entry, but they
 * logically belong to one of the existing sub-items. When the user is
 * on one of these routes, we keep the parent menu expanded and the
 * matching sub-item highlighted as if they were on the list page.
 *
 *   key   = the sub-item path that should light up
 *   value = predicate run against the current pathname
 */
const CHILD_ROUTE_ALIASES: Record<string, (path: string) => boolean> = {
    '/administration/md-sdoc-audit': (p) => p.startsWith('/administration/document-audit/'),
    '/administration/pending-reviews': (p) => p.startsWith('/administration/review-detail/'),
};

function matchesChildRoute(childPath: string, currentPath: string): boolean {
    if (currentPath === childPath) return true;
    const alias = CHILD_ROUTE_ALIASES[childPath];
    return alias ? alias(currentPath) : false;
}

const menuItems: MenuItem[] = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
    {
        path: '/vessels',
        icon: Ship,
        label: 'Vessel',
        children: [
            { path: '/vessels/ship', icon: Ship, label: 'Ship' },
            { path: '/vessels/fleet', icon: Layers, label: 'Fleet' },
            { path: '/vessels/sub-fleet', icon: Layers, label: 'Sub Fleet' },
        ]
    },
    {
        path: '/menu',
        icon: MenuIcon,
        label: 'Menu',
        children: [
            { path: '/menu/registered', label: 'Registered' },
            { path: '/menu/ownership', label: 'Ownership' },
            { path: '/menu/ownership-manager', label: 'Ownership Manager' },
            { path: '/menu/supplier', label: 'Supplier' },
            { path: '/menu/equipment', label: 'Equipment' },
            { path: '/menu/suspended', label: 'Suspended' },
            { path: '/menu/suspected-keyword', label: 'Suspected Keyword' },
        ]
    },
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
    {
        path: '/security',
        icon: Lock,
        label: 'Security',
        children: [
            { path: '/security/users', label: 'Users' },
            { path: '/security/user-profile', label: 'User Profile' },
            { path: '/security/user-menu', label: 'User Menu' },
            { path: '/security/user-rights', label: 'User Rights' },
            { path: '/security/user-role-rights', label: 'User Role Rights' },
            { path: '/security/user-category', label: 'User Category' },
        ]
    },
    { path: '/contact', icon: Mail, label: 'Contact Us' },
];

export default function Sidebar() {
    const location = useLocation();
    const [expandedItem, setExpandedItem] = useState<string>('');
    const [activeFocus, setActiveFocus] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        const currentPath = location.pathname;
        const parentItem = menuItems.find(item =>
            item.children?.some(child => matchesChildRoute(child.path, currentPath)),
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
                    const hasChildren = !!(item.children && item.children.length > 0);
                    const isOnChildRoute = hasChildren && item.children?.some(child => matchesChildRoute(child.path, location.pathname));
                    const isActive = !hasChildren && location.pathname === item.path && activeFocus === null;
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
                                    {item.children?.map((child) => (
                                        <Link
                                            key={child.path}
                                            to={child.path}
                                            className={`nav-item sub-item ${matchesChildRoute(child.path, location.pathname) || (child.label === 'Ship' && location.pathname === '/vessels') ? 'sub-active' : ''}`}
                                            onClick={() => {
                                                setActiveFocus(null);
                                                if (isCollapsed) setIsCollapsed(false);
                                            }}
                                        >
                                            {child.icon ? (
                                                <child.icon size={18} className="nav-icon" />
                                            ) : (
                                                <div className="nav-icon-placeholder" />
                                            )}
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
