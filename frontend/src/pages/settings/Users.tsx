import { useState } from 'react';
import { 
    Search, Plus, Edit2, 
    Trash2, Filter, Download, Mail, 
    Phone, Globe, Tag, FileText, AlertTriangle,
    History
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
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
    lastActivity: number; // days
}

const MOCK_USERS: UserData[] = [
    {
        id: '1',
        contactPerson: 'Bindhiya Rajendran',
        email: 'bindhya2011@gmail.com',
        country: 'India',
        phone: '9585936420',
        status: 'Inactive',
        paymentStatus: 'Unpaid',
        category: 'Certified hazmat Companies',
        origin: 'Direct',
        lastActivity: 1023
    },
    {
        id: '2',
        contactPerson: 'Company Account',
        email: 'contact@varunasentinels.com',
        country: 'Netherlands',
        phone: '8899298809',
        status: 'Active',
        paymentStatus: 'Paid',
        category: 'Ship Owner',
        origin: 'Partner',
        lastActivity: 1689
    },
    {
        id: '3',
        contactPerson: 'Frank Shaw',
        email: 'frank.shaw@bshipmanagement.com',
        country: 'Germany',
        phone: '0687382356',
        status: 'Active',
        paymentStatus: 'Unpaid',
        category: 'Ship Owner',
        origin: 'Direct',
        lastActivity: 1585
    },
    {
        id: '4',
        contactPerson: 'Austin Ajith',
        email: 'austinajith@gmail.com',
        country: 'India',
        phone: '09514991354',
        status: 'Inactive',
        paymentStatus: 'Paid',
        category: 'Admin User',
        origin: 'System',
        lastActivity: 346
    },
    {
        id: '5',
        contactPerson: 'Sir/Madam',
        email: 'E.tatanis@harp.com',
        country: 'Germany',
        phone: '124578',
        status: 'Active',
        paymentStatus: 'Unpaid',
        category: 'Ship Owner',
        origin: 'Direct',
        lastActivity: 188
    },
    {
        id: '6',
        contactPerson: 'Purchasing',
        email: 'purchasing@sunship.de',
        country: 'Germany',
        phone: '0687382356',
        status: 'Active',
        paymentStatus: 'Unpaid',
        category: 'Ship Owner',
        origin: 'Partner',
        lastActivity: 1668
    },
    {
        id: '7',
        contactPerson: 'Boer',
        email: 'Boer@sunship.de',
        country: 'Germany',
        phone: '0687382356',
        status: 'Active',
        paymentStatus: 'Paid',
        category: 'Ship Owner',
        origin: 'Direct',
        lastActivity: 1879
    },
    {
        id: '8',
        contactPerson: 'Nautic',
        email: 'nautic@sunship.de',
        country: 'Germany',
        phone: '+49 687382356',
        status: 'Active',
        paymentStatus: 'Paid',
        category: 'Ship Owner',
        origin: 'Partner',
        lastActivity: 9
    },
    {
        id: '9',
        contactPerson: 'MERVIN ISRAEL',
        email: 'mervinisrael7@gmail.com',
        country: 'India',
        phone: '08939184010',
        status: 'Inactive',
        paymentStatus: 'Unpaid',
        category: 'Admin User',
        origin: 'Direct',
        lastActivity: 378
    },
    {
        id: '10',
        contactPerson: 'r-mathur',
        email: 'r-mathur@kumis.de',
        country: 'Germany',
        phone: '0687382356',
        status: 'Active',
        paymentStatus: 'Unpaid',
        category: 'Ship Owner',
        origin: 'System',
        lastActivity: 1862
    }
];

export default function Users() {
    const [searchTerm, setSearchTerm] = useState('');
    const [users] = useState<UserData[]>(MOCK_USERS);
    const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="users-page-container">
            <Sidebar />
            <main className="users-page-main">
                <Header notificationCount={5} />
                
                <div className="users-content-wrapper">
                    <div className="users-page-header">
                        <div className="header-info">
                            <div className="breadcrumb">SECURITY / USERS</div>
                            <h1>User Management</h1>
                            <p>Manage platform access, registration details, and payment statuses for contact persons.</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-bulk">
                                <FileText size={18} />
                                <span>Bulk Import</span>
                            </button>
                            <button className="btn-add">
                                <Plus size={20} />
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
                                
                                <button className="btn-icon">
                                    <Filter size={18} />
                                </button>
                                <button className="btn-icon">
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="table-responsive">
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
                                                    <button className="btn-edit" title="Edit User">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button className="btn-history" title="View History">
                                                        <History size={14} />
                                                    </button>
                                                    <button className="btn-delete" title="Delete User">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="person-cell">
                                                    <div className="avatar-mini">
                                                        {user.contactPerson.charAt(0)}
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
                                                        <span>{user.country}</span>
                                                    </div>
                                                    <div className="meta-item">
                                                        <Phone size={12} />
                                                        <span>{user.phone}</span>
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
                                                    <span>{user.category}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={`activity-cell ${user.lastActivity > 365 ? 'overdue' : ''}`}>
                                                    {user.lastActivity > 365 && <AlertTriangle size={14} />}
                                                    <span>{user.lastActivity} days ago</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="table-footer">
                            <span className="count-text">Showing <b>{filteredUsers.length}</b> contact persons</span>
                            <div className="pagination">
                                <button className="prev" disabled>Previous</button>
                                <button className="page-num active">1</button>
                                <button className="next" disabled>Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
