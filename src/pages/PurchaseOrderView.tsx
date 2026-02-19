
import { useState, useMemo, useRef } from 'react';
import {
    Plus, ChevronDown, ChevronUp, X, Search, RotateCw,
    Calendar, Filter, Edit2, Trash2, Info,
    ArrowUpDown, RefreshCw, FileText, Layout
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
    FILTER_TAGS.forEach((tag, tagIdx) => {
        if (tag === 'All') return;
        for (let sIdx = 0; sIdx < 5; sIdx++) {
            const sid = `${tag.replace(/\s+/g, '-').toLowerCase()}-s-${sIdx}`;
            for (let i = 0; i < 5; i++) {
                allItems.push({
                    id: `${sid}-item-${i}`,
                    emailStatus: tag === 'Pending Mds' ? 'SENT' : 'NOT SENT',
                    ihmProductCode: `IHM|00${tagIdx}${sIdx}|${i}`,
                    poNumber: `PO-${tagIdx}-${100 + i}`,
                    mdsReq: tag === 'Pending Mds' ? '01/01/2024' : '',
                    mdsRec: tag === 'Received Mds' ? '05/01/2024' : '',
                    itemDescription: `Component ${tag} type ${i}`,
                    orderDate: `2024-01-${10 + i}`,
                    quantityTotal: `${i} | ${i + 2} | 0`,
                    unit: 'Piece',
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

export default function PurchaseOrderView({ vesselName, imo }: { vesselName: string; imo: string }) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [openSuppliers, setOpenSuppliers] = useState<string[]>([]);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [keyword, setKeyword] = useState('');
    const [filterSearch, setFilterSearch] = useState('');
    const [allItems, setAllItems] = useState<PurchaseOrderItem[]>(initializeData());

    const dateFromRef = useRef<HTMLInputElement>(null);
    const dateToRef = useRef<HTMLInputElement>(null);

    const currentSuppliers = useMemo(() => {
        const filteredItems = allItems.filter(item => {
            if (activeFilter !== 'All' && item.category !== activeFilter) return false;
            if (dateFrom || dateTo) {
                const itemDate = new Date(item.orderDate);
                const fromDate = dateFrom ? new Date(dateFrom) : null;
                const toDate = dateTo ? new Date(dateTo) : null;
                if (fromDate && itemDate < fromDate) return false;
                if (toDate && itemDate > toDate) return false;
            }
            if (keyword && !item.itemDescription.toLowerCase().includes(keyword.toLowerCase())) return false;
            return true;
        });

        const meta = getSupplierMeta(activeFilter);
        return meta.map((s, idx) => {
            const supplierItems = filteredItems.slice(idx * 5, (idx + 1) * 5);
            return {
                ...s,
                totalItems: `${supplierItems.length * 2}(${supplierItems.length})`,
                mds: `${supplierItems.filter(i => i.mdsRec).length} / ${supplierItems.length}`,
                hm: `0 | ${supplierItems.length > 2 ? 4 : 0}`,
                items: supplierItems
            };
        }).filter(s => s.items.length > 0);
    }, [activeFilter, dateFrom, dateTo, keyword, allItems]);

    const selectedCount = allItems.filter(i => i.selected).length;
    const isAnySupplierOpen = openSuppliers.length > 0;

    const toggleItemSelection = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setAllItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
    };

    const toggleAllInSupplier = (items: PurchaseOrderItem[], checked: boolean) => {
        const ids = items.map(i => i.id);
        setAllItems(prev => prev.map(item => ids.includes(item.id) ? { ...item, selected: checked } : item));
    };

    const handleRequestMDs = () => {
        if (selectedCount > 0 && activeFilter === 'Request Pending') {
            setAllItems(prev => prev.map(item => {
                if (item.selected && item.category === 'Request Pending') {
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
            alert('Complete request MDs & SDoCs: Status updated to PENDING MDs.');
        }
    };

    return (
        <div className="po-v4-main-wrapper">
            <div className="po-v4-scroll-content">
                <div className="po-v4-container-limited">
                    {/* Filters Section */}
                    <div className={`po-v4-filters-box-premium ${isFilterOpen ? 'expanded' : ''}`}>
                        <div className="po-v4-filters-header-premium" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                            <div className="po-v4-filters-title-main">
                                <Filter size={18} />
                                <span>Filters</span>
                            </div>
                            <div className="po-v4-filters-search-styled">
                                {/* No icon here as per instruction */}
                                <input
                                    type="text"
                                    placeholder="Search based on filters"
                                    value={filterSearch}
                                    onChange={(e) => setFilterSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                            {isFilterOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>

                        {isFilterOpen && (
                            <div className="po-v4-filters-content-premium">
                                <div className="po-v4-filters-row-premium">
                                    <div className="po-v4-date-inputs-group">
                                        <div className="po-v4-date-field-styled" onClick={() => dateFromRef.current?.showPicker()}>
                                            <label>Order From Date</label>
                                            <div className="po-v4-date-input-wrapper">
                                                <input
                                                    ref={dateFromRef}
                                                    type="date"
                                                    value={dateFrom}
                                                    onChange={(e) => setDateFrom(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="po-v4-date-native-input"
                                                />
                                                <Calendar size={16} className="po-v4-calendar-icon-styled" />
                                            </div>
                                        </div>
                                        <div className="po-v4-date-field-styled" onClick={() => dateToRef.current?.showPicker()}>
                                            <label>Order To Date</label>
                                            <div className="po-v4-date-input-wrapper">
                                                <input
                                                    ref={dateToRef}
                                                    type="date"
                                                    value={dateTo}
                                                    onChange={(e) => setDateTo(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="po-v4-date-native-input"
                                                />
                                                <Calendar size={16} className="po-v4-calendar-icon-styled" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* HORIZONTAL Filter Actions as per latest request */}
                                    <div className="po-v4-filter-actions-horizontal-group">
                                        <button type="button" className="po-v4-btn-circle-action-styled search" title="Search"><Search size={18} /></button>
                                        <button type="button" className="po-v4-btn-circle-action-styled reset" title="Reset" onClick={(e) => { e.stopPropagation(); setDateFrom(''); setDateTo(''); setActiveFilter('All'); setKeyword(''); }}><RefreshCw size={18} /></button>
                                    </div>
                                </div>

                                <div className="po-v4-tags-container-premium" onClick={(e) => e.stopPropagation()}>
                                    {FILTER_TAGS.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            className={`po-v4-tag-item-premium ${activeFilter === tag ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); setActiveFilter(tag); }}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>

                                <div className="po-v4-keyword-search-premium" onClick={(e) => e.stopPropagation()}>
                                    <div className="po-v4-keyword-label-row">
                                        <label>Keywords</label>
                                        <div className="po-v4-keyword-input-box">
                                            <Search size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search based on keyword"
                                                className="po-v4-keyword-input-field"
                                                value={keyword}
                                                onChange={(e) => setKeyword(e.target.value)}
                                            />
                                        </div>
                                        <ChevronDown size={14} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Top strip containing only the soft search now */}
                    <div className="po-v4-top-strip-clean">
                        <div className="po-v4-soft-search-box-premium">
                            <Search size={16} />
                            <input type="text" placeholder="Search..." className="po-v4-soft-search-input-premium" />
                        </div>
                    </div>

                    {/* Details Block */}
                    <div className="po-v4-details-section-premium">
                        <div className="po-v4-details-section-title">
                            <span>Details</span>
                        </div>
                        <div className="po-v4-suppliers-list-structured">
                            {currentSuppliers.map(supplier => (
                                <div key={supplier.id} className={`po-v4-supplier-item-v4 ${openSuppliers.includes(supplier.id) ? 'is-open' : ''}`}>
                                    <div className="po-v4-supplier-header-v4" onClick={(e) => setOpenSuppliers(prev => prev.includes(supplier.id) ? prev.filter(id => id !== supplier.id) : [...prev, supplier.id])}>
                                        <div className="po-v4-sup-info-v4">
                                            <div className="po-v4-sup-ref-tag">{supplier.ref}</div>
                                            <div className="po-v4-sup-name-title">{supplier.name}</div>
                                        </div>
                                        <div className="po-v4-sup-metrics-v4">
                                            <div className="po-v4-sup-metric-pill">
                                                <span className="lbl">Total Items Supplied (POs)</span>
                                                <span className="val">{supplier.totalItems}</span>
                                            </div>
                                            <div className="po-v4-sup-metric-pill">
                                                <span className="lbl">MDS</span>
                                                <span className="val">{supplier.mds}</span>
                                            </div>
                                            <div className="po-v4-sup-metric-pill">
                                                <span className="lbl">HM</span>
                                                <span className="val">{supplier.hm}</span>
                                            </div>
                                            <ChevronDown size={20} className={`po-v4-arrow-icon ${openSuppliers.includes(supplier.id) ? 'up' : ''}`} />
                                        </div>
                                    </div>

                                    {openSuppliers.includes(supplier.id) && (
                                        <div className="po-v4-supplier-details-v4">
                                            {/* Localized Toolbar just above the column headers */}
                                            <div className="po-v4-table-toolbar-localized">
                                                <div className="po-v4-action-icons-localized">
                                                    {selectedCount > 0 && (
                                                        <div className="po-v4-action-item-local tooltip-p" onClick={handleRequestMDs}>
                                                            <div className="po-v4-circle-btn-v4 active">
                                                                <FileText size={18} />
                                                            </div>
                                                            <span className="po-v4-tooltip-text">Complete request MDs & SDoCs</span>
                                                        </div>
                                                    )}
                                                    <div className="po-v4-action-item-local tooltip-p">
                                                        <div className="po-v4-circle-btn-v4 active">
                                                            <RotateCw size={18} />
                                                        </div>
                                                        <span className="po-v4-tooltip-text">Refresh Data</span>
                                                    </div>
                                                    <div className="po-v4-action-item-local tooltip-p">
                                                        <div className="po-v4-circle-btn-v4 active">
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
                                                                <input type="checkbox" className="po-v4-header-checkbox-v4" checked={supplier.items.length > 0 && supplier.items.every(i => i.selected)} onChange={(e) => toggleAllInSupplier(supplier.items, e.target.checked)} onClick={(e) => e.stopPropagation()} />
                                                            </th>
                                                            <th className="ac-col">Action</th>
                                                            <th className="em-col">Email Status</th>
                                                            <th className="ihm-col">IHM Product Code</th>
                                                            <th className="po-col">PO Number</th>
                                                            <th className="mdr-col">MDs SDoCs Req</th>
                                                            <th className="mdc-col">MDs SDoCs Rec</th>
                                                            <th className="it-col">Item Description</th>
                                                            <th className="da-col">Order Date</th>
                                                            <th className="qt-col">Quantity</th>
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

            {/* Metrics Summary footer - Unified Design */}
            <div className="po-v4-fixed-metrics-footer-premium">
                <div className="metric-items-group-premium">
                    <div className="metric-item-v4">
                        <span className="label-v4">TOTAL POS:</span>
                        <span className="value-v4">865</span>
                    </div>
                    <div className="metric-item-v4">
                        <span className="label-v4">MDS REQUESTED:</span>
                        <span className="value-v4">328</span>
                    </div>
                    <div className="metric-item-v4">
                        <span className="label-v4">MDS RECEIVED:</span>
                        <span className="value-v4">147</span>
                    </div>
                    <div className="metric-item-v4">
                        <span className="label-v4">MDS PENDING:</span>
                        <span className="value-v4">181</span>
                    </div>
                    <div className="metric-item-v4">
                        <span className="label-v4">HM GREEN:</span>
                        <span className="value-v4 green">145</span>
                    </div>
                    <div className="metric-item-v4">
                        <span className="label-v4">HM RED:</span>
                        <span className="value-v4 red">2</span>
                    </div>
                    <div className="metric-item-v4">
                        <span className="label-v4">PCHM QTY:</span>
                        <span className="value-v4">0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
