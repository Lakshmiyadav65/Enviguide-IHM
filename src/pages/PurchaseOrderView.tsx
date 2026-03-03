import { useState, useMemo } from 'react';
import {
    ChevronDown, Search, RotateCw, Edit2, Trash2,
    FileText, Layout, Filter
} from 'lucide-react';
import './PurchaseOrderView.css';

interface PurchaseOrderItem {
    id: string;
    emailStatus: string;
    ihmProductCode: string;
    poNumber: string;
    mdsReq: string;
    mdsRec: string;
    itemDescription: string;
    orderDate: string;
    quantityTotal: string;
    unit: string;
    selected?: boolean;
    category: string;
}

const FILTER_TAGS = [
    'Pending Mds', 'Received Mds', 'Tracked Items', 'Non Tracked Items',
    'Request Pending', 'Reminder 1', 'Reminder 2', 'Non-Responsive Supplier',
    'HM Red', 'HM Green', 'PCHM', 'Non HM', 'Review Repeated Items', 'All'
];

const initializeData = () => {
    let allItems: PurchaseOrderItem[] = [];
    const UNITS = ['Piece', 'Kg', 'Litre', 'Set', 'Box', 'Roll', 'Unit', 'Pair', 'Metre'];
    FILTER_TAGS.forEach((tag, tagIdx) => {
        if (tag === 'All') return;
        for (let sIdx = 0; sIdx < 5; sIdx++) {
            const sid = `${tag.replace(/\s+/g, '-').toLowerCase()}-s-${sIdx}`;
            for (let i = 0; i < 5; i++) {
                const ordered = Math.floor(Math.random() * 50) + 5;
                const received = tag === 'Received Mds' ? ordered : Math.floor(Math.random() * ordered);
                const pending = ordered - received;
                allItems.push({
                    id: `${sid}-item-${i}`,
                    emailStatus: tag === 'Pending Mds' ? 'SENT' : 'NOT SENT',
                    ihmProductCode: `IHM|00${tagIdx}${sIdx}|${i}`,
                    poNumber: `PO-${tagIdx}-${100 + i}`,
                    mdsReq: tag === 'Pending Mds' ? '01/01/2024' : '',
                    mdsRec: tag === 'Received Mds' ? '05/01/2024' : '',
                    itemDescription: `Component ${tag} type ${i}`,
                    orderDate: `2024-01-${10 + i}`,
                    quantityTotal: `${ordered} | ${received} | ${pending}`,
                    unit: UNITS[(tagIdx + sIdx + i) % UNITS.length],
                    category: tag,
                    selected: false
                });
            }
        }
    });
    return allItems;
};

const getSupplierMeta = (filter: string) => {
    const suffix = filter === 'All' ? 'GEN' : filter.substring(0, 3).toUpperCase();
    return [
        { id: 's1', name: `${filter} - Henry Marine A/S`, ref: `( IHM|0${suffix}|ALP )` },
        { id: 's2', name: `${filter} - Varuna Sentinels BV`, ref: `( IHM|1${suffix}|BET )` },
        { id: 's3', name: `${filter} - Pole Star Space Applications Ltd`, ref: `( IHM|2${suffix}|GAM )` },
        { id: 's4', name: `${filter} - Martek Marine Ltd`, ref: `( IHM|3${suffix}|DEL )` },
        { id: 's5', name: `${filter} - Survitec Safety Solutions Norway AS`, ref: `( IHM|4${suffix}|EPS )` },
    ];
};

