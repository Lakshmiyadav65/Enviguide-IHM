import { useState, useMemo, useEffect } from 'react';
import {
    ChevronDown, Search, Edit2, Trash2,
    FileText, Filter, Mail, X, Send, Paperclip,
    Link as LinkIcon, Smile, Image, CheckCircle2
} from 'lucide-react';
import './PurchaseOrderView.css';
import { api } from '../../lib/apiClient';
import { ENDPOINTS } from '../../config/api.config';

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
    isSuspected?: boolean;
    // Clarification-item identifiers (needed to upload the MDS doc).
    clarificationId?: string;
    itemIndex?: number;
    mdsStatus?: 'pending' | 'received' | string;
    mdsFilePath?: string;
    mdsFileName?: string;
}

const FILTER_TAGS = [
    'Pending Mds', 'Received Mds', 'Tracked Items', 'Non Tracked Items',
    'Request Pending', 'Reminder 1', 'Reminder 2', 'Non-Responsive Supplier',
    'HM Red', 'HM Green', 'PCHM', 'Non HM', 'Review Repeated Items', 'Suspected Items', 'All'
];

// Real items now come from GET /audits/:imo/clarifications. Mock data removed.
const initializeData = (): PurchaseOrderItem[] => [];

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

interface PurchaseOrderViewProps {
    imo: string;
}

