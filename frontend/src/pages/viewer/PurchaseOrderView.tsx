import { useState, useMemo, useEffect } from 'react';
import {
    ChevronDown, Search, Edit2, Trash2,
    FileText, Filter, Mail, X, Send, Paperclip,
    Link as LinkIcon, Smile, Image, CheckCircle2, Check
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
    isSuspected?: boolean;
    // Clarification-item identifiers (needed to upload the MDS doc).
    clarificationId?: string;
    itemIndex?: number;
    // Combined MDS status — 'received' iff both MD and SDoC are in.
    mdsStatus?: 'pending' | 'received' | string;
    // Per-doc state. mdStatus / sdocStatus default to 'pending' when an
    // item has a clarification but the slot hasn't been uploaded yet.
    mdStatus?: 'pending' | 'received' | string;
    mdFilePath?: string;
    mdFileName?: string;
    sdocStatus?: 'pending' | 'received' | string;
    sdocFilePath?: string;
    sdocFileName?: string;
    reminderCount?: number;
    // 'red' | 'green' | 'pchm' | null — set by the HM categorization flow.
    hmStatus?: string | null;
    // Set when the admin has marked this item reviewed. Drives the
    // 'Reviewed Mds' filter pill and the Reviewed badge.
    reviewedAt?: string | null;
    reviewedBy?: string | null;
    vendorName?: string;
    vendorEmail?: string;
}

const FILTER_TAGS = [
    'Pending Mds', 'Received Mds', 'Reviewed Mds', 'Tracked Items', 'Non Tracked Items',
    'Request Pending', 'Reminder 1', 'Reminder 2', 'Non-Responsive Supplier',
    'HM Red', 'HM Green', 'PCHM', 'Non HM', 'Review Repeated Items', 'Suspected Items', 'All'
];

// Real items now come from GET /audits/:imo/clarifications. Mock data removed.
const initializeData = (): PurchaseOrderItem[] => [];

interface PurchaseOrderViewProps {
    imo: string;
    vesselId?: string;
    vesselName?: string;
}

