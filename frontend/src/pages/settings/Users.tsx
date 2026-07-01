import { useState, useEffect } from 'react';
import {
    Search, Plus, Edit2,
    Trash2, Filter, Download, Mail,
    Phone, Globe, Tag, FileText, AlertTriangle,
    History, Users as UsersIcon, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { api } from '../../lib/apiClient';
import { ENDPOINTS } from '../../config/api.config';
import './Users.css';

interface UserData {
    id: string;
    contactPerson: string;
    email: string;
    country: string;
    phone: string;
    status: 'Active' | 'Inactive';
    paymentStatus: 'Paid' | 'Unpaid';
    category: string;
    origin: string;
    lastActivity?: number; // days
    password?: string;
}

const EMPTY_FORM: Omit<UserData, 'id'> = {
    contactPerson: '',
    email: '',
    country: '',
    phone: '',
    status: 'Active',
    paymentStatus: 'Unpaid',
    category: 'Ship Owner',
    origin: 'Direct',
    password: ''
};

export default function Users() {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<UserData[]>([]);
    const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal control states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<Omit<UserData, 'id'>>(EMPTY_FORM);
    const [modalError, setModalError] = useState<string | null>(null);
    const [modalSubmitting, setModalSubmitting] = useState(false);

    // Load users from MongoDB Atlas on mount
    const fetchUsers = () => {
        setLoading(true);
        setError(null);
        api.get<{ success: boolean; data: any[] }>(ENDPOINTS.USERS.LIST)
            .then((res) => {
                if (res.success && Array.isArray(res.data)) {
                    const mapped: UserData[] = res.data.map(u => ({
                        id: u.id,
                        contactPerson: u.name || '',
                        email: u.email || '',
                        country: u.country || '',
                        phone: u.phone || '',
                        status: u.status === 'active' ? 'Active' : 'Inactive',
                        paymentStatus: u.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid',
                        category: u.category || '',
                        origin: u.origin || 'Direct',
                        lastActivity: u.lastActivity || 0
                    }));
                    setUsers(mapped);
                } else {
                    setError('Unexpected data format received');
                }
            })
            .catch((err) => {
                console.error('Failed to load users:', err);
                setError('Failed to retrieve users. Please verify your connection.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Create user handler
    const handleCreateUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.contactPerson || !formData.email) {
            setModalError('Name and Email are required fields.');
            return;
        }

        setModalSubmitting(true);
        setModalError(null);

        try {
            const payload = {
                name: formData.contactPerson,
                email: formData.email,
                password: formData.password || 'Envi123', // default password fallback
                country: formData.country,
                phone: formData.phone,
                status: formData.status.toLowerCase(),
                paymentStatus: formData.paymentStatus,
                category: formData.category,
                origin: formData.origin
            };

            await api.post(ENDPOINTS.USERS.LIST, payload);
            setShowAddModal(false);
            setFormData(EMPTY_FORM);
            fetchUsers();
        } catch (err: any) {
            console.error('Error creating user:', err);
            setModalError(err.message || 'Failed to create user. Please try again.');
        } finally {
            setModalSubmitting(false);
        }
    };

    // Update user handler
    const handleUpdateUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        if (!formData.contactPerson || !formData.email) {
            setModalError('Name and Email are required fields.');
            return;
        }

        setModalSubmitting(true);
        setModalError(null);

        try {
            const payload: Record<string, any> = {
                name: formData.contactPerson,
                email: formData.email,
                country: formData.country,
                phone: formData.phone,
                status: formData.status.toLowerCase(),
                paymentStatus: formData.paymentStatus,
                category: formData.category,
                origin: formData.origin
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            await api.put(ENDPOINTS.USERS.DETAIL(selectedUser.id), payload);
            setShowEditModal(false);
            setSelectedUser(null);
            setFormData(EMPTY_FORM);
            fetchUsers();
        } catch (err: any) {
            console.error('Error updating user:', err);
            setModalError(err.message || 'Failed to update user. Please try again.');
        } finally {
            setModalSubmitting(false);
        }
    };

    // Delete user handler
    const handleDeleteUserSubmit = async () => {
        if (!selectedUser) return;
        setModalSubmitting(true);
        setModalError(null);

        try {
            await api.delete(ENDPOINTS.USERS.DETAIL(selectedUser.id));
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (err: any) {
            console.error('Error deleting user:', err);
            setModalError(err.message || 'Failed to delete user.');
        } finally {
            setModalSubmitting(false);
        }
    };

    const openAddModal = () => {
        setFormData(EMPTY_FORM);
        setModalError(null);
        setShowAddModal(true);
    };

    const openEditModal = (user: UserData) => {
        setSelectedUser(user);
        setFormData({
            contactPerson: user.contactPerson,
            email: user.email,
            country: user.country,
            phone: user.phone,
            status: user.status,
            paymentStatus: user.paymentStatus,
            category: user.category,
            origin: user.origin,
            password: ''
        });
        setModalError(null);
        setShowEditModal(true);
    };

    const openDeleteModal = (user: UserData) => {
        setSelectedUser(user);
        setModalError(null);
        setShowDeleteModal(true);
    };

    // In-memory searching and filtering
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.category || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'All' || user.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="users-page-container">
            <Sidebar />
            <main className="users-page-main">
                <Header notificationCount={users.filter(u => u.status === 'Inactive').length} />

                <div className="users-content-wrapper">
                    {/* Hero header card */}
                    <div className="users-hero-card">
                        <div className="hero-left">
                            <div className="hero-icon">
                                <UsersIcon size={26} />
                            </div>
                            <div className="hero-text">
                                <h1>User Management</h1>
                                <p>Manage roles, registration details, and payment statuses for contact persons.</p>
                            </div>
                        </div>
                        <div className="hero-actions">
                            <button className="btn-bulk" onClick={() => alert('Bulk Import feature is currently under review')}>
                                <FileText size={18} />
                                <span>Bulk Import</span>
                            </button>
                            <button className="btn-add" onClick={openAddModal}>
                                <Plus size={18} />
                                <span>Add New User</span>
                            </button>
                        </div>
                    </div>

                    <div className="users-main-card">
                        <div className="users-toolbar">
                            <div className="users-search-box">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email or category..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="toolbar-groups">
                                <div className="status-toggle">
                                    <button
                                        className={filterStatus === 'All' ? 'active' : ''}
                                        onClick={() => setFilterStatus('All')}
                                    >
                                        All
                                    </button>
                                    <button
                                        className={filterStatus === 'Active' ? 'active' : ''}
                                        onClick={() => setFilterStatus('Active')}
                                    >
                                        Active
                                    </button>
                                    <button
                                        className={filterStatus === 'Inactive' ? 'active' : ''}
                                        onClick={() => setFilterStatus('Inactive')}
                                    >
                                        Inactive
                                    </button>
                                </div>

                                <button className="btn-icon" onClick={fetchUsers} title="Refresh Data">
                                    <History size={18} />
                                </button>
                                <button className="btn-icon" onClick={() => alert('Filters export feature is currently under review')}>
                                    <Filter size={18} />
                                </button>
                                <button className="btn-icon" onClick={() => alert('Download report is currently under review')}>
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{ padding: '20px 24px', color: '#EF4444', fontWeight: 600, fontSize: '13px' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="table-responsive">
                            {loading ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                                    Loading users from database...
                                </div>
                            ) : (
                                <table className="premium-table">
                                    <thead>
                                        <tr>
                                            <th className="sticky-col">Action</th>
                                            <th>Contact Person</th>
                                            <th>Registration Details</th>
                                            <th>Status</th>
                                            <th>Payment</th>
                                            <th>Category</th>
                                            <th>Last Activity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <tr key={user.id}>
                                                <td className="sticky-col">
                                                    <div className="action-btns">
                                                        <button className="btn-edit" title="Edit User" onClick={() => openEditModal(user)}>
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button className="btn-history" title="View Details" onClick={() => alert(`User metadata:\nID: ${user.id}\nOrigin: ${user.origin}`)}>
                                                            <History size={14} />
                                                        </button>
                                                        <button className="btn-delete" title="Delete User" onClick={() => openDeleteModal(user)}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="person-cell">
                                                        <div className="avatar-mini">
                                                            {(user.contactPerson || 'U').charAt(0)}
                                                        </div>
                                                        <div className="person-info">
                                                            <span className="person-name">{user.contactPerson}</span>
                                                            <div className="person-sub">
                                                                <Mail size={12} />
                                                                <span>{user.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="meta-cell">
                                                        <div className="meta-item">
                                                            <Globe size={12} />
                                                            <span>{user.country || 'N/A'}</span>
                                                        </div>
                                                        <div className="meta-item">
                                                            <Phone size={12} />
                                                            <span>{user.phone || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge-status ${user.status.toLowerCase()}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge-payment ${user.paymentStatus.toLowerCase()}`}>
                                                        {user.paymentStatus}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="category-cell">
                                                        <Tag size={12} className="tag-icon" />
                                                        <span>{user.category || 'Viewer'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={`activity-cell ${user.lastActivity && user.lastActivity > 365 ? 'overdue' : ''}`}>
                                                        {user.lastActivity && user.lastActivity > 365 && <AlertTriangle size={14} />}
                                                        <span>{user.lastActivity ? `${user.lastActivity} days ago` : 'Never'}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                                                    No users found matching current filters.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="table-footer">
                            <span className="count-text">Showing <b>{filteredUsers.length}</b> of {users.length} contact persons</span>
                            <div className="pagination">
                                <button className="prev" disabled aria-label="Previous page">
                                    <ChevronLeft size={14} />
                                </button>
                                <button className="page-num active">1</button>
                                <button className="next" disabled aria-label="Next page">
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── ADD USER MODAL ── */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h3>Add New User Account</h3>
                            <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUserSubmit}>
                            <div className="modal-body">
                                {modalError && <div className="error-banner">{modalError}</div>}
                                
                                <div className="form-group">
                                    <label>Contact Person Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email Address *</label>
                                    <input
                                        type="email"
                                        placeholder="john.doe@company.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Password (Default: Envi123)</label>
                                    <input
                                        type="password"
                                        placeholder="Min 6 characters"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Country</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Netherlands"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. +31 6 12345678"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="admin">Admin User</option>
                                        <option value="manager">Manager</option>
                                        <option value="viewer">Viewer</option>
                                        <option value="surveyor">Surveyor</option>
                                        <option value="deck officer">Deck Officer</option>
                                        <option value="Certified hazmat Companies">Certified hazmat Companies</option>
                                        <option value="Ship Owner">Ship Owner</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Origin</label>
                                    <select
                                        value={formData.origin}
                                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                    >
                                        <option value="Direct">Direct</option>
                                        <option value="Partner">Partner</option>
                                        <option value="System">System</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Payment Status</label>
                                    <select
                                        value={formData.paymentStatus}
                                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as 'Paid' | 'Unpaid' })}
                                    >
                                        <option value="Unpaid">Unpaid</option>
                                        <option value="Paid">Paid</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Account Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-modal-cancel" onClick={() => setShowAddModal(false)} disabled={modalSubmitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-modal-submit" disabled={modalSubmitting}>
                                    {modalSubmitting ? 'Adding...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── EDIT USER MODAL ── */}
            {showEditModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h3>Edit User Account: {selectedUser.contactPerson}</h3>
                            <button className="btn-icon" onClick={() => setShowEditModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUserSubmit}>
                            <div className="modal-body">
                                {modalError && <div className="error-banner">{modalError}</div>}
                                
                                <div className="form-group">
                                    <label>Contact Person Name *</label>
                                    <input
                                        type="text"
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email Address *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        disabled // email typically shouldn't be altered once registered
                                    />
                                </div>

                                <div className="form-group">
                                    <label>New Password (Leave blank to keep current)</label>
                                    <input
                                        type="password"
                                        placeholder="Enter new password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Country</label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="admin">Admin User</option>
                                        <option value="manager">Manager</option>
                                        <option value="viewer">Viewer</option>
                                        <option value="surveyor">Surveyor</option>
                                        <option value="deck officer">Deck Officer</option>
                                        <option value="Certified hazmat Companies">Certified hazmat Companies</option>
                                        <option value="Ship Owner">Ship Owner</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Origin</label>
                                    <select
                                        value={formData.origin}
                                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                    >
                                        <option value="Direct">Direct</option>
                                        <option value="Partner">Partner</option>
                                        <option value="System">System</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Payment Status</label>
                                    <select
                                        value={formData.paymentStatus}
                                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as 'Paid' | 'Unpaid' })}
                                    >
                                        <option value="Unpaid">Unpaid</option>
                                        <option value="Paid">Paid</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Account Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-modal-cancel" onClick={() => setShowEditModal(false)} disabled={modalSubmitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-modal-submit" disabled={modalSubmitting}>
                                    {modalSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── DELETE USER MODAL ── */}
            {showDeleteModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h3>Confirm Deletion</h3>
                            <button className="btn-icon" onClick={() => setShowDeleteModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {modalError && <div className="error-banner">{modalError}</div>}
                            <p style={{ fontSize: '14px', color: '#475569', margin: 0, textAlign: 'left' }}>
                                Are you sure you want to delete the user account for <b>{selectedUser.contactPerson}</b>?
                            </p>
                            <p style={{ fontSize: '12px', color: '#EF4444', margin: 0, fontWeight: 600, textAlign: 'left' }}>
                                Warning: This action is permanent and cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modal-cancel" onClick={() => setShowDeleteModal(false)} disabled={modalSubmitting}>
                                Cancel
                            </button>
                            <button className="btn-modal-delete" onClick={handleDeleteUserSubmit} disabled={modalSubmitting}>
                                {modalSubmitting ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
