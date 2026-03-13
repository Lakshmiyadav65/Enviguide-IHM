import { useState, useEffect, useRef } from 'react';
import { 
    ChevronDown, ChevronRight, Save, X, User, Shield, 
    Check, Minus
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './UserRights.css';

interface PermissionNode {
    id: string;
    label: string;
    children?: PermissionNode[];
}

const PERMISSIONS_DATA: PermissionNode[] = [
    { id: 'admin_dashboard', label: 'Admin Dashboard' },
    { id: 'owner_dashboard', label: 'Owner Dashboard' },
    {
        id: 'vessel',
        label: 'Vessel',
        children: [
            {
                id: 'ship',
                label: 'Ship',
                children: [
                    { id: 'ship_view', label: 'View Record' },
                    { id: 'ship_add', label: 'Add Record' },
                    { id: 'ship_edit', label: 'Edit Record' },
                    { id: 'ship_delete', label: 'Delete Record' },
                    { id: 'ship_restore', label: 'Restore Record' },
                ]
            },
            {
                id: 'fleet',
                label: 'Fleet',
                children: [
                    { id: 'fleet_view', label: 'View Record' },
                    { id: 'fleet_add', label: 'Add Record' },
                    { id: 'fleet_edit', label: 'Edit Record' },
                    { id: 'fleet_delete', label: 'Delete Record' },
                    { id: 'fleet_restore', label: 'Restore Record' },
                ]
            },
            {
                id: 'sub_fleet',
                label: 'Sub Fleet',
                children: [
                    { id: 'subfleet_view', label: 'View Record' },
                    { id: 'subfleet_add', label: 'Add Record' },
                    { id: 'subfleet_edit', label: 'Edit Record' },
                    { id: 'subfleet_delete', label: 'Delete Record' },
                    { id: 'subfleet_restore', label: 'Restore Record' },
                ]
            }
        ]
    },
    {
        id: 'administration',
        label: 'Administration',
        children: [
            {
                id: 'upload_po',
                label: 'Upload Purchase Orders',
                children: [
                    { id: 'upo_view', label: 'View Record' },
                    { id: 'upo_add', label: 'Add Record' },
                    { id: 'upo_edit', label: 'Edit Record' },
                    { id: 'upo_delete', label: 'Delete Record' },
                    { id: 'upo_restore', label: 'Restore Record' },
                ]
            },
            {
                id: 'pending_audits',
                label: 'Pending Audits',
                children: [
                    { id: 'pa_view', label: 'View Record' },
                    { id: 'pa_add', label: 'Add Record' },
                    { id: 'pa_edit', label: 'Edit Record' },
                    { id: 'pa_delete', label: 'Delete Record' },
                    { id: 'pa_restore', label: 'Restore Record' },
                ]
            },
            {
                id: 'pending_review',
                label: 'Pending Review',
                children: [
                    { id: 'pr_view', label: 'View Record' },
                    { id: 'pr_add', label: 'Add Record' }
                ]
            }
        ]
    }
];

const USERS = [
    { id: 1, name: 'John Administrator', role: 'Admin', email: 'john.admin@enviguide.com' },
    { id: 2, name: 'Vishnu', role: 'Premium User', email: 'vishnu@example.com' },
    { id: 3, name: 'Sarah Marine', role: 'Viewer', email: 'sarah.m@example.com' }
];

export default function UserRights() {
    const [selectedUser, setSelectedUser] = useState(USERS[0]);
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['vessel', 'administration', 'ship', 'fleet', 'sub_fleet', 'upload_po', 'pending_audits', 'pending_review']));
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getAllChildIds = (node: PermissionNode): string[] => {
        let ids = [node.id];
        if (node.children) {
            node.children.forEach(child => {
                ids = [...ids, ...getAllChildIds(child)];
            });
        }
        return ids;
    };

    const togglePermission = (node: PermissionNode) => {
        const idsToToggle = getAllChildIds(node);
        const newCheckedIds = new Set(checkedIds);
        const isCurrentlyChecked = checkedIds.has(node.id);

        if (isCurrentlyChecked) {
            idsToToggle.forEach(id => newCheckedIds.delete(id));
        } else {
            idsToToggle.forEach(id => newCheckedIds.add(id));
        }

        setCheckedIds(newCheckedIds);
    };

    const toggleExpansion = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newExpandedIds = new Set(expandedIds);
        if (newExpandedIds.has(id)) {
            newExpandedIds.delete(id);
        } else {
            newExpandedIds.add(id);
        }
        setExpandedIds(newExpandedIds);
    };

    const isNodeSemiChecked = (node: PermissionNode): boolean => {
        if (!node.children || node.children.length === 0) return false;
        const childIds = getAllChildIds(node).filter(id => id !== node.id);
        const checkedChildren = childIds.filter(id => checkedIds.has(id));
        return checkedChildren.length > 0 && checkedChildren.length < childIds.length;
    };

    const handleAllToggle = () => {
        const allIds: string[] = [];
        const flatGet = (nodes: PermissionNode[]) => {
            nodes.forEach(n => {
                allIds.push(n.id);
                if (n.children) flatGet(n.children);
            });
        };
        flatGet(PERMISSIONS_DATA);

        if (checkedIds.size === allIds.length) {
            setCheckedIds(new Set());
        } else {
            setCheckedIds(new Set(allIds));
        }
    };

    const renderPermissionNode = (node: PermissionNode, level: number = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedIds.has(node.id);
        const isChecked = checkedIds.has(node.id);
        const isSemi = isNodeSemiChecked(node);

        return (
            <div key={node.id} className="permission-node-wrapper" style={{ marginLeft: `${level * 24}px` }}>
                <div className="permission-node-row">
                    <div className="node-expander" onClick={(e) => hasChildren && toggleExpansion(node.id, e)}>
                        {hasChildren ? (
                            isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />
                        ) : null}
                    </div>
                    
                    <label className="premium-checkbox-container">
                        <div className="checkbox-box" onClick={() => togglePermission(node)}>
                            <input 
                                type="checkbox" 
                                checked={isChecked} 
                                readOnly 
                            />
                            <div className={`checkbox-custom ${isChecked ? 'checked' : ''} ${isSemi ? 'semi' : ''}`}>
                                {isChecked && <Check size={14} />}
                                {isSemi && !isChecked && <Minus size={14} />}
                            </div>
                        </div>
                        <span className="node-label" onClick={() => hasChildren && toggleExpansion(node.id, {} as any)}>{node.label}</span>
                    </label>
                </div>

                {hasChildren && isExpanded && (
                    <div className="node-children">
                        {node.children!.map(child => renderPermissionNode(child, 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="userrights-page-container">
            <Sidebar />
            <div className="userrights-page-main">
                <Header notificationCount={3} />
                
                <div className="userrights-content-wrapper">
                    <div className="userrights-header">
                        <div className="header-titles">
                            <h1>User Rights</h1>
                            <p>Configure granular access control and functional permissions for users.</p>
                        </div>
                        <div className="header-actions">
                            <button className="userrights-action-btn cancel">
                                <X size={20} />
                                <span>Cancel Changes</span>
                            </button>
                            <button className="userrights-action-btn save">
                                <Save size={20} />
                                <span>Save Permissions</span>
                            </button>
                        </div>
                    </div>

                    <div className="userrights-grid">
                        {/* User Selection Card */}
                        <div className="userrights-card user-selector-card">
                            <div className="card-inner">
                                <div className="selector-group" ref={dropdownRef}>
                                    <label className="selector-label">Select User</label>
                                    <div 
                                        className={`premium-user-dropdown ${isUserDropdownOpen ? 'active' : ''}`}
                                        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                    >
                                        <div className="selected-user-info">
                                            <div className="user-avatar-mini">
                                                <User size={16} color="#00B0FA" />
                                            </div>
                                            <div className="user-meta">
                                                <span className="user-name-val">{selectedUser.name}</span>
                                                <span className="user-role-val">{selectedUser.role}</span>
                                            </div>
                                        </div>
                                        <ChevronDown size={18} className={`select-chevron ${isUserDropdownOpen ? 'rotate' : ''}`} />
                                    </div>

                                    {isUserDropdownOpen && (
                                        <div className="user-dropdown-menu-premium">
                                            {USERS.map(user => (
                                                <div 
                                                    key={user.id} 
                                                    className={`user-dropdown-item ${selectedUser.id === user.id ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsUserDropdownOpen(false);
                                                    }}
                                                >
                                                    <div className="item-avatar">
                                                        <User size={14} />
                                                    </div>
                                                    <div className="item-details">
                                                        <span className="item-name">{user.name}</span>
                                                        <span className="item-email">{user.email}</span>
                                                    </div>
                                                    {selectedUser.id === user.id && <Check size={14} color="#00B0FA" />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="user-access-summary">
                                    <div className="summary-title">Access Status</div>
                                    <div className="status-badge-active">
                                        <Shield size={14} />
                                        <span>Authenticated Account</span>
                                    </div>
                                    <div className="summary-desc">
                                        Granting permissions below will take effect immediately upon saving.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Permissions Tree Card */}
                        <div className="userrights-card permissions-card">
                            <div className="tree-header">
                                <div className="tree-title-group">
                                    <Shield size={20} color="#00B0FA" />
                                    <h3>Permission Hierarchy</h3>
                                </div>
                                <button className="select-all-btn" onClick={handleAllToggle}>
                                    {checkedIds.size > 0 ? 'Clear All' : 'Select All'}
                                </button>
                            </div>

                            <div className="permissions-tree-container">
                                {/* All Checkbox */}
                                <div className="permission-node-wrapper-all">
                                    <label className="premium-checkbox-container global-all">
                                        <div className="checkbox-box" onClick={handleAllToggle}>
                                            <input 
                                                type="checkbox" 
                                                checked={checkedIds.size === 50} // Rough number of total nodes
                                                readOnly 
                                            />
                                            <div className={`checkbox-custom global ${checkedIds.size > 0 ? (checkedIds.size < 50 ? 'semi' : 'checked') : ''}`}>
                                                {checkedIds.size === 50 && <Check size={14} />}
                                                {checkedIds.size > 0 && checkedIds.size < 50 && <Minus size={14} />}
                                            </div>
                                        </div>
                                        <span className="node-label-global">All Permissions</span>
                                    </label>
                                </div>

                                <div className="tree-scroll-area">
                                    {PERMISSIONS_DATA.map(node => renderPermissionNode(node))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
