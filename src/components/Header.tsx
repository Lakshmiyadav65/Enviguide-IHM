import { Search, Bell, Check, FileText, AlertTriangle, BellOff, User, Pin } from 'lucide-react';
import { useState } from 'react';
import './Header.css';

interface HeaderProps {
    title?: string;
    userName?: string;
    userRole?: string;
    selectedVessel?: {
        name: string;
        imo: string;
    };
    notificationCount?: number;
}

export default function Header({
    title,
    userName = 'John Administrator',
    userRole = 'Admin'
}: HeaderProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifList, setNotifList] = useState([
        {
            id: 1,
            type: 'document',
            title: 'NEW DOCUMENT',
            subtitle: 'GA Plan Uploaded',
            description: 'The General Arrangement Plan Rev. 04 has been successfully uploaded and processed.',
            time: '2 mins ago',
            icon: <FileText size={18} />,
            color: '#3B82F6',
            unread: true
        },
        {
            id: 2,
            type: 'warning',
            title: 'COMPLIANCE WARNING',
            subtitle: 'Expiring Certificate',
            description: 'The IHM Statement of Compliance for MV Ocean Pioneer expires in 15 days.',
            time: '1 hour ago',
            icon: <AlertTriangle size={18} />,
            color: '#F59E0B',
            unread: true
        },
        {
            id: 3,
            type: 'update',
            title: 'MATERIAL UPDATE',
            subtitle: 'Bridge Proof Deck',
            description: "New material logs were pinned to the 'Bridge Proof' deck section by John Administra.",
            time: '3 hours ago',
            icon: <Pin size={18} />,
            color: '#8B5CF6',
            unread: true
        }
    ]);

    const activeCount = notifList.filter(n => n.unread).length;

    const handleClearAll = () => {
        setNotifList([]);
    };

    const handleMarkAsRead = (id: number) => {
        setNotifList(prev => prev.filter(n => n.id !== id));
    };

    return (
        <header className={`dashboard-header ${showNotifications ? 'notifications-open' : ''}`}>
            <div className="header-background" />
            {showNotifications && (
                <div className="notification-backdrop" onClick={() => setShowNotifications(false)} />
            )}
            <div className="header-left">
                {title && <h1 className="header-title-main">{title}</h1>}
            </div>
            <div className="header-center">
                <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search vessels, materials, POs..."
                        className="search-input"
                    />
                </div>
            </div>

            <div className="header-right">
                <div className="notification-container">
                    <button
                        className={`notification-btn ${showNotifications ? 'active' : ''}`}
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {activeCount > 0 && (
                            <span className="notification-badge">{activeCount}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className={`notification-card-overlay ${notifList.length === 0 ? 'is-empty' : ''}`}>
                            <div className="notification-card-header">
                                <div className="header-title-row">
                                    <h3 className="notification-card-title">Recent Notifications</h3>
                                    {activeCount > 0 && <span className="new-badge">{activeCount} NEW</span>}
                                </div>
                                {activeCount > 0 && (
                                    <button className="clear-all-btn" onClick={handleClearAll}>Clear all</button>
                                )}
                            </div>

                            <div className="notification-card-content">
                                {activeCount === 0 && notifList.length === 0 ? (
                                    <div className="no-notifications">
                                        <div className="no-notifications-icon-wrapper">
                                            <BellOff size={40} color="#94A3B8" />
                                        </div>
                                        <h3>No New Notifications</h3>
                                        <p>You are all caught up! Check back later for vessel updates.</p>
                                    </div>
                                ) : (
                                    <div className="notifications-list">
                                        {notifList.map((notif) => (
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
                                                    <div className="notif-actions">
                                                        {notif.unread && (
                                                            <button className="mark-read-btn" onClick={() => handleMarkAsRead(notif.id)}>
                                                                MARK AS READ <Check size={14} style={{ marginLeft: '-4px' }} /><Check size={14} style={{ marginLeft: '-10px' }} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {notif.unread && <div className="unread-dot" />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {notifList.length > 0 && (
                                <div className="notification-card-footer">
                                    <button className="view-all-btn">VIEW ALL NOTIFICATIONS</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="user-profile-container">
                    <div className="user-profile-info">
                        <div className="user-profile-name">{userName}</div>
                        <div className="user-profile-role">{userRole}</div>
                    </div>
                    <div className="user-profile-avatar">
                        <User size={20} color="#64748B" />
                    </div>
                </div>
            </div>
        </header>
    );
}