export default function PurchaseOrderView({ imo, vesselId, vesselName }: PurchaseOrderViewProps) {
    const [activeFilter, setActiveFilter] = useState('All');
    const [openSuppliers, setOpenSuppliers] = useState<string[]>(['s1']);
    const [allItems, setAllItems] = useState<PurchaseOrderItem[]>(initializeData);

    // Fetch clarification history for this IMO from the backend. Each clarification
    // email may reference many suspected POs; we flatten them into one row per item
    // and merge in per-item MDS state from clarification_items.
    // Fetch every line item for the vessel's active audit. The backend already
    // joins clarification state per PO, so non-suspected items show with
    // mds_status='none' and suspected items carry real pending/received status.
    const loadClarifications = () => {
        if (!vesselId) { setAllItems([]); return; }
        api.get<{ success: boolean; data: { items: Array<Record<string, unknown>> } }>(
            ENDPOINTS.AUDITS.VESSEL_PO_ITEMS(vesselId),
        )
            .then((res) => {
                const rows = res.data?.items || [];
                const items: PurchaseOrderItem[] = rows.map((r, i) => {
                    const mdsStatus = String(r.mds_status ?? 'none');
                    const isSuspected = String(r.is_suspected ?? 'No') === 'Yes';
                    const mdStatus = String(r.md_status ?? r.mds_status ?? 'none');
                    const mdFilePath = r.md_file_path ? String(r.md_file_path) : (r.mds_file_path ? String(r.mds_file_path) : undefined);
                    const mdFileName = r.md_file_name ? String(r.md_file_name) : (r.mds_file_name ? String(r.mds_file_name) : undefined);
                    const sdocStatus = String(r.sdoc_status ?? 'none');
                    const sdocFilePath = r.sdoc_file_path ? String(r.sdoc_file_path) : undefined;
                    const sdocFileName = r.sdoc_file_name ? String(r.sdoc_file_name) : undefined;
                    const mdsReceivedAt = typeof r.mds_received_at === 'string' ? r.mds_received_at.split('T')[0] : '';
                    const poSentDate = typeof r.po_sent_date === 'string' ? r.po_sent_date.split('T')[0] : String(r.po_sent_date ?? '');
                    const mdReqDate = typeof r.md_requested_date === 'string' ? r.md_requested_date.split('T')[0] : String(r.md_requested_date ?? '');
                    const reminderCount = Number(r.reminder_count ?? 0);
                    const hmStatusRaw = r.hm_status ? String(r.hm_status).toLowerCase() : null;
                    const reviewedAt = r.reviewed_at ? String(r.reviewed_at) : null;
                    const reviewedBy = r.reviewed_by ? String(r.reviewed_by) : null;

                    let emailStatus: string;
                    if (!isSuspected) emailStatus = 'NOT SENT';
                    else if (!r.clarification_id) emailStatus = 'NOT SENT';
                    else if (reviewedAt) emailStatus = 'REVIEWED';
                    else if (mdsStatus === 'received') emailStatus = 'REPLIED';
                    else if (reminderCount >= 3) emailStatus = 'NON-RESPONSIVE';
                    else if (reminderCount >= 1) emailStatus = `REMINDER ${reminderCount}`;
                    else emailStatus = 'SENT';

                    return {
                        id: r.clarification_id
                            ? `${r.clarification_id}-${r.clarification_item_index}`
                            : `row-${r.row_index ?? i}`,
                        clarificationId: r.clarification_id ? String(r.clarification_id) : undefined,
                        itemIndex: r.clarification_item_index != null ? Number(r.clarification_item_index) : undefined,
                        emailStatus,
                        ihmProductCode: String(r.impa_code ?? r.issa_code ?? 'N/A'),
                        poNumber: String(r.po_number ?? ''),
                        mdsReq: mdReqDate || poSentDate,
                        mdsRec: mdsReceivedAt,
                        itemDescription: String(r.item_description ?? ''),
                        orderDate: poSentDate,
                        quantityTotal: `${r.quantity ?? '0'} | ${mdsStatus === 'received' ? (r.quantity ?? '0') : '0'} | ${r.quantity ?? '0'}`,
                        unit: String(r.unit ?? 'PCS'),
                        isSuspected,
                        selected: false,
                        mdsStatus,
                        mdStatus,
                        mdFilePath,
                        mdFileName,
                        sdocStatus,
                        sdocFilePath,
                        sdocFileName,
                        reminderCount,
                        hmStatus: hmStatusRaw,
                        reviewedAt,
                        reviewedBy,
                        vendorName: String(r.vendor_name ?? ''),
                        vendorEmail: String(r.vendor_email ?? ''),
                    };
                });
                setAllItems(items);
            })
            .catch(() => setAllItems([]));
    };

    useEffect(loadClarifications, [vesselId]);

    // Admin is view-only on supplier documents — uploads happen exclusively
    // through the public supplier link (handled by the public controller).

    // Mark a clarification item as reviewed by the admin. Moves the row from
    // 'Received Mds' to 'Reviewed Mds' on next refresh.
    const markItemReviewed = async (item: PurchaseOrderItem) => {
        if (!item.clarificationId || item.itemIndex === undefined) return;
        try {
            await api.post(
                ENDPOINTS.AUDITS.CLARIFICATION_ITEM_REVIEW(item.clarificationId, item.itemIndex),
                {},
            );
            loadClarifications();
        } catch (err) {
            console.error('Mark reviewed failed:', err);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);

    // Mail & Doc View State
    const [showMailView, setShowMailView] = useState(false);
    const [selectedMail, setSelectedMail] = useState<{ subject: string; body: string; to: string } | null>(null);
    const [reminderItem, setReminderItem] = useState<PurchaseOrderItem | null>(null);
    const [sendingReminder, setSendingReminder] = useState(false);
    const [showDocView, setShowDocView] = useState(false);
    const [selectedDocName, setSelectedDocName] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({
        title: 'Mail Sent Successfully',
        body: 'Your clarification/reminder has been dispatched to the supplier.',
    });

    const toggleSupplier = (id: string) => {
        setOpenSuppliers(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    };

    // Set of item-description keys that appear on 2+ rows — feeds the
    // 'Review Repeated Items' filter.
    const repeatedKeys = useMemo(() => {
        const counts = new Map<string, number>();
        for (const item of allItems) {
            const key = item.itemDescription.trim().toLowerCase();
            if (!key) continue;
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        const out = new Set<string>();
        counts.forEach((c, k) => { if (c >= 2) out.add(k); });
        return out;
    }, [allItems]);

    const currentSuppliersData = useMemo(() => {
        // One predicate per filter pill. Each rule is documented in the
        // workflow spec; HM Red / HM Green / PCHM key off `hm_status` from
        // clarification_items, which is currently set only via the audit
        // categorization wizard — those tabs return zero until that flow is
        // wired to persist hm_status.
        const matchesFilter = (item: PurchaseOrderItem): boolean => {
            if (activeFilter === 'All') return true;
            const isReceived = item.mdsStatus === 'received';
            const reminders = item.reminderCount ?? 0;
            const hasClar = !!item.clarificationId;
            const hm = (item.hmStatus ?? '').toLowerCase();
            const descKey = item.itemDescription.trim().toLowerCase();

            switch (activeFilter) {
                case 'Suspected Items':
                    return item.isSuspected === true;
                case 'Request Pending':
                    // Suspected, but the admin hasn't sent a request yet.
                    return item.isSuspected === true && !hasClar;
                case 'Pending Mds':
                    // Request sent, no doc back, no reminders yet.
                    return item.isSuspected === true && hasClar && !isReceived && reminders === 0;
                case 'Reminder 1':
                    return item.isSuspected === true && hasClar && !isReceived && reminders === 1;
                case 'Reminder 2':
                    return item.isSuspected === true && hasClar && !isReceived && reminders === 2;
                case 'Non-Responsive Supplier':
                    return item.isSuspected === true && hasClar && !isReceived && reminders >= 3;
                case 'Received Mds':
                    // Vendor uploaded both docs but the admin hasn't
                    // approved yet — once approved the row moves to
                    // 'Reviewed Mds' instead.
                    return isReceived && !item.reviewedAt;
                case 'Reviewed Mds':
                    // Admin has signed off on the documents.
                    return Boolean(item.reviewedAt);
                case 'Tracked Items':
                    // Anything we've taken action on (request sent at least once).
                    return hasClar;
                case 'Non Tracked Items':
                    // Items we haven't started chasing — commodity rows + suspected-but-unsent.
                    return !hasClar;
                case 'HM Red':
                    return hm === 'red';
                case 'HM Green':
                    return hm === 'green';
                case 'PCHM':
                    return hm === 'pchm';
                case 'Non HM':
                    return item.isSuspected !== true;
                case 'Review Repeated Items':
                    return descKey.length > 0 && repeatedKeys.has(descKey);
                default:
                    return false;
            }
        };

        const filteredItems = allItems.filter(item => {
            if (!matchesFilter(item)) return false;
            if (searchTerm && !item.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) && !item.poNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        });

        // Group by real vendor name. If there are no items yet, show a single
        // placeholder group named after the vessel so the column template stays
        // on screen with an empty state.
        type Supplier = {
            id: string;
            name: string;
            ref: string;
            totalItems: string;
            mds: string;
            hm: string;
            items: PurchaseOrderItem[];
        };

        const byVendor = new Map<string, PurchaseOrderItem[]>();
        for (const item of filteredItems) {
            const vendor = ((item as unknown as { vendorName?: string }).vendorName || '').trim() || 'Unknown Supplier';
            if (!byVendor.has(vendor)) byVendor.set(vendor, []);
            byVendor.get(vendor)!.push(item);
        }

        const suppliers: Supplier[] = [];
        let idx = 0;
        for (const [vendor, items] of byVendor.entries()) {
            suppliers.push({
                id: `v-${idx++}`,
                name: vendor,
                ref: imo ? `( IMO ${imo} )` : '',
                totalItems: `${items.length}`,
                mds: `${items.filter(i => i.mdsRec).length} / ${items.length}`,
                hm: `0 | 0`,
                items,
            });
        }

        // No real items yet — emit a single empty group so the column template
        // is still visible. Don't label it with the vessel name (that reads as
        // a fake supplier); show a clear empty-state heading instead.
        if (suppliers.length === 0) {
            suppliers.push({
                id: 'placeholder',
                name: 'No suppliers yet',
                ref: imo ? `( IMO ${imo} )` : '',
                totalItems: '0',
                mds: '0 / 0',
                hm: '0 | 0',
                items: [],
            });
        }

        return suppliers;
    }, [activeFilter, searchTerm, allItems, imo, vesselName]);

    const selectedCount = allItems.filter(i => i.selected).length;

    const toggleItemSelection = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setAllItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
    };

    const toggleAllInSupplier = (items: PurchaseOrderItem[], checked: boolean) => {
        const ids = items.map(i => i.id);
        setAllItems(prev => prev.map(item => ids.includes(item.id) ? { ...item, selected: checked } : item));
    };



    // Open the compose modal prefilled with a reminder. The supplier can
    // edit the subject/body before sending. Send → POST /remind which
    // re-sends the email via the existing public link and increments
    // reminder_count on the item.
    const handleOpenReminder = (item: PurchaseOrderItem) => {
        if (!item.clarificationId || item.itemIndex === undefined) return;
        const nextReminder = (item.reminderCount ?? 0) + 1;
        setReminderItem(item);
        setSelectedMail({
            to: item.vendorEmail || '',
            subject: `Reminder ${nextReminder}: Documentation required for PO ${item.poNumber}`,
            body: `Dear ${item.vendorName || 'Supplier'},\n\nThis is reminder ${nextReminder} regarding the MDs/SDoCs we need for ${item.itemDescription || 'the item below'} under PO ${item.poNumber}.\n\nPlease use the secure upload link from the original email to submit the required documents at your earliest convenience.\n\nBest regards,\nIHM Platform Team`,
        });
        setShowMailView(true);
    };

    const handleSendMail = async () => {
        if (!selectedMail) {
            setShowMailView(false);
            return;
        }

        // ── Single-row reminder (per-row mail icon) ────────────────
        if (reminderItem) {
            if (!reminderItem.clarificationId || reminderItem.itemIndex === undefined) {
                setShowMailView(false);
                return;
            }
            setSendingReminder(true);
            try {
                await api.post(
                    ENDPOINTS.AUDITS.CLARIFICATION_ITEM_REMIND(
                        reminderItem.clarificationId,
                        reminderItem.itemIndex,
                    ),
                    {
                        to: selectedMail.to,
                        subject: selectedMail.subject,
                        body: selectedMail.body,
                    },
                );
                setToastMessage({
                    title: 'Reminder Sent',
                    body: `Reminder email delivered to ${selectedMail.to || 'the supplier'}.`,
                });
                setShowMailView(false);
                setReminderItem(null);
                loadClarifications();
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } catch (err) {
                console.error('Reminder send failed:', err);
                setToastMessage({
                    title: 'Reminder Failed',
                    body: err instanceof Error ? err.message : 'Could not send reminder. Please try again.',
                });
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
            } finally {
                setSendingReminder(false);
            }
            return;
        }

        // ── Bulk reminder (toolbar mail icon, multiple rows) ───────
        // Group selected items by clarificationId so each vendor gets
        // exactly ONE email regardless of how many of their rows are
        // pending. reminder_count bumps on every selected item, so the
        // Reminder 1 / 2 / Non-Responsive ladder progresses correctly.
        const selected = allItems.filter(
            (i) => i.selected && i.clarificationId && i.itemIndex !== undefined,
        );
        if (selected.length === 0) {
            setShowMailView(false);
            return;
        }
        const byClar = new Map<string, number[]>();
        for (const item of selected) {
            if (!byClar.has(item.clarificationId!)) byClar.set(item.clarificationId!, []);
            byClar.get(item.clarificationId!)!.push(item.itemIndex!);
        }

        setSendingReminder(true);
        try {
            const results = await Promise.allSettled(
                Array.from(byClar.entries()).map(([clarId, indices]) =>
                    api.post(
                        ENDPOINTS.AUDITS.CLARIFICATION_REMIND_BULK(clarId),
                        {
                            itemIndices: indices,
                            to: selectedMail.to,
                            subject: selectedMail.subject,
                            body: selectedMail.body,
                        },
                    ),
                ),
            );
            const ok = results.filter((r) => r.status === 'fulfilled').length;
            const failed = results.length - ok;
            setToastMessage({
                title: failed === 0 ? 'Reminders Sent' : `${ok} sent, ${failed} failed`,
                body: `${selected.length} item${selected.length > 1 ? 's' : ''} across ${byClar.size} vendor${byClar.size > 1 ? 's' : ''} updated.`,
            });
            setShowMailView(false);
            // Deselect everything so the toolbar collapses.
            setAllItems((prev) => prev.map((i) => ({ ...i, selected: false })));
            loadClarifications();
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3500);
        } catch (err) {
            console.error('Bulk reminder send failed:', err);
            setToastMessage({
                title: 'Bulk Send Failed',
                body: err instanceof Error ? err.message : 'Could not send reminders. Please try again.',
            });
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
        } finally {
            setSendingReminder(false);
        }
    };

    const handleBulkEmail = () => {
        const selected = allItems.filter(i => i.selected);
        if (selected.length === 0) return;

        // Pick the highest reminder count among the selection so the subject
        // reflects how aggressive this batch should look. Note: this modal
        // currently doesn't post to the reminder endpoint per row — the
        // per-row mail icon is the supported path. This is left as a UI
        // composer until we wire bulk reminders server-side.
        const maxReminder = Math.max(0, ...selected.map((i) => i.reminderCount ?? 0));
        const subject = maxReminder >= 2
            ? `URGENT: FINAL REMINDER - Documentation Overdue for ${imo}`
            : `Reminder: Documentation Required for POs on ${imo}`;

        const body = maxReminder >= 2
            ? `Dear Partners,\n\nThis is an URGENT FINAL REMINDER regarding ${selected.length} items on ${imo}. Outstanding MDs/SDoCs have NOT been received despite previous requests.\n\nItems:\n${selected.map(s => `- PO: ${s.poNumber}`).join('\n')}\n\nFailure to provide documentation within 24 hours will result in the supplier being marked as NON-RESPONSIVE in our system.\n\nBest Regards,\nIHM Audit Team`
            : `Dear Partners,\n\nWe are sending a follow-up reminder regarding ${selected.length} items on ${imo}. We have not yet received the requested MDs/SDoCs.\n\nItems:\n${selected.map(s => `- PO: ${s.poNumber}`).join('\n')}\n\nPlease update these records immediately.\n\nBest Regards,\nIHM Audit Team`;

        setSelectedMail({
            to: selected[0].vendorEmail || 'multiple-suppliers@example.com',
            subject,
            body,
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
                                                    {supplier.items.length === 0 && (
                                                        <tr>
                                                            <td colSpan={14} style={{ padding: '24px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '13px', fontStyle: 'italic' }}>
                                                                {supplier.id === 'placeholder'
                                                                    ? 'Upload a purchase order to see vendors and items here.'
                                                                    : 'No items yet for this supplier.'}
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {supplier.items.map(item => (
                                                        <tr key={item.id} className={item.selected ? 'row-is-selected' : ''}>
                                                            <td className="ch-col">
                                                                <div className={`po-v4-row-action-checkbox-styled ${item.selected ? 'checked' : ''}`} onClick={(e) => toggleItemSelection(item.id, e)}>
                                                                    {item.selected && <Check size={14} strokeWidth={3} className="check-icon-v4" />}
                                                                </div>
                                                            </td>
                                                            <td className="ac-col">
                                                                <div className="po-v4-row-action-btns-premium">
                                                                    <button
                                                                        type="button"
                                                                        className="po-v4-action-icon-btn-v4 view"
                                                                        title={item.reminderCount && item.reminderCount > 0
                                                                            ? `Send reminder ${(item.reminderCount ?? 0) + 1}`
                                                                            : 'Send reminder'}
                                                                        onClick={() => handleOpenReminder(item)}
                                                                        disabled={!item.clarificationId || item.mdsStatus === 'received'}
                                                                        style={{
                                                                            visibility: item.isSuspected && item.clarificationId ? 'visible' : 'hidden',
                                                                            opacity: item.mdsStatus === 'received' ? 0.4 : 1,
                                                                            cursor: item.mdsStatus === 'received' ? 'not-allowed' : 'pointer',
                                                                        }}
                                                                    >
                                                                        <Mail size={14} />
                                                                    </button>
                                                                    {item.isSuspected && item.clarificationId && item.mdsStatus === 'received' && !item.reviewedAt && (
                                                                        <button
                                                                            type="button"
                                                                            className="po-v4-action-icon-btn-v4"
                                                                            onClick={() => markItemReviewed(item)}
                                                                            title="Approve — mark this item reviewed"
                                                                            style={{ color: '#10B981', cursor: 'pointer' }}
                                                                        >
                                                                            <CheckCircle2 size={14} />
                                                                        </button>
                                                                    )}
                                                                    {item.reviewedAt && (
                                                                        <span
                                                                            title={item.reviewedBy ? `Reviewed by ${item.reviewedBy}` : 'Reviewed'}
                                                                            style={{
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                gap: 4,
                                                                                padding: '2px 8px',
                                                                                background: '#ECFDF5',
                                                                                color: '#065F46',
                                                                                border: '1px solid #A7F3D0',
                                                                                borderRadius: 999,
                                                                                fontSize: 10,
                                                                                fontWeight: 700,
                                                                                letterSpacing: '0.04em',
                                                                                textTransform: 'uppercase',
                                                                            }}
                                                                        >
                                                                            <CheckCircle2 size={12} />
                                                                            Reviewed
                                                                        </span>
                                                                    )}
                                                                    <button type="button" className="po-v4-action-icon-btn-v4 edit" title="Edit Item"><Edit2 size={14} /></button>
                                                                    <button type="button" className="po-v4-action-icon-btn-v4 delete" title="Delete Item"><Trash2 size={14} /></button>
                                                                </div>
                                                            </td>
                                                            <td className="doc-col">
                                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                                    {(['md', 'sdoc'] as const).map((kind) => {
                                                                        const filePath = kind === 'md' ? item.mdFilePath : item.sdocFilePath;
                                                                        const fileName = kind === 'md' ? item.mdFileName : item.sdocFileName;
                                                                        const label = kind.toUpperCase();
                                                                        // Admin is view-only. Suppliers upload via the public
                                                                        // link; here we just render a clickable pill when the
                                                                        // doc has arrived, or a greyed-out placeholder while
                                                                        // we're still waiting for the supplier.
                                                                        return filePath ? (
                                                                            <a
                                                                                key={kind}
                                                                                href={filePath}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="po-v4-action-icon-btn-v4 doc"
                                                                                title={`View ${label} — ${fileName || 'document'}`}
                                                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: '#10B981', fontSize: 10, fontWeight: 700 }}
                                                                            >
                                                                                <FileText size={14} />
                                                                                {label}
                                                                            </a>
                                                                        ) : (
                                                                            <span
                                                                                key={kind}
                                                                                className="po-v4-action-icon-btn-v4 doc"
                                                                                title={`Awaiting supplier ${label} upload`}
                                                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: '#CBD5E1', fontSize: 10, fontWeight: 700, cursor: 'not-allowed', opacity: 0.6 }}
                                                                            >
                                                                                <FileText size={14} />
                                                                                {label}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
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
                                <button
                                    className="gmail-send-btn"
                                    onClick={handleSendMail}
                                    disabled={sendingReminder}
                                    style={{ opacity: sendingReminder ? 0.6 : 1, cursor: sendingReminder ? 'wait' : 'pointer' }}
                                >
                                    <Send size={15} style={{ marginRight: 8 }} />
                                    {sendingReminder ? 'Sending…' : 'Send'}
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
                            <h3>{toastMessage.title}</h3>
                            <p>{toastMessage.body}</p>
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
