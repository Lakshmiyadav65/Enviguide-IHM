import { Search, Bell, ChevronDown, Check, Info, FileText, AlertTriangle, BellOff } from 'lucide-react';
import { useState } from 'react';
import './Header.css';

interface HeaderProps {
    userName?: string;
    userRole?: string;
    selectedVessel?: {
        name: string;
        imo: string;
    };
    notificationCount?: number;
}

export default function Header({
    userName = 'John Administrator',
    userRole = 'Admin',
    selectedVessel = { name: 'MV Ocean Pioneer', imo: 'IMO: 9876543' },
    notificationCount = 1
}: HeaderProps) {
    const [showNotifications, setShowNotifications] = useState(false);

    // Mock notifications based on the screenshot
    const notifications = [
        {
            id: 1,
            type: 'document',
            title: 'NEW DOCUMENT',
            subtitle: 'GA Plan Uploaded',
            description: 'The General Arrangement Plan Rev. 04 has been successfully uploaded and processed.',
            time: '2 mins ago',
            icon: <FileText size={18} />,
            color: '#3B82F6'
        },
        {
            id: 2,
            type: 'warning',
            title: 'COMPLIANCE WARNING',
            subtitle: 'Expiring Certificate',
            description: 'The IHM Statement of Compliance for MV Ocean Pioneer expires in 15 days.',
            time: '1 hour ago',
            icon: <AlertTriangle size={18} />,
            color: '#F59E0B'
        },
        {
            id: 3,
            type: 'update',
            title: 'MATERIAL UPDATE',
            subtitle: 'Bridge Proof Deck',
            description: "New material logs were pinned to the 'Bridge Proof' deck section by John Administra.",
            time: '3 hours ago',
            icon: <Info size={18} />,
            color: '#8B5CF6'
        }
    ];

    return (
        <>
            {showNotifications && (
                <div className="notification-backdrop" onClick={() => setShowNotifications(false)} />
            )}
            <header className="dashboard-header">
                <div className="header-left-content" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <div className="search-bar" style={{ maxWidth: '600px', margin: 0 }}>
                        <Search size={24} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search vessels, materials, POs..."
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="header-right">
                    <button
                        className={`notification-btn ${showNotifications ? 'active' : ''}`}
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {notificationCount > 0 && (
                            <span className="notification-badge">{notificationCount}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="notification-card-overlay">
                            <div className="notification-card-header">
                                <div className="header-title-row">
                                    <h3 className="notification-card-title">Recent Notifications</h3>
                                    {notificationCount > 0 && <span className="new-badge">{notificationCount} NEW</span>}
                                </div>
                                {notificationCount > 0 && (
                                    <button className="clear-all-btn">Clear all</button>
                                )}
                            </div>

                            <div className="notification-card-content">
                                {notificationCount === 0 ? (
                                    <div className="no-notifications">
                                        <div className="no-notifications-icon-wrapper">
                                            <BellOff size={40} color="#94A3B8" />
                                        </div>
                                        <h3>No New Notifications</h3>
                                        <p>You are all caught up! Check back later for vessel updates.</p>
                                    </div>
                                ) : (
                                    <div className="notifications-list">
                                        {notifications.map((notif) => (
                                            <div key={notif.id} className="notification-item">
                                                <div className="notif-icon-col">
                                                    <div className="notif-icon-wrapper" style={{ backgroundColor: `${notif.color}15`, color: notif.color }}>
                                                        {notif.icon}
                                                    </div>
                                                </div>
                                                <div className="notif-content-col">
                                                    <div className="notif-header">
                                                        <span className="notif-category" style={{ color: notif.color }}>{notif.title}</span>
                                                        <span className="notif-time">{notif.time}</span>
                                                    </div>
                                                    <h4 className="notif-subtitle">{notif.subtitle}</h4>
                                                    <p className="notif-desc">{notif.description}</p>
                                                    <button className="mark-read-btn">
                                                        MARK AS READ <Check size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {notificationCount > 0 && (
                                <div className="notification-card-footer">
                                    <button className="view-all-btn">VIEW ALL NOTIFICATIONS</button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="user-profile">
                        <div className="user-avatar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <div className="user-info">
                            <div className="user-name">{userName}</div>
                            <div className="user-role">{userRole}</div>
                        </div>
                        <ChevronDown size={16} className="user-chevron" />
                    </div>
                </div>
            </header>
        </>
    );
}
