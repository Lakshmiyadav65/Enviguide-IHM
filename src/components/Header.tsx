import { Search, Bell, ChevronDown } from 'lucide-react';
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
    return (
        <header className="dashboard-header">
            <div className="header-left">
                <div className="vessel-selector">
                    <div className="vessel-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                            <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76" />
                            <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" />
                        </svg>
                    </div>
                    <div className="vessel-info">
                        <div className="vessel-name">{selectedVessel.name}</div>
                        <div className="vessel-imo">{selectedVessel.imo}</div>
                    </div>
                    <ChevronDown size={16} className="vessel-chevron" />
                </div>
            </div>

            <div className="header-center">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search vessels, materials, POs..."
                        className="search-input"
                    />
                </div>
            </div>

            <div className="header-right">
                <button className="notification-btn">
                    <Bell size={20} />
                    {notificationCount > 0 && (
                        <span className="notification-badge">{notificationCount}</span>
                    )}
                </button>

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
    );
}