export default function PurchaseOrderView() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [openSuppliers, setOpenSuppliers] = useState<string[]>(['s1']);
    const [allItems, setAllItems] = useState<PurchaseOrderItem[]>(initializeData());
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);

    const toggleSupplier = (id: string) => {
        setOpenSuppliers(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    };

    const currentSuppliersData = useMemo(() => {
        const filteredItems = allItems.filter(item => {
            if (activeFilter !== 'All' && item.category !== activeFilter) return false;
            if (searchTerm && !item.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) && !item.poNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        });

        const meta = getSupplierMeta(activeFilter);
        return meta.map((s, idx) => {
            const supplierItems = filteredItems.slice(idx * 10, (idx + 1) * 10);
            return {
                ...s,
                totalItems: `${supplierItems.length * 2}(${supplierItems.length})`,
                mds: `${supplierItems.filter(i => i.mdsRec).length} / ${supplierItems.length}`,
                hm: `0 | ${supplierItems.length > 2 ? 4 : 0}`,
                items: supplierItems
            };
        }).filter(s => s.items.length > 0);
    }, [activeFilter, searchTerm, allItems]);

    const selectedCount = allItems.filter(i => i.selected).length;

    const toggleItemSelection = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setAllItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
    };

    const toggleAllInSupplier = (items: PurchaseOrderItem[], checked: boolean) => {
        const ids = items.map(i => i.id);
        setAllItems(prev => prev.map(item => ids.includes(item.id) ? { ...item, selected: checked } : item));
    };

    const handleRequestMDs = () => {
        setAllItems(prev => prev.map(item => {
            if (item.selected) {
                return {
                    ...item,
                    category: 'Pending Mds',
                    emailStatus: 'SENT',
                    mdsReq: new Date().toLocaleDateString('en-GB'),
                    selected: false
                };
            }
            return item;
        }));
        alert('Action completed for selected items.');
    };

    return (
        <div className="po-v4-main-wrapper">
            <div className="po-v4-top-controls-p">
                <div className="po-v4-top-strip-clean">
                    <button className="po-v4-filter-trigger-btn" onClick={() => setIsFilterBarOpen(!isFilterBarOpen)}>
                        <Filter size={18} />
                        Filter
                    </button>
                    <div className="po-v4-soft-search-box-premium">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search PO numbers or descriptions..."
                            className="po-v4-soft-search-input-premium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {isFilterBarOpen && (
                    <div className="po-v4-tags-container-premium">
                        {FILTER_TAGS.map(tag => (
                            <div
                                key={tag}
                                className={`po-v4-tag-item-premium ${activeFilter === tag ? 'active' : ''}`}
                                onClick={() => setActiveFilter(tag)}
                            >
                                {tag}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="po-v4-scroll-content">
                <div className="po-v4-details-section-premium">
                    <div className="po-v4-details-section-title">
                        <span>Details</span>
                    </div>
                    <div className="po-v4-suppliers-list-structured">
                        {currentSuppliersData.map(supplier => (
                            <div key={supplier.id} className={`po-v4-supplier-item-v4 ${openSuppliers.includes(supplier.id) ? 'is-open' : ''}`}>
                                <div className="po-v4-supplier-header-v4" onClick={() => toggleSupplier(supplier.id)}>
                                    <div className="po-v4-sup-info-v4">
                                        <div className="po-v4-sup-ref-tag">{supplier.ref}</div>
                                        <div className="po-v4-sup-name-title">{supplier.name}</div>
                                    </div>
                                    <div className="po-v4-sup-metrics-v4">
                                        <ChevronDown size={20} className={`po-v4-arrow-icon ${openSuppliers.includes(supplier.id) ? 'up' : ''}`} />
                                    </div>
                                </div>

                                {openSuppliers.includes(supplier.id) && (
                                    <div className="po-v4-supplier-details-v4">
                                        <div className="po-v4-table-toolbar-localized">
                                            <div className="po-v4-action-icons-localized">
                                                {selectedCount > 0 && (
                                                    <div className="po-v4-action-item-local tooltip-p" onClick={handleRequestMDs}>
                                                        <div className="po-v4-circle-btn-v4 req-mds">
                                                            <FileText size={18} />
                                                        </div>
                                                        <span className="po-v4-tooltip-text">Process Selected Items</span>
                                                    </div>
                                                )}
                                                <div className="po-v4-action-item-local tooltip-p">
                                                    <div className="po-v4-circle-btn-v4 refresh">
                                                        <RotateCw size={18} />
                                                    </div>
                                                    <span className="po-v4-tooltip-text">Refresh Data</span>
                                                </div>
                                                <div className="po-v4-action-item-local tooltip-p">
                                                    <div className="po-v4-circle-btn-v4 layout">
                                                        <Layout size={18} />
                                                    </div>
                                                    <span className="po-v4-tooltip-text">Layout Settings</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="po-v4-table-master-wrapper">
                                            <table className="po-v4-table-styled-premium">
                                                <thead>
                                                    <tr>
                                                        <th className="ch-col">
                                                            <input
                                                                type="checkbox"
                                                                className="po-v4-header-checkbox-v4"
                                                                checked={supplier.items.length > 0 && supplier.items.every(i => i.selected)}
                                                                onChange={(e) => toggleAllInSupplier(supplier.items, e.target.checked)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </th>
                                                        <th className="ac-col">Action</th>
                                                        <th className="em-col">Email Status</th>
                                                        <th className="ihm-col">IHM Product Code</th>
                                                        <th className="po-col">PO Number</th>
                                                        <th className="mdr-col">MDs SDoCs Req</th>
                                                        <th className="mdc-col">MDs SDoCs Rec</th>
                                                        <th className="it-col">Item Description</th>
                                                        <th className="da-col">Order Date</th>
                                                        <th className="qt-col">
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                <span>Quantity</span>
                                                                <span style={{ fontSize: '9px', fontWeight: 500, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                                                                    <span style={{ color: '#EF4444' }}>Ord</span>{' | '}<span style={{ color: '#10B981' }}>Rec</span>{' | '}<span style={{ color: '#3B82F6' }}>Pend</span>
                                                                </span>
                                                            </div>
                                                        </th>
                                                        <th className="un-col">Unit</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {supplier.items.map(item => (
                                                        <tr key={item.id} className={item.selected ? 'row-is-selected' : ''}>
                                                            <td className="ch-col">
                                                                <div className={`po-v4-row-action-checkbox-styled ${item.selected ? 'checked' : ''}`} onClick={(e) => toggleItemSelection(item.id, e)}>
                                                                    {item.selected && <span className="check-icon-v4">✓</span>}
                                                                </div>
                                                            </td>
                                                            <td className="ac-col">
                                                                <div className="po-v4-row-action-btns-premium">
                                                                    <button type="button" className="po-v4-action-icon-btn-v4 view" title="View Document"><FileText size={14} /></button>
                                                                    <button type="button" className="po-v4-action-icon-btn-v4 edit" title="Edit Item"><Edit2 size={14} /></button>
                                                                    <button type="button" className="po-v4-action-icon-btn-v4 delete" title="Delete Item"><Trash2 size={14} /></button>
                                                                </div>
                                                            </td>
                                                            <td className="em-col">{item.emailStatus}</td>
                                                            <td className="ihm-col">{item.ihmProductCode}</td>
                                                            <td className="po-col">{item.poNumber}</td>
                                                            <td className="mdr-col">{item.mdsReq}</td>
                                                            <td className="mdc-col">{item.mdsRec}</td>
                                                            <td className="it-col">{item.itemDescription}</td>
                                                            <td className="da-col">{item.orderDate}</td>
                                                            <td className="qt-col">
                                                                <span className="q-p red">{item.quantityTotal.split('|')[0]}</span>
                                                                <span className="q-s">|</span>
                                                                <span className="q-p green">{item.quantityTotal.split('|')[1]}</span>
                                                                <span className="q-s">|</span>
                                                                <span className="q-p blue">{item.quantityTotal.split('|')[2]}</span>
                                                            </td>
                                                            <td className="un-col">{item.unit}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="po-v4-supplier-footer-v4">
                                            {supplier.items.filter(i => i.selected).length} selected / {supplier.items.length} total
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