export default function PurchaseOrderView({ imo }: PurchaseOrderViewProps) {
    const [activeFilter, setActiveFilter] = useState('All');
    const [openSuppliers, setOpenSuppliers] = useState<string[]>(['s1']);
    const [allItems, setAllItems] = useState<PurchaseOrderItem[]>(initializeData);

    // Fetch clarification history for this IMO from the backend. Each clarification
    // email may reference many suspected POs; we flatten them into one row per item
    // and merge in per-item MDS state from clarification_items.
    const loadClarifications = () => {
        if (!imo) return;
        api.get<{ success: boolean; data: Array<Record<string, unknown>> }>(ENDPOINTS.AUDITS.CLARIFICATIONS(imo))
            .then((res) => {
                const items: PurchaseOrderItem[] = [];
                for (const c of res.data || []) {
                    const clarificationId = String(c.id);
                    const rows = Array.isArray(c.suspected_items) ? c.suspected_items as unknown[][] : [];
                    const perItemState = Array.isArray(c.items) ? c.items as Array<Record<string, unknown>> : [];
                    const stateByIndex = new Map<number, Record<string, unknown>>();
                    for (const s of perItemState) stateByIndex.set(Number(s.item_index), s);

                    const sentDate = typeof c.created_at === 'string' ? c.created_at.split('T')[0] : '';
                    const subject = String(c.subject || '');
                    const body = String(c.body || '');
                    const recipients = String(c.recipient_emails || '');

                    rows.forEach((row, i) => {
                        const r = Array.isArray(row) ? row : [];
                        const state = stateByIndex.get(i) || {};
                        const mdsStatus = String(state.mds_status ?? 'pending');
                        const mdsFilePath = state.mds_file_path ? String(state.mds_file_path) : undefined;
                        const mdsFileName = state.mds_file_name ? String(state.mds_file_name) : undefined;
                        const mdsReceivedAt = typeof state.mds_received_at === 'string'
                            ? state.mds_received_at.split('T')[0]
                            : '';

                        items.push({
                            id: `${clarificationId}-${i}`,
                            clarificationId,
                            itemIndex: i,
                            emailStatus: 'SENT',
                            ihmProductCode: String(r[8] ?? r[9] ?? 'N/A'),
                            poNumber: String(r[2] ?? ''),
                            mdsReq: String(r[5] ?? sentDate),
                            mdsRec: mdsReceivedAt,
                            itemDescription: String(r[6] ?? ''),
                            orderDate: String(r[4] ?? sentDate),
                            quantityTotal: `${r[16] ?? '0'} | 0 | ${r[16] ?? '0'}`,
                            unit: String(r[15] ?? 'PCS'),
                            category: mdsStatus === 'received' ? 'Received Mds' : 'Request Pending',
                            isSuspected: true,
                            selected: false,
                            mdsStatus,
                            mdsFilePath,
                            mdsFileName,
                            vendorName: String(r[19] ?? ''),
                            vendorEmail: String(r[18] ?? recipients),
                            mailSubject: subject,
                            mailBody: body,
                        } as PurchaseOrderItem);
                    });
                }
                setAllItems(items);
            })
            .catch(() => setAllItems([]));
    };

    useEffect(loadClarifications, [imo]);

    // Upload an MDS document for one clarification item, then refresh.
    const uploadMdsDocument = async (item: PurchaseOrderItem, file: File) => {
        if (!item.clarificationId || item.itemIndex === undefined) return;
        const fd = new FormData();
        fd.append('file', file);
        try {
            await api.upload(
                ENDPOINTS.AUDITS.CLARIFICATION_ITEM_DOC(item.clarificationId, item.itemIndex),
                fd,
            );
            loadClarifications();
        } catch (err) {
            console.error('MDS upload failed:', err);
        }
    };
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);

    // Mail & Doc View State
    const [showMailView, setShowMailView] = useState(false);
    const [selectedMail, setSelectedMail] = useState<{ subject: string; body: string; to: string } | null>(null);
    const [showDocView, setShowDocView] = useState(false);
    const [selectedDocName, setSelectedDocName] = useState('');
    const [showToast, setShowToast] = useState(false);

    const toggleSupplier = (id: string) => {
        setOpenSuppliers(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    };

    const currentSuppliersData = useMemo(() => {
        const filteredItems = allItems.filter(item => {
            if (activeFilter !== 'All') {
                if (item.isSuspected) {
                    // Map each MDS status to the filter tabs that should show it.
                    const pendingTabs = ['Request Pending', 'Suspected Items', 'Pending Mds', 'Reminder 1', 'Reminder 2'];
                    const receivedTabs = ['Received Mds', 'Suspected Items'];
                    const isReceived = item.mdsStatus === 'received';
                    const allowed = isReceived ? receivedTabs : pendingTabs;
                    if (!allowed.includes(activeFilter)) return false;
                } else if (item.category !== activeFilter) {
                    return false;
                }
            }
            if (searchTerm && !item.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) && !item.poNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        });

        const meta = getSupplierMeta(activeFilter);
        return meta.map((s, idx) => {
            const supplierItems = filteredItems.filter(item => {
                // If it's a suspected item, match by vendor name if we have it
                if (item.isSuspected) {
                    return s.name.toLowerCase().includes((item as any).vendorName?.toLowerCase() || '');
                }
                return true;
            }).slice(idx * 10, (idx + 1) * 10);

            return {
                ...s,
                totalItems: `${supplierItems.length * 2}(${supplierItems.length})`,
                mds: `${supplierItems.filter(i => i.mdsRec).length} / ${supplierItems.length}`,
                hm: `0 | ${supplierItems.length > 2 ? 4 : 0}`,
                items: supplierItems.map(item => {
                    // Dynamic email status based on filter
                    if (item.isSuspected) {
                        if (activeFilter === 'Reminder 1') return { ...item, emailStatus: 'SENT (Reminder 1)' };
                        if (activeFilter === 'Reminder 2') return { ...item, emailStatus: 'SENT (Reminder 2)' };
                    }
                    return item;
                })
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



    const handleViewMail = (item: any) => {
        if (item.emailStatus.includes('SENT')) {
            setSelectedMail({
                subject: item.mailSubject || `Inquiry: ${item.poNumber} - ${item.itemDescription}`,
                body: item.mailBody || `Dear Supplier,\n\nWe are following up on the status of MDs/SDoCs for ${item.itemDescription} under PO ${item.poNumber}.\n\nPlease provide the required documentation at your earliest convenience.\n\nBest Regards,\nIHM Platform Team`,
                to: item.vendorEmail || 'supplier@example.com'
            });
            setShowMailView(true);
        }
    };

    const handleSendMail = () => {
        setShowMailView(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleBulkEmail = () => {
        const selected = allItems.filter(i => i.selected);
        if (selected.length === 0) return;

        // Escalation Logic
        const nextCategoryMap: Record<string, string> = {
            'Request Pending': 'Reminder 1',
            'Reminder 1': 'Reminder 2',
            'Reminder 2': 'Non-Responsive Supplier'
        };

        // Update items
        setAllItems(prev => prev.map(item => {
            if (item.selected) {
                const currentCat = item.category === 'All' ? 'Request Pending' : item.category;
                const nextCat = nextCategoryMap[currentCat] || currentCat;
                return {
                    ...item,
                    category: nextCat,
                    emailStatus: `SENT (${nextCat})`,
                    selected: false
                };
            }
            return item;
        }));

        const isReminder2 = selected.some(i => i.category === 'Reminder 1');
        const subject = isReminder2
            ? `URGENT: FINAL REMINDER - Documentation Overdue for ${imo}`
            : `Reminder: Documentation Required for POs on ${imo}`;

        const bodyWithUrgency = isReminder2
            ? `Dear Partners,\n\nThis is an URGENT FINAL REMINDER regarding ${selected.length} items on ${imo}. Outstanding MDs/SDoCs have NOT been received despite previous requests.\n\nItems:\n${selected.map(s => `- PO: ${s.poNumber}`).join('\n')}\n\nFailure to provide documentation within 24 hours will result in the supplier being marked as NON-RESPONSIVE in our system.\n\nBest Regards,\nIHM Audit Team`
            : `Dear Partners,\n\nWe are sending a follow-up reminder regarding ${selected.length} items on ${imo}. We have not yet received the requested MDs/SDoCs.\n\nItems:\n${selected.map(s => `- PO: ${s.poNumber}`).join('\n')}\n\nPlease update these records immediately.\n\nBest Regards,\nIHM Audit Team`;

        // Open Mail Modal for the first item or a summary
        setSelectedMail({
            to: (selected[0] as any).vendorEmail || 'multiple-suppliers@example.com',
            subject: subject,
            body: bodyWithUrgency
        });
        setShowMailView(true);
    };

    const handleBulkDocs = () => {
        const selected = allItems.filter(i => i.selected);
        if (selected.length === 0) return;

        setSelectedDocName(`${selected.length} Selected Documents Bundle`);
        setShowDocView(true);

        // Deselect
        setAllItems(prev => prev.map(i => ({ ...i, selected: false })));
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
                                                    <>
                                                        <div className="po-v4-action-item-local tooltip-p" onClick={handleBulkEmail}>
                                                            <div className="po-v4-circle-btn-v4 mail-bulk">
                                                                <Mail size={18} />
                                                            </div>
                                                            <span className="po-v4-tooltip-text">Send Reminders</span>
                                                        </div>
                                                        <div className="po-v4-action-item-local tooltip-p" onClick={handleBulkDocs}>
                                                            <div className="po-v4-circle-btn-v4 docs-bulk">
                                                                <FileText size={18} />
                                                            </div>
                                                            <span className="po-v4-tooltip-text">View All Selected Docs</span>
                                                        </div>
                                                    </>
                                                )}
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
                                                        <th className="ac-col">Options Channel</th>
                                                        <th className="doc-col">Documents</th>
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
                                                                    {item.selected && <span className="check-icon-v4">âœ"</span>}
                                                                </div>
                                                            </td>
                                                            <td className="ac-col">
                                                                <div className="po-v4-row-action-btns-premium">
                                                                    <button
                                                                        type="button"
                                                                        className="po-v4-action-icon-btn-v4 view"
                                                                        title="View Sent Mail"
                                                                        onClick={() => handleViewMail(item)}
                                                                        style={{ visibility: ['SENT', 'SENT (Reminder 1)', 'SENT (Reminder 2)'].some(s => item.emailStatus.includes(s)) ? 'visible' : 'hidden' }}
                                                                    >
                                                                        <Mail size={14} />
                                                                    </button>
                                                                    <button type="button" className="po-v4-action-icon-btn-v4 edit" title="Edit Item"><Edit2 size={14} /></button>
                                                                    <button type="button" className="po-v4-action-icon-btn-v4 delete" title="Delete Item"><Trash2 size={14} /></button>
                                                                </div>
                                                            </td>
                                                            <td className="doc-col">
                                                                {item.mdsFilePath ? (
                                                                    <a
                                                                        href={item.mdsFilePath}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="po-v4-action-icon-btn-v4 doc"
                                                                        title={`View uploaded MDS (${item.mdsFileName || 'document'})`}
                                                                        style={{ display: 'inline-flex', color: '#10B981' }}
                                                                    >
                                                                        <FileText size={14} />
                                                                    </a>
                                                                ) : (
                                                                    <label
                                                                        className="po-v4-action-icon-btn-v4 doc"
                                                                        title="Upload MDS / SDoC document"
                                                                        style={{ cursor: 'pointer', display: 'inline-flex' }}
                                                                    >
                                                                        <FileText size={14} />
                                                                        <input
                                                                            type="file"
                                                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                                            style={{ display: 'none' }}
                                                                            onChange={(e) => {
                                                                                const f = e.target.files?.[0];
                                                                                if (f) uploadMdsDocument(item, f);
                                                                                e.target.value = '';
                                                                            }}
                                                                        />
                                                                    </label>
                                                                )}
                                                            </td>
                                                            <td className="em-col">{item.emailStatus}</td>
                                                            <td className="ihm-col">{item.ihmProductCode}</td>
                                                            <td className="po-col">{item.poNumber}</td>
                                                            <td className="mdr-col">{item.mdsReq}</td>
                                                            <td className="mdc-col">{item.mdsRec}</td>
                                                            <td className="it-col">
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                    <span>{item.itemDescription}</span>
                                                                    {item.isSuspected && (
                                                                        <span style={{
                                                                            fontSize: '10px',
                                                                            fontWeight: 700,
                                                                            color: '#F97316',
                                                                            background: '#FFF7ED',
                                                                            padding: '2px 6px',
                                                                            borderRadius: '4px',
                                                                            border: '1px solid #FFEDD5',
                                                                            width: 'fit-content'
                                                                        }}>
                                                                            SUSPECTED
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
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

            {/* Premium Gmail-Style Mail Modal */}
            {showMailView && selectedMail && (
                <div className="gmail-overlay">
                    <div className="gmail-compose">
                        <div className="gmail-header">
                            <span className="gmail-title">Outgoing Clarification Mail</span>
                            <div className="gmail-header-actions">
                                <X size={20} className="close-icon" onClick={() => setShowMailView(false)} />
                            </div>
                        </div>

                        <div className="gmail-body">
                            <div className="gmail-row">
                                <span className="gmail-label">To</span>
                                <input
                                    className="gmail-input"
                                    value={selectedMail.to}
                                    onChange={(e) => setSelectedMail({ ...selectedMail, to: e.target.value })}
                                />
                            </div>
                            <div className="gmail-row">
                                <span className="gmail-label">Subject</span>
                                <input
                                    className="gmail-input"
                                    value={selectedMail.subject}
                                    onChange={(e) => setSelectedMail({ ...selectedMail, subject: e.target.value })}
                                />
                            </div>

                            <div className="gmail-body" style={{ flex: 1, padding: 0 }}>
                                <textarea
                                    className="gmail-content"
                                    value={selectedMail.body}
                                    onChange={(e) => setSelectedMail({ ...selectedMail, body: e.target.value })}
                                    style={{ width: '100%', height: '100%', border: 'none', outline: 'none', resize: 'none', padding: '16px', fontSize: '14px', fontFamily: 'inherit' }}
                                />
                            </div>
                        </div>

                        <div className="gmail-footer">
                            <div className="footer-left">
                                <button className="gmail-send-btn" onClick={handleSendMail}>
                                    <Send size={15} style={{ marginRight: 8 }} />
                                    Send
                                </button>
                                <div className="gmail-tool-icons">
                                    <span className="tool-icon-btn"><Paperclip size={20} /></span>
                                    <span className="tool-icon-btn"><LinkIcon size={20} /></span>
                                    <span className="tool-icon-btn"><Smile size={20} /></span>
                                    <span className="tool-icon-btn"><Image size={20} /></span>
                                    <span className="tool-icon-btn"><Mail size={20} /></span>
                                </div>
                            </div>
                            <div className="footer-right">
                                <span className="tool-icon-btn trash-icon" onClick={() => setShowMailView(false)}><Trash2 size={20} /></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showToast && (
                <div className="audit-success-toast">
                    <div className="toast-content-wrapper">
                        <div className="toast-icon-green">
                            <CheckCircle2 size={24} fill="#10B981" color="white" />
                        </div>
                        <div className="toast-text-area">
                            <h3>Mail Sent Successfully</h3>
                            <p>Your clarification/reminder has been dispatched to the supplier.</p>
                        </div>
                    </div>
                    <button className="undo-action-btn" onClick={() => setShowToast(false)}>CLOSE</button>
                </div>
            )}
            {/* Document Preview Modal */}
            {showDocView && (
                <div className="mail-view-overlay-clean" onClick={() => setShowDocView(false)}>
                    <div className="mail-view-modal-clean doc-preview" onClick={e => e.stopPropagation()}>
                        <div className="mail-view-header-clean">
                            <div className="header-left-clean">
                                <FileText size={20} className="mail-blue" />
                                <h3>Document Preview - {selectedDocName}</h3>
                            </div>
                            <button className="mail-close-btn-clean" onClick={() => setShowDocView(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="doc-preview-body-clean">
                            <div className="dummy-pdf-viewer">
                                <div className="pdf-page-mock">
                                    <div className="pdf-header-mock">
                                        <div className="pdf-logo-box">IHM</div>
                                        <div className="pdf-title-box">
                                            <h4>MATERIAL DECLARATION</h4>
                                            <span>Document No: MD-2024-00129</span>
                                        </div>
                                    </div>
                                    <div className="pdf-content-mock">
                                        <div className="pdf-section-v4">
                                            <h5>Supplier Information</h5>
                                            <p>Name: Henry Marine A/S</p>
                                            <p>Address: Skudehavnsvej 25, DK-2100 Copenhagen</p>
                                        </div>
                                        <div className="pdf-section-v4">
                                            <h5>Product Information</h5>
                                            <p>Description: {selectedDocName}</p>
                                            <p>IHM Code: PCHM-2024-X</p>
                                        </div>
                                        <div className="pdf-table-mock">
                                            <div className="pdf-table-header">
                                                <span>Hazardous Material</span>
                                                <span>Threshold</span>
                                                <span>Status</span>
                                            </div>
                                            <div className="pdf-table-row">
                                                <span>Asbestos</span>
                                                <span>No Threshold</span>
                                                <span>NOT PRESENT</span>
                                            </div>
                                            <div className="pdf-table-row">
                                                <span>Ozone Depleting Substances</span>
                                                <span>No Threshold</span>
                                                <span>NOT PRESENT</span>
                                            </div>
                                        </div>
                                        <div className="pdf-footer-signature">
                                            <div className="sig-line">Digital Signature Confirmed</div>
                                            <span>Date: 01/01/2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mail-view-footer-clean">
                            <button className="mail-cancel-btn-final" onClick={() => setShowDocView(false)}>Cancel</button>
                            <button className="mail-close-final" onClick={() => setShowDocView(false)}>Close Preview</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
