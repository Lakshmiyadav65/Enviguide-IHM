import { useState } from 'react';
import { Search, Bell, ChevronDown, Ship, Anchor } from 'lucide-react';
import { mockVessels } from '../../services/mockData';
import './Header.css';

interface HeaderProps {
    selectedVessel: string | null;
}

export default function Header({ selectedVessel }: HeaderProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const vessel = mockVessels.find(v => v.id === selectedVessel);

    return (
        <header className="top-header">
            <div className={`vessel-context ${vessel ? 'active' : ''}`}>
                {vessel ? (
                    <>
                        <Ship size={20} />
                        <div>
                            <strong>{vessel.name}</strong>
                            <span>IMO {vessel.imoNumber}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <Anchor size={20} />
                        <span>No vessel selected</span>
                    </>
                )}
            </div>

            <div className="header-actions">
                <div className="search-container">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search vessels, POs, materials..."
                        className="search-input"
                    />
                </div>

                <button
                    className="icon-button"
                    onClick={() => setShowNotifications(!showNotifications)}
                >
                    <Bell size={18} />
                    <span className="notification-badge">3</span>
                </button>

                <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
                    <img
                        src="https://ui-avatars.com/api/?name=Admin+User&background=0891b2&color=fff"
                        alt="User Profile"
                    />
                    <span>Admin User</span>
                    <ChevronDown size={14} />
                </div>

                {/* Notifications Dropdown */}
                {showNotifications && (
                    <div className="notifications-dropdown">
                        <div className="dropdown-header">
                            <h3>Notifications</h3>
                            <p>You have 3 new notifications</p>
                        </div>
                        <div className="notification-item alert">
                            <div className="notification-icon">⚠️</div>
                            <div>
                                <strong>SOC Certificate Expired</strong>
                                <p>Maersk Elba (IMO 9456789) certificate expired 15 days ago</p>
                                <span className="time">2 hours ago</span>
                            </div>
                        </div>
                        <div className="notification-item warning">
                            <div className="notification-icon">⏰</div>
                            <div>
                                <strong>Pending Material Declarations</strong>
                                <p>89 material declarations are pending review</p>
                                <span className="time">5 hours ago</span>
                            </div>
                        </div>
                        <div className="notification-item success">
                            <div className="notification-icon">✓</div>
                            <div>
                                <strong>New Vessel Onboarded</strong>
                                <p>Sajir (IMO 9839471) has been successfully onboarded</p>
                                <span className="time">1 day ago</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Menu Dropdown */}
                {showUserMenu && (
                    <div className="user-menu-dropdown">
                        <div className="dropdown-header">
                            <strong>Admin User</strong>
                            <span>admin@ihm-platform.com</span>
                        </div>
                        <a href="#" className="menu-item">
                            <span>👤</span>
                            Profile Settings
                        </a>
                        <a href="#" className="menu-item">
                            <span>⚙️</span>
                            Preferences
                        </a>
                        <div className="menu-divider"></div>
                        <a href="#" className="menu-item logout">
                            <span>🚪</span>
                            Logout
                        </a>
                    </div>
                )}
            </div>
        </header>
    );
}
