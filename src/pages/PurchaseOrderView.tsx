
import { useState, useMemo, useRef, useEffect } from 'react';
import { ShoppingCart, Plus, ChevronDown, Info, MoreVertical, X, Upload, Save, Eye, Edit2, Trash2, File, Package, FileCheck, AlertCircle, Check } from 'lucide-react';

import './PurchaseOrderView.css';

interface PurchaseOrder {
    id: string;
    dateRequested: string;
    items: number;
    mdStatus: string;
    compliance: string;
}

interface SupplierPO {
    id: string;
    name: string;
    refId: string;
    totalItems: string;
    mds: string;
    ihmStatus: string;
    pos: PurchaseOrder[];
}

const VESSEL_SPECIFIC_POS: Record<string, SupplierPO[]> = {
    'MV Ocean Pioneer': [
        {
            id: 'op-1',
            name: 'Pioneer Marine Supplies',
            refId: '[ VS | 000101 | PMS ]',
            totalItems: '42(6)',
            mds: '30 / 42',
            ihmStatus: '25 | 42',
            pos: [
                { id: 'PO-9901', dateRequested: 'Jan 15, 2024', items: 24, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-9905', dateRequested: 'Feb 02, 2024', items: 8, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-9910', dateRequested: 'Feb 10, 2024', items: 12, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-9915', dateRequested: 'Feb 15, 2024', items: 15, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-9920', dateRequested: 'Feb 20, 2024', items: 20, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-9925', dateRequested: 'Feb 25, 2024', items: 10, mdStatus: 'MD Verified', compliance: 'Verified' }
            ]
        },
        {
            id: 'op-2',
            name: 'Atlantic Equipment Co.',
            refId: '[ VS | 000102 | AEC ]',
            totalItems: '25(4)',
            mds: '18 / 25',
            ihmStatus: '12 | 25',
            pos: [
                { id: 'PO-9942', dateRequested: 'Mar 10, 2024', items: 15, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-9945', dateRequested: 'Mar 15, 2024', items: 5, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-9948', dateRequested: 'Mar 18, 2024', items: 10, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-9952', dateRequested: 'Mar 22, 2024', items: 18, mdStatus: 'MD Pending', compliance: 'Not Verified' }
            ]
        },
        {
            id: 'op-5',
            name: 'North Sea Logistics',
            refId: '[ VS | 000105 | NSL ]',
            totalItems: '35(3)',
            mds: '20 / 35',
            ihmStatus: '15 | 35',
            pos: [
                { id: 'PO-9980', dateRequested: 'Apr 25, 2024', items: 10, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-9985', dateRequested: 'Apr 28, 2024', items: 25, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-9990', dateRequested: 'May 02, 2024', items: 12, mdStatus: 'MD Verified', compliance: 'Verified' }
            ]
        }
    ],
    'ACOSTA': [
        {
            id: '1',
            name: 'RMS Marine Service Company Ltd',
            refId: '( VS | 80812 | RMSCL )',
            totalItems: '52(6)',
            mds: '35 / 52',
            ihmStatus: '28 | 52',
            pos: [
                { id: 'PO-8821', dateRequested: 'Oct 24, 2023', items: 12, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-8825', dateRequested: 'Oct 30, 2023', items: 8, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-8830', dateRequested: 'Nov 05, 2023', items: 20, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-8835', dateRequested: 'Nov 10, 2023', items: 14, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-8840', dateRequested: 'Nov 15, 2023', items: 22, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-8845', dateRequested: 'Nov 20, 2023', items: 15, mdStatus: 'MD Pending', compliance: 'Not Verified' }
            ]
        },
        {
            id: '2',
            name: 'Jotun Cosco Marine Coatings (HK) Limited',
            refId: '( VS|000037|JCMCL )',
            totalItems: '45(5)',
            mds: '28 / 45',
            ihmStatus: '22 | 45',
            pos: [
                { id: 'PO-8900', dateRequested: 'Nov 12, 2023', items: 4, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-8910', dateRequested: 'Nov 20, 2023', items: 42, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-8920', dateRequested: 'Nov 25, 2023', items: 18, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-8930', dateRequested: 'Dec 02, 2023', items: 25, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-8940', dateRequested: 'Dec 10, 2023', items: 10, mdStatus: 'MD Pending', compliance: 'Not Verified' }
            ]
        },
        {
            id: '3',
            name: 'STOP AEVE',
            refId: '( VS | 000427 | SA )',
            totalItems: '76(5)',
            mds: '45 / 76',
            ihmStatus: '35 | 76',
            pos: [
                { id: 'PO-9001', dateRequested: 'Dec 05, 2023', items: 50, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-9005', dateRequested: 'Dec 15, 2023', items: 30, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-9010', dateRequested: 'Dec 20, 2023', items: 25, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-9015', dateRequested: 'Dec 25, 2023', items: 12, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-9020', dateRequested: 'Dec 30, 2023', items: 40, mdStatus: 'MD Verified', compliance: 'Verified' }
            ]
        },
        {
            id: '6',
            name: 'Med Sea Spares',
            refId: '( VS | 000800 | MSS )',
            totalItems: '42(4)',
            mds: '30 / 42',
            ihmStatus: '25 | 42',
            pos: [
                { id: 'PO-9310', dateRequested: 'Mar 05, 2024', items: 15, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-9315', dateRequested: 'Mar 10, 2024', items: 7, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-9320', dateRequested: 'Mar 15, 2024', items: 20, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-9325', dateRequested: 'Mar 20, 2024', items: 12, mdStatus: 'MD Verified', compliance: 'Verified' }
            ]
        }
    ],
    'AFIF': [
        {
            id: 'af-1',
            name: 'Global Container Solutions',
            refId: '[ VS | 000201 | GCS ]',
            totalItems: '35(5)',
            mds: '22 / 35',
            ihmStatus: '18 | 35',
            pos: [
                { id: 'PO-7701', dateRequested: 'Jan 20, 2024', items: 30, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-7705', dateRequested: 'Jan 25, 2024', items: 15, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-7710', dateRequested: 'Jan 30, 2024', items: 25, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-7715', dateRequested: 'Feb 05, 2024', items: 10, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-7720', dateRequested: 'Feb 10, 2024', items: 20, mdStatus: 'MD Verified', compliance: 'Verified' }
            ]
        },
        {
            id: 'af-3',
            name: 'Red Sea Marine',
            refId: '[ VS | 000203 | RSM ]',
            totalItems: '45(4)',
            mds: '30 / 45',
            ihmStatus: '22 | 45',
            pos: [
                { id: 'PO-7760', dateRequested: 'Mar 20, 2024', items: 20, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-7765', dateRequested: 'Mar 25, 2024', items: 12, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-7770', dateRequested: 'Mar 30, 2024', items: 15, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-7775', dateRequested: 'Apr 05, 2024', items: 28, mdStatus: 'MD Verified', compliance: 'Verified' }
            ]
        }
    ],
    'PACIFIC HORIZON': [
        {
            id: 'ph-1',
            name: 'Horizon Logistics Group',
            refId: '[ VS | 000301 | HLG ]',
            totalItems: '55(6)',
            mds: '38 / 55',
            ihmStatus: '30 | 55',
            pos: [
                { id: 'PO-6601', dateRequested: 'Feb 15, 2024', items: 10, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-6610', dateRequested: 'Feb 20, 2024', items: 25, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-6620', dateRequested: 'Feb 25, 2024', items: 18, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-6630', dateRequested: 'Mar 01, 2024', items: 40, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-6640', dateRequested: 'Mar 05, 2024', items: 30, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-6650', dateRequested: 'Mar 10, 2024', items: 22, mdStatus: 'MD Verified', compliance: 'Verified' }
            ]
        },
        {
            id: 'ph-2',
            name: 'Pacific Rim Marine',
            refId: '[ VS | 000302 | PRM ]',
            totalItems: '60(4)',
            mds: '42 / 60',
            ihmStatus: '35 | 60',
            pos: [
                { id: 'PO-6670', dateRequested: 'Apr 10, 2024', items: 30, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-6675', dateRequested: 'Apr 15, 2024', items: 15, mdStatus: 'MD Pending', compliance: 'Not Verified' },
                { id: 'PO-6680', dateRequested: 'Apr 20, 2024', items: 25, mdStatus: 'MD Verified', compliance: 'Verified' },
                { id: 'PO-6685', dateRequested: 'Apr 25, 2024', items: 40, mdStatus: 'MD Verified', compliance: 'Verified' }
            ]
        }
    ],
    'MV NORTH STAR': []
};


export default function PurchaseOrderView({
    vesselName,
    imo,
    filterDateFrom = '',
    filterDateTo = '',
    filterCompliance = 'All'
}: {
    vesselName: string;
    imo: string;
    filterDateFrom?: string;
    filterDateTo?: string;
    filterCompliance?: string;
}) {
    const suppliersData = useMemo(() => VESSEL_SPECIFIC_POS[vesselName] || [], [vesselName]);
    const [suppliers, setSuppliers] = useState<SupplierPO[]>(suppliersData);
    const [expandedSuppliers, setExpandedSuppliers] = useState<string[]>([]);
    const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null);
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [expandedFormSections, setExpandedFormSections] = useState<string[]>(['general']);
    const [showToast, setShowToast] = useState(false);
    const [lastSavedPO, setLastSavedPO] = useState('');

    /* Internal filter state removed in favor of props from parent */

    useEffect(() => {
        setSuppliers(suppliersData);
        setExpandedSuppliers([]);
    }, [suppliersData]);

    const filteredSuppliers = useMemo(() => {
        return suppliers.map(supplier => {
            const filteredPOs = supplier.pos.filter(po => {
                const poDate = new Date(po.dateRequested);
                const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
                const toDate = filterDateTo ? new Date(filterDateTo) : null;

                const matchesDate = (!fromDate || poDate >= fromDate) && (!toDate || poDate <= toDate);

                // Normalize for comparison
                const normalizeCompliance = (status: string) => status.trim().toLowerCase();
                const filterVal = filterCompliance === 'All' ? 'all' : normalizeCompliance(filterCompliance);
                const poVal = normalizeCompliance(po.compliance);
                const poMdStatus = normalizeCompliance(po.mdStatus);

                // Check against both compliance field AND mdStatus if the user selects "MD Pending"
                // This covers cases where 'MD Pending' might be in the mdStatus column instead of compliance
                const matchesCompliance =
                    filterVal === 'all' ||
                    poVal === filterVal ||
                    (filterVal === 'md pending' && poMdStatus === 'md pending');

                return matchesDate && matchesCompliance;
            });

            if (filteredPOs.length === 0) return null;

            return {
                ...supplier,
                pos: filteredPOs,
            };
        }).filter(Boolean) as SupplierPO[];
    }, [suppliers, filterDateFrom, filterDateTo, filterCompliance]);

    // Auto-expand/collapse based on filter state
    useEffect(() => {
        const isFiltering = filterDateFrom || filterDateTo || filterCompliance !== 'All';

        if (isFiltering) {
            // If we are filtering, expand all found suppliers so the user sees results immediately
            const visibleIds = filteredSuppliers.map(s => s.id);
            setExpandedSuppliers(visibleIds);
        } else {
            // If filters are cleared, collapse all
            setExpandedSuppliers([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterDateFrom, filterDateTo, filterCompliance]); // Only depend on filter criteria, not filtered results

    // Form states
    const [formData, setFormData] = useState({
        poNumber: '',
        supplier: '',
        orderDate: '',
        partNumber: '',
        itemDescription: '',
        impaCode: '',
        issaCode: '',
        equipmentCode: '',
        equipmentName: '',
        maker: '',
        model: '',
        unit: '',
        quantity: '',
        items: '',
        mdsRequestedDate: '',
        mdsReceivedDate: '',
        mdsFile: null as File | null,
        sdocsFile: null as File | null,
        hmStatus: 'Non HM',
        suspected: false,
        multipleHazmat: false,
        vendorRemark: '',
        remark: ''
    });

    const mdFileInputRef = useRef<HTMLInputElement>(null);
    const sdocFileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (type: 'mds' | 'sdocs') => {
        if (type === 'mds') mdFileInputRef.current?.click();
        else sdocFileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'mds' | 'sdocs') => {
        const file = e.target.files?.[0] || null;
        if (type === 'mds') setFormData(prev => ({ ...prev, mdsFile: file }));
        else setFormData(prev => ({ ...prev, sdocsFile: file }));
    };

    const toggleSupplier = (id: string) => {
        setExpandedSuppliers((prev: string[]) =>
            prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id]
        );
    };

    const toggleFormSection = (section: string) => {
        setExpandedFormSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSavePO = (e: React.FormEvent) => {
        e.preventDefault();

        const newPO: PurchaseOrder = {
            id: formData.poNumber,
            dateRequested: new Date(formData.orderDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            items: parseInt(formData.quantity) || 0,
            mdStatus: 'MD Pending',
            compliance: 'Not Verified'
        };

        const updatedSuppliers = suppliers.map(s => {
            if (s.name === formData.supplier) {
                return {
                    ...s,
                    pos: [newPO, ...s.pos],
                    totalItems: (parseInt(s.totalItems.split('(')[0]) + newPO.items) + '(' + (parseInt(s.totalItems.split('(')[1]) + 1) + ')'
                };
            }
            return s;
        });

        setSuppliers(updatedSuppliers);
        setLastSavedPO(formData.poNumber);
        setIsAddDrawerOpen(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        setFormData({
            poNumber: '',
            supplier: '',
            orderDate: '',
            partNumber: '',
            itemDescription: '',
            impaCode: '',
            issaCode: '',
            equipmentCode: '',
            equipmentName: '',
            maker: '',
            model: '',
            unit: '',
            quantity: '',
            items: '',
            mdsRequestedDate: '',
            mdsReceivedDate: '',
            mdsFile: null,
            sdocsFile: null,
            hmStatus: 'Non HM',
            suspected: false,
            multipleHazmat: false,
            vendorRemark: '',
            remark: ''
        });
    };

    const hasPOs = suppliers.length > 0;

    const stats = useMemo(() => {
        let totalPOs = 0;
        let mdsRequested = 0;
        let mdsReceived = 0;
        let hmRed = 0;
        let hmGreen = 0;
        let pchm = 0;

        suppliers.forEach(s => {
            totalPOs += s.pos.length;
            s.pos.forEach(po => {
                mdsRequested += po.items;
                if (po.mdStatus === 'MD Verified') {
                    mdsReceived += po.items;
                    hmGreen += Math.floor(po.items * 0.82);
                    pchm += Math.floor(po.items * 0.08);
                } else {
                    hmRed += Math.floor(po.items * 0.15);
                }
            });
        });

        return {
            totalPOs,
            mdsRequested,
            mdsReceived,
            mdsPending: mdsRequested - mdsReceived,
            hmRed: hmRed || Math.floor(mdsRequested * 0.04),
            hmGreen: hmGreen || Math.floor(mdsRequested * 0.45),
            pchm: pchm || Math.floor(mdsRequested * 0.05)
        };
    }, [suppliers]);

    return (
        <div className={`purchase-orders-container ${isAddDrawerOpen ? 'drawer-open' : ''}`}>
            {showToast && (
                <div className="toast-notification">
                    <div className="toast-icon">
                        <Check size={20} color="white" />
                    </div>
                    <div className="toast-content">
                        <h4>Purchase Order Saved</h4>
                        <p>PO #{lastSavedPO} has been successfully added to the registry</p>
                    </div>
                    <button className="toast-undo" onClick={() => setShowToast(false)}>Undo</button>
                    <X size={18} className="toast-close" onClick={() => setShowToast(false)} />
                </div>
            )}

            {/* Removed Filter Button from header as per request */}
            <div className="po-header-row">
                <div className="po-title-section">
                    <h2>Purchase Orders – {vesselName}</h2>
                    <span className="imo-badge-small">
                        <Info size={12} /> IMO: {imo}
                    </span>
                </div>
                <div className="po-actions-right">
                    <button className="add-po-btn" onClick={() => setIsAddDrawerOpen(true)}>
                        <Plus size={18} /> Add Purchase Order
                    </button>
                </div>
            </div>






            {hasPOs ? (
                <div className="supplier-list">
                    {filteredSuppliers.length > 0 ? (
                        filteredSuppliers.map((supplier) => (
                            <div key={supplier.id} className="supplier-card">
                                <div className="supplier-header" onClick={() => toggleSupplier(supplier.id)}>
                                    <div className="supplier-main-info">
                                        <div className="supplier-ref-id">{supplier.refId}</div>
                                        <h3 className="supplier-name-bold">{supplier.name}</h3>
                                    </div>
                                    <div className="supplier-stats-row">
                                        <div className="stat-group">
                                            <div className="stat-label">Total Items</div>
                                            <div className="stat-value">{supplier.totalItems}</div>
                                        </div>
                                        <div className="stat-group">
                                            <div className="stat-label">MDs</div>
                                            <div className="stat-value">{supplier.mds}</div>
                                        </div>
                                        <div className="stat-group">
                                            <div className="stat-label">HM Status</div>
                                            <div className="stat-value status-hm">
                                                <span className="hm-red">{supplier.ihmStatus.split('|')[0]}</span>
                                                <span className="hm-divider">|</span>
                                                <span className="hm-total">{supplier.ihmStatus.split('|')[1]}</span>
                                            </div>
                                        </div>
                                        <div className={`accordion-arrow ${expandedSuppliers.includes(supplier.id) ? 'expanded' : ''}`}>
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                </div>

                                {expandedSuppliers.includes(supplier.id) && (
                                    <div className="po-table-expanded-container">
                                        <table className="po-table">
                                            <thead>
                                                <tr>
                                                    <th>PO ID</th>
                                                    <th>DATE REQUESTED</th>
                                                    <th>ITEMS</th>
                                                    <th>MD STATUS</th>
                                                    <th>COMPLIANCE</th>
                                                    <th className="action-col">ACTION</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {supplier.pos.map((po) => (
                                                    <tr key={po.id}>
                                                        <td className="po-id-cell">{po.id}</td>
                                                        <td>{po.dateRequested}</td>
                                                        <td className="font-bold">{po.items}</td>
                                                        <td>
                                                            <span className={`status-pill-md ${po.mdStatus.toLowerCase().replace(' ', '-')}`}>
                                                                {po.mdStatus}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="compliance-cell">
                                                                <div className={`compliance-dot ${po.compliance.toLowerCase().replace(' ', '-')}`}></div>
                                                                {po.compliance}
                                                            </div>
                                                        </td>
                                                        <td className="action-col">
                                                            <button
                                                                className="dots-style"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenActionDropdown(openActionDropdown === po.id ? null : po.id);
                                                                }}
                                                            >
                                                                <MoreVertical size={16} />
                                                            </button>
                                                            {openActionDropdown === po.id && (
                                                                <div className="action-dropdown shadow-xl">
                                                                    <button className="dropdown-item">
                                                                        <Eye size={14} />
                                                                        <span>View Details</span>
                                                                    </button>
                                                                    <button className="dropdown-item">
                                                                        <Edit2 size={14} />
                                                                        <span>Edit PO</span>
                                                                    </button>
                                                                    <button className="dropdown-item delete">
                                                                        <Trash2 size={14} />
                                                                        <span>Delete</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-filter-results">
                            <p>No purchase orders found matching your filters.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="empty-po-fixed-layout">
                    <div className="empty-po-card">
                        <div className="empty-icon-wrapper">
                            <ShoppingCart size={64} color="#00B0FA" strokeWidth={1} />
                        </div>
                        <h2>No Purchase Orders Yet</h2>
                        <p>There are no purchase orders recorded for {vesselName}.<br />Start by adding your first purchase order to begin monitoring.</p>
                        <button className="add-po-btn-large" onClick={() => setIsAddDrawerOpen(true)}>
                            <Plus size={20} />
                            <span>Add First Purchase Order</span>
                        </button>
                    </div>
                </div>
            )}

            {hasPOs && (
                <div className="po-summary-premium">
                    <div className="summary-main-row">
                        <div className="summary-block">
                            <span className="label">TOTAL NUMBER OF POS:</span>
                            <span className="value">{stats.totalPOs}</span>
                        </div>
                        <div className="v-divider"></div>
                        <div className="summary-block">
                            <span className="label">MDS REQUESTED:</span>
                            <span className="value">{stats.mdsRequested}</span>
                        </div>
                        <div className="v-divider"></div>
                        <div className="summary-block">
                            <span className="label">MDS RECEIVED:</span>
                            <span className="value">{stats.mdsReceived}</span>
                        </div>
                        <div className="v-divider"></div>
                        <div className="summary-block">
                            <span className="label">MDS PENDING:</span>
                            <span className="value">{stats.mdsPending}</span>
                        </div>
                        <div className="v-divider"></div>
                        <div className="summary-block">
                            <span className="label hm-red-label">HM RED QTY:</span>
                            <span className="value hm-red-val">{stats.hmRed}</span>
                        </div>
                    </div>

                    <div className="summary-sub-row">
                        <div className="summary-block">
                            <span className="label">HM GREEN QTY:</span>
                            <span className="value">{stats.hmGreen}</span>
                        </div>
                        <div className="v-divider-short"></div>
                        <div className="summary-block">
                            <span className="label">PCHM QTY:</span>
                            <span className="value">{stats.pchm}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Side Drawer Overlay */}
            {isAddDrawerOpen && <div className="drawer-overlay" onClick={() => setIsAddDrawerOpen(false)} />}

            {/* Side Drawer */}
            <div className={`add-po-drawer ${isAddDrawerOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <div className="drawer-title">
                        <ShoppingCart size={20} />
                        <span>Add Purchase Order</span>
                    </div>
                    <button className="close-drawer-btn" onClick={() => setIsAddDrawerOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <div className="drawer-content">
                    <form onSubmit={handleSavePO}>
                        {/* Section 1: General Information */}
                        <div className="form-section-expandable">
                            <div className="section-header" onClick={() => toggleFormSection('general')}>
                                <div className="section-title">
                                    <Info size={16} className="title-icon" />
                                    <span>General Information</span>
                                </div>
                                <ChevronDown size={18} className={expandedFormSections.includes('general') ? 'rotate-180' : ''} />
                            </div>

                            {expandedFormSections.includes('general') && (
                                <div className="section-fields">
                                    <div className="form-field">
                                        <label>PO NUMBER *</label>
                                        <input type="text" name="poNumber" placeholder="Enter PO Number" value={formData.poNumber} onChange={handleFormChange} required />
                                    </div>
                                    <div className="form-field">
                                        <label>SUPPLIER *</label>
                                        <select name="supplier" value={formData.supplier} onChange={handleFormChange} required>
                                            <option value="">Select Supplier</option>
                                            {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-field">
                                            <label>ORDER DATE *</label>
                                            <input type="date" name="orderDate" value={formData.orderDate} onChange={handleFormChange} required />
                                        </div>
                                        <div className="form-field">
                                            <label>PART NUMBER</label>
                                            <input type="text" name="partNumber" placeholder="P/N" value={formData.partNumber} onChange={handleFormChange} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 2: Equipment Details */}
                        <div className="form-section-expandable">
                            <div className="section-header" onClick={() => toggleFormSection('equipment')}>
                                <div className="section-title">
                                    <Package size={16} className="title-icon" />
                                    <span>Equipment Details</span>
                                </div>
                                <ChevronDown size={18} className={expandedFormSections.includes('equipment') ? 'rotate-180' : ''} />
                            </div>

                            {expandedFormSections.includes('equipment') && (
                                <div className="section-fields">
                                    <div className="form-field">
                                        <label>ITEM DESCRIPTION *</label>
                                        <input type="text" name="itemDescription" value={formData.itemDescription} onChange={handleFormChange} required />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-field">
                                            <label>IMPA CODE</label>
                                            <input type="text" name="impaCode" value={formData.impaCode} onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>ISSA CODE</label>
                                            <input type="text" name="issaCode" value={formData.issaCode} onChange={handleFormChange} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-field">
                                            <label>EQUIPMENT CODE</label>
                                            <input type="text" name="equipmentCode" value={formData.equipmentCode} onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>EQUIPMENT NAME</label>
                                            <input type="text" name="equipmentName" value={formData.equipmentName} onChange={handleFormChange} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-field">
                                            <label>MAKER</label>
                                            <input type="text" name="maker" value={formData.maker} onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>MODEL</label>
                                            <input type="text" name="model" value={formData.model} onChange={handleFormChange} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-field">
                                            <label>UNIT *</label>
                                            <input type="text" name="unit" value={formData.unit} onChange={handleFormChange} required />
                                        </div>
                                        <div className="form-field">
                                            <label>QUANTITY *</label>
                                            <input type="number" name="quantity" value={formData.quantity} onChange={handleFormChange} required />
                                        </div>
                                        <div className="form-field">
                                            <label>ITEMS</label>
                                            <input type="number" name="items" value={formData.items} onChange={handleFormChange} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 3: Documentation & Compliance */}
                        <div className="form-section-expandable">
                            <div className="section-header" onClick={() => toggleFormSection('documentation')}>
                                <div className="section-title">
                                    <FileCheck size={16} className="title-icon" />
                                    <span>Documentation & Compliance</span>
                                </div>
                                <ChevronDown size={18} className={expandedFormSections.includes('documentation') ? 'rotate-180' : ''} />
                            </div>

                            {expandedFormSections.includes('documentation') && (
                                <div className="section-fields">
                                    <div className="form-row">
                                        <div className="form-field">
                                            <label>MDs SDoCs REQUESTED DATE</label>
                                            <input type="date" name="mdsRequestedDate" value={formData.mdsRequestedDate} onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>MDs SDoCs RECEIVED DATE</label>
                                            <input type="date" name="mdsReceivedDate" value={formData.mdsReceivedDate} onChange={handleFormChange} />
                                        </div>
                                    </div>
                                    <div className="form-field">
                                        <label>CHOOSE MDs DOCUMENT FILE</label>
                                        <input
                                            type="file"
                                            ref={mdFileInputRef}
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileChange(e, 'mds')}
                                        />
                                        <div className={`file-upload-box ${formData.mdsFile ? 'has-file' : ''}`} onClick={() => handleFileUpload('mds')}>
                                            {formData.mdsFile ? <File size={18} color="#00B0FA" /> : <Upload size={18} />}
                                            <span>{formData.mdsFile ? formData.mdsFile.name : 'Upload MDs file'}</span>
                                            {formData.mdsFile && <X size={14} className="remove-file" onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, mdsFile: null })); }} />}
                                        </div>
                                    </div>
                                    <div className="form-field">
                                        <label>CHOOSE SDoCs DOCUMENT FILE</label>
                                        <input
                                            type="file"
                                            ref={sdocFileInputRef}
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileChange(e, 'sdocs')}
                                        />
                                        <div className={`file-upload-box ${formData.sdocsFile ? 'has-file' : ''}`} onClick={() => handleFileUpload('sdocs')}>
                                            {formData.sdocsFile ? <File size={18} color="#00B0FA" /> : <Upload size={18} />}
                                            <span>{formData.sdocsFile ? formData.sdocsFile.name : 'Upload SDoCs file'}</span>
                                            {formData.sdocsFile && <X size={14} className="remove-file" onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, sdocsFile: null })); }} />}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 4: HM Status & Remarks */}
                        <div className="form-section-expandable">
                            <div className="section-header" onClick={() => toggleFormSection('hmStatus')}>
                                <div className="section-title">
                                    <AlertCircle size={16} className="title-icon" />
                                    <span>HM Status & Remarks</span>
                                </div>
                                <ChevronDown size={18} className={expandedFormSections.includes('hmStatus') ? 'rotate-180' : ''} />
                            </div>

                            {expandedFormSections.includes('hmStatus') && (
                                <div className="section-fields">
                                    <label className="sub-label">HM STATUS SELECTION</label>
                                    <div className="hm-radio-grid">
                                        {['CHM', 'Below Threshold', 'Non HM', 'PCHM'].map(status => (
                                            <label key={status} className={`hm-radio-card ${formData.hmStatus === status ? 'selected' : ''}`}>
                                                <input type="radio" name="hmStatus" value={status} checked={formData.hmStatus === status} onChange={handleFormChange} />
                                                <div className="radio-content">
                                                    <div className="radio-circle" />
                                                    <span>{status}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="po-checkbox-row">
                                        <label className="po-checkbox-item">
                                            <input type="checkbox" name="suspected" checked={formData.suspected} onChange={handleFormChange} />
                                            <span className="po-checkmark" />
                                            <span>Suspected</span>
                                        </label>
                                        <label className="po-checkbox-item">
                                            <input type="checkbox" name="multipleHazmat" checked={formData.multipleHazmat} onChange={handleFormChange} />
                                            <span className="po-checkmark" />
                                            <span>Multiple Hazmat</span>
                                        </label>
                                    </div>
                                    <div className="form-field">
                                        <label>VENDOR REMARK</label>
                                        <textarea name="vendorRemark" placeholder="Type here..." value={formData.vendorRemark} onChange={handleFormChange} />
                                    </div>
                                    <div className="form-field">
                                        <label>REMARK</label>
                                        <textarea name="remark" value={formData.remark} onChange={handleFormChange} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="drawer-footer">
                            <button type="submit" className="save-po-btn">
                                <Save size={18} />
                                <span>SAVE PO</span>
                            </button>
                            <button type="button" className="cancel-po-btn" onClick={() => setIsAddDrawerOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
