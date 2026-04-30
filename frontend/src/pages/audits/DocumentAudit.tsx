// Document Audit page
// -----------------------------------------------------------------------------
// Opens when the manager clicks REVIEW on the MD SDoC Audit Pending registry.
// Lists every clarification item for the IMO with its uploaded MD / SDoC, and
// gives two per-row actions:
//   - Accept              → POST /clarifications/:clarId/items/:idx/review
//                            (flips the item into Reviewed Mds in the PO viewer)
//   - Request Clarification → opens the mail composer; Send fires a reminder
//                              (POST /clarifications/:clarId/items/:idx/remind)
//
// No mock data — everything is fetched from the audit's clarifications.

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import './DocumentAudit.css';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import {
    Search,
    ShoppingCart,
    FileText,
    MessageSquare,
    CheckCircle2,
    FileSpreadsheet,
    X,
    Mail,
    Send,
    Loader2,
    Download,
} from 'lucide-react';
import { api } from '../../lib/apiClient';
import { ENDPOINTS, API_CONFIG } from '../../config/api.config';

interface ClarificationItemRow {
    clarification_id: string;
    item_index: number;
    mds_status: string | null;
    mds_file_path: string | null;
    mds_file_name: string | null;
    mds_received_at: string | null;
    sdoc_status: string | null;
    sdoc_file_path: string | null;
    sdoc_file_name: string | null;
    sdoc_received_at: string | null;
    reminder_count: number | null;
    reviewed_at: string | null;
    reviewed_by: string | null;
}

interface ClarificationRow {
    id: string;
    imo_number: string;
    vessel_name: string | null;
    recipient_emails: string;
    cc_emails: string | null;
    subject: string;
    suspected_items: unknown;
    created_at: string;
    items: ClarificationItemRow[];
}

interface FlatItem {
    key: string;
    clarificationId: string;
    itemIndex: number;
    poNumber: string;
    itemDescription: string;
    supplierEmails: string;
    vendorEmail: string;
    vendorName: string;
    mdFilePath: string | null;
    mdFileName: string | null;
    sdocFilePath: string | null;
    sdocFileName: string | null;
    dateReceived: string;
    reviewedAt: string | null;
    reviewedBy: string | null;
    /** 'reviewed' wins over 'received' wins over 'pending'. */
    status: 'pending' | 'received' | 'reviewed';
    /** Original subject — used to prefill the clarification mail. */
    clarificationSubject: string;
}

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return iso.split('T')[0] ?? iso;
    }
}

export default function DocumentAudit() {
    const { imo } = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [clarifications, setClarifications] = useState<ClarificationRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [acceptingKey, setAcceptingKey] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastData, setToastData] = useState({ title: '', message: '', tone: 'success' as 'success' | 'error' });

    // Clarification mail modal state
    const [mailItem, setMailItem] = useState<FlatItem | null>(null);
    const [mailTo, setMailTo] = useState('');
    const [mailSubject, setMailSubject] = useState('');
    const [mailBody, setMailBody] = useState('');
    const [sendingMail, setSendingMail] = useState(false);

    // Document preview modal state — clicking View on an MD or SDoC link
    // opens the file inside an iframe with Download + Approve actions
    // instead of triggering a browser download via Content-Disposition.
    const [viewingDoc, setViewingDoc] = useState<{
        item: FlatItem;
        kind: 'md' | 'sdoc';
        /** URL that previews inline in the iframe (proxy with C-D: inline). */
        url: string;
        /** Raw bucket URL — used for the Download button so the browser
         *  honours the original attachment disposition and saves the file. */
        rawUrl: string;
        fileName: string;
    } | null>(null);
    const [openingPreview, setOpeningPreview] = useState<string | null>(null);

    /** Open the inline preview modal. Hits the backend's preview-url
     *  endpoint to get a short-lived URL pointing at our own /preview-stream
     *  proxy — the proxy re-emits the file with Content-Disposition: inline
     *  so the iframe renders it instead of triggering a download. The
     *  endpoint returns a path relative to the API base, so we prefix
     *  API_CONFIG.BASE_URL before assigning it to the iframe src. */
    const openDocPreview = async (item: FlatItem, kind: 'md' | 'sdoc') => {
        const rawUrl = kind === 'md' ? item.mdFilePath : item.sdocFilePath;
        const rawName = kind === 'md' ? item.mdFileName : item.sdocFileName;
        if (!rawUrl) return;
        const slot = `${item.key}-${kind}`;
        setOpeningPreview(slot);
        try {
            const res = await api.get<{ success: boolean; data: { url: string; fileName: string } }>(
                ENDPOINTS.AUDITS.CLARIFICATION_ITEM_DOC_PREVIEW(item.clarificationId, item.itemIndex, kind),
            );
            const previewPath = res.data?.url;
            const absoluteUrl = previewPath
                ? (previewPath.startsWith('http') ? previewPath : `${API_CONFIG.BASE_URL}${previewPath}`)
                : rawUrl;
            setViewingDoc({
                item, kind,
                url: absoluteUrl,
                rawUrl,
                fileName: res.data?.fileName ?? rawName ?? 'document',
            });
        } catch (err) {
            console.error('Preview URL fetch failed, falling back to raw URL:', err);
            setViewingDoc({
                item, kind,
                url: rawUrl,
                rawUrl,
                fileName: rawName ?? 'document',
            });
        } finally {
            setOpeningPreview(null);
        }
    };

    /** Force-download a remote file using its real (original) filename.
     *  We can't just use <a href={url} download={name}> because the
     *  HTML5 `download` attribute is silently ignored on cross-origin
     *  URLs (browser falls back to the URL's last path segment, which
     *  for our storage layout is the random hash key). Fetching first
     *  and creating a blob URL sidesteps that — the blob is same-origin
     *  so `download` is respected. */
    const downloadAs = async (url: string, fileName: string) => {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Download failed (${res.status})`);
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Free the blob after the click has been processed.
            setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        } catch (err) {
            console.error('Download failed:', err);
            // Last-resort fallback: open the raw URL so the user at
            // least gets the file (with the wrong filename).
            window.open(url, '_blank', 'noopener');
        }
    };

    const loadClarifications = useCallback(() => {
        if (!imo) return;
        setLoading(true);
        api.get<{ success: boolean; data: ClarificationRow[] }>(ENDPOINTS.AUDITS.CLARIFICATIONS(imo))
            .then((res) => {
                setClarifications(res.data || []);
                setError(null);
            })
            .catch((err) => {
                setClarifications([]);
                setError(err instanceof Error ? err.message : 'Failed to load clarifications');
            })
            .finally(() => setLoading(false));
    }, [imo]);

    useEffect(loadClarifications, [loadClarifications]);

    useEffect(() => {
        if (!showToast) return;
        const t = setTimeout(() => setShowToast(false), 4000);
        return () => clearTimeout(t);
    }, [showToast]);

    const vesselName = clarifications[0]?.vessel_name ?? `Vessel ${imo ?? ''}`;

    /** Flatten clarifications into one row per (clarification_id, item_index). */
    const flatItems: FlatItem[] = useMemo(() => {
        const out: FlatItem[] = [];
        for (const c of clarifications) {
            const suspected = Array.isArray(c.suspected_items)
                ? (c.suspected_items as unknown[][])
                : [];
            for (const it of c.items) {
                const row = Array.isArray(suspected[it.item_index]) ? suspected[it.item_index] as unknown[] : [];
                const poNumber = String(row[2] ?? '');
                const itemDescription = String(row[6] ?? '');
                const vendorEmail = String(row[18] ?? '');
                const vendorName = String(row[19] ?? '');

                const status: FlatItem['status'] = it.reviewed_at
                    ? 'reviewed'
                    : (it.mds_status === 'received' && it.sdoc_status === 'received')
                        ? 'received'
                        : 'pending';

                out.push({
                    key: `${it.clarification_id}-${it.item_index}`,
                    clarificationId: it.clarification_id,
                    itemIndex: it.item_index,
                    poNumber,
                    itemDescription,
                    supplierEmails: c.recipient_emails || '',
                    vendorEmail,
                    vendorName,
                    mdFilePath: it.mds_file_path,
                    mdFileName: it.mds_file_name,
                    sdocFilePath: it.sdoc_file_path,
                    sdocFileName: it.sdoc_file_name,
                    dateReceived: formatDate(it.mds_received_at || it.sdoc_received_at),
                    reviewedAt: it.reviewed_at,
                    reviewedBy: it.reviewed_by,
                    status,
                    clarificationSubject: c.subject || '',
                });
            }
        }
        return out;
    }, [clarifications]);

    const filteredItems = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return flatItems;
        return flatItems.filter((i) =>
            i.poNumber.toLowerCase().includes(q)
            || i.itemDescription.toLowerCase().includes(q)
            || i.supplierEmails.toLowerCase().includes(q)
            || i.vendorName.toLowerCase().includes(q),
        );
    }, [flatItems, searchQuery]);

    const stats = useMemo(() => {
        let pending = 0, received = 0, reviewed = 0;
        for (const i of flatItems) {
            if (i.status === 'reviewed') reviewed++;
            else if (i.status === 'received') received++;
            else pending++;
        }
        return { total: flatItems.length, pending, received, reviewed };
    }, [flatItems]);

    const handleAccept = async (item: FlatItem) => {
        if (item.status === 'reviewed' || item.status === 'pending') return;
        setAcceptingKey(item.key);
        try {
            await api.post(
                ENDPOINTS.AUDITS.CLARIFICATION_ITEM_REVIEW(item.clarificationId, item.itemIndex),
                {},
            );
            setToastData({
                title: 'Item Accepted',
                message: `${item.poNumber} marked as reviewed. It now appears in Reviewed Mds.`,
                tone: 'success',
            });
            setShowToast(true);
            loadClarifications();
        } catch (err) {
            setToastData({
                title: 'Accept Failed',
                message: err instanceof Error ? err.message : 'Could not mark this item reviewed.',
                tone: 'error',
            });
            setShowToast(true);
        } finally {
            setAcceptingKey(null);
        }
    };

    const openClarificationMail = (item: FlatItem) => {
        const reminderNumber = 1;
        setMailItem(item);
        setMailTo(item.vendorEmail || (item.supplierEmails.split(/[,;]/)[0] || '').trim());
        setMailSubject(`Clarification needed: ${item.clarificationSubject || `PO ${item.poNumber}`}`);
        setMailBody(
`Dear ${item.vendorName || 'Supplier'},

We have reviewed your submission for PO ${item.poNumber} (${item.itemDescription}) and need additional clarification on the uploaded MD / SDoC documents.

Please review the documents and re-submit corrected versions via the secure link from our previous email at your earliest convenience.

This is reminder ${reminderNumber}.

Best regards,
IHM Audit Team`,
        );
    };

    const sendClarificationMail = async () => {
        if (!mailItem) return;
        if (!mailTo.trim()) {
            setToastData({ title: 'Missing recipient', message: 'Please add a recipient email.', tone: 'error' });
            setShowToast(true);
            return;
        }
        setSendingMail(true);
        try {
            await api.post(
                ENDPOINTS.AUDITS.CLARIFICATION_ITEM_REMIND(mailItem.clarificationId, mailItem.itemIndex),
                { to: mailTo, subject: mailSubject, body: mailBody },
            );
            setToastData({
                title: 'Clarification Sent',
                message: `Mail dispatched to ${mailTo}.`,
                tone: 'success',
            });
            setShowToast(true);
            setMailItem(null);
            loadClarifications();
        } catch (err) {
            setToastData({
                title: 'Send Failed',
                message: err instanceof Error ? err.message : 'Could not send the clarification mail.',
                tone: 'error',
            });
            setShowToast(true);
        } finally {
            setSendingMail(false);
        }
    };

    return (
        <div className="doc-audit-container">
            <Sidebar />
            <main className="doc-audit-main">
                <Header />

                {showToast && (
                    <div className="audit-success-toast">
                        <div className="toast-content-wrapper">
                            <div className="toast-icon-green" style={{ background: toastData.tone === 'error' ? '#EF4444' : '#10B981' }}>
                                <CheckCircle2 size={24} fill={toastData.tone === 'error' ? '#EF4444' : '#10B981'} color="white" />
                            </div>
                            <div className="toast-text-area">
                                <h3>{toastData.title}</h3>
                                <p>{toastData.message}</p>
                            </div>
                        </div>
                        <button className="undo-action-btn" onClick={() => setShowToast(false)}>CLOSE</button>
                    </div>
                )}

                <div className="doc-audit-content">
                    <div className="audit-sub-header">
                        <div className="audit-header-main">
                            <div className="header-title-section" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div>
                                    <h1>Document Audit{vesselName ? ` - ${vesselName}` : ''}</h1>
                                    <div className="imo-badge">IMO: <span>{imo || '—'}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="audit-scroll-area">
                        <div className="metrics-grid">
                            <div className="metric-card">
                                <div className="metric-info">
                                    <span className="metric-label">TOTAL ITEMS</span>
                                    <span className="metric-number">{stats.total}</span>
                                </div>
                                <div className="metric-icon-box cart"><ShoppingCart size={20} /></div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-info">
                                    <span className="metric-label">PENDING</span>
                                    <span className="metric-number">{stats.pending}</span>
                                </div>
                                <div className="metric-icon-box doc"><FileText size={20} /></div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-info">
                                    <span className="metric-label">RECEIVED</span>
                                    <span className="metric-number">{stats.received}</span>
                                </div>
                                <div className="metric-icon-box sdoc"><FileSpreadsheet size={20} /></div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-info">
                                    <span className="metric-label">REVIEWED</span>
                                    <span className="metric-number highlight">{stats.reviewed}</span>
                                </div>
                                <div className="metric-icon-box msg"><CheckCircle2 size={20} /></div>
                            </div>
                        </div>

                        <div className="audit-table-card">
                            <div className="card-header">
                                <h2>Audit Queue</h2>
                                <div className="search-wrapper">
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search PO numbers, items, or suppliers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="table-container">
                                <table className="audit-table">
                                    <thead>
                                        <tr>
                                            <th>PO ID</th>
                                            <th>ITEM</th>
                                            <th>SUPPLIER</th>
                                            <th>MD</th>
                                            <th>SDOC</th>
                                            <th>RECEIVED</th>
                                            <th>STATUS</th>
                                            <th style={{ textAlign: 'center' }}>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading && (
                                            <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                                                <Loader2 size={20} className="spin" style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                                Loading clarifications…
                                            </td></tr>
                                        )}
                                        {!loading && error && (
                                            <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#DC2626' }}>{error}</td></tr>
                                        )}
                                        {!loading && !error && filteredItems.length === 0 && (
                                            <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                                                No clarification items yet. Send a clarification email from the Pending Reviews step to populate this queue.
                                            </td></tr>
                                        )}
                                        {!loading && filteredItems.map((item) => (
                                            <tr key={item.key}>
                                                <td className="po-ident">{item.poNumber || '—'}</td>
                                                <td className="supplier-name" style={{ maxWidth: 280 }}>{item.itemDescription || '—'}</td>
                                                <td className="supplier-name">{item.vendorName || item.supplierEmails || '—'}</td>
                                                <td>
                                                    {item.mdFilePath ? (
                                                        <button
                                                            type="button"
                                                            className="file-link-v3"
                                                            title={`View MD — ${item.mdFileName || 'document'}`}
                                                            onClick={() => openDocPreview(item, 'md')}
                                                            disabled={openingPreview === `${item.key}-md`}
                                                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'inherit', opacity: openingPreview === `${item.key}-md` ? 0.6 : 1 }}
                                                        >
                                                            {openingPreview === `${item.key}-md` ? (
                                                                <><Loader2 size={16} className="spin" /> Opening…</>
                                                            ) : (
                                                                <><FileText size={16} className="pdf-icon-v3" /> View</>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className="not-available">—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {item.sdocFilePath ? (
                                                        <button
                                                            type="button"
                                                            className="file-link-v3"
                                                            title={`View SDoC — ${item.sdocFileName || 'document'}`}
                                                            onClick={() => openDocPreview(item, 'sdoc')}
                                                            disabled={openingPreview === `${item.key}-sdoc`}
                                                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'inherit', opacity: openingPreview === `${item.key}-sdoc` ? 0.6 : 1 }}
                                                        >
                                                            {openingPreview === `${item.key}-sdoc` ? (
                                                                <><Loader2 size={16} className="spin" /> Opening…</>
                                                            ) : (
                                                                <><FileText size={16} className="pdf-icon-v3" /> View</>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className="not-available">—</span>
                                                    )}
                                                </td>
                                                <td style={{ whiteSpace: 'nowrap' }}>{item.dateReceived}</td>
                                                <td>
                                                    <span className={`status-pill-v3 ${item.status === 'reviewed' ? 'resolved' : item.status === 'received' ? 'awaiting-clarification' : 'not-started'}`}>
                                                        {item.status === 'reviewed' ? 'REVIEWED' : item.status === 'received' ? 'RECEIVED' : 'PENDING'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="da-action-cell">
                                                        {item.status === 'reviewed' ? (
                                                            <span
                                                                className="da-reviewed-badge"
                                                                title={item.reviewedBy ? `Reviewed by ${item.reviewedBy}` : 'Reviewed'}
                                                            >
                                                                <CheckCircle2 size={12} /> Reviewed
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="da-accept-btn"
                                                                onClick={() => handleAccept(item)}
                                                                disabled={item.status !== 'received' || acceptingKey === item.key}
                                                                title={item.status !== 'received' ? 'Both MD and SDoC must be uploaded before this can be accepted.' : 'Accept — mark this item reviewed'}
                                                                style={{ opacity: acceptingKey === item.key ? 0.7 : 1 }}
                                                            >
                                                                {acceptingKey === item.key ? (
                                                                    <><Loader2 size={12} className="spin" /> Accepting…</>
                                                                ) : (
                                                                    <><CheckCircle2 size={12} /> Accept</>
                                                                )}
                                                            </button>
                                                        )}
                                                        {/* Once an item is reviewed, the audit decision is locked
                                                            in — no follow-up clarification needed. Hide the button. */}
                                                        {item.status !== 'reviewed' && (
                                                            <button
                                                                type="button"
                                                                className="da-clarify-btn"
                                                                onClick={() => openClarificationMail(item)}
                                                                title="Request clarification — send a follow-up email to the supplier"
                                                            >
                                                                <MessageSquare size={12} /> Request Clarification
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Document preview modal — embeds the MD/SDoC inline so the
                    auditor can review without triggering a download. Footer
                    has Download (always) and Approve (only when both docs
                    have arrived for this item, mirroring the row-level
                    Accept rule). */}
                {viewingDoc && (
                    <div className="doc-modal-overlay" onClick={() => setViewingDoc(null)}>
                        <div className="doc-modal-container" onClick={(e) => e.stopPropagation()}>
                            <div className="doc-modal-header">
                                <div className="header-doc-info">
                                    <div className="pdf-icon-box">
                                        <FileText size={20} color="#EF4444" />
                                    </div>
                                    <div className="doc-meta">
                                        <h3>{viewingDoc.fileName}</h3>
                                        <p>
                                            {viewingDoc.kind === 'md' ? 'Material Declaration (MD)' : 'Supplier Declaration of Conformity (SDoC)'}
                                            {' · PO '}{viewingDoc.item.poNumber}
                                        </p>
                                    </div>
                                </div>
                                <button className="close-modal-btn" onClick={() => setViewingDoc(null)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="doc-modal-body" style={{ padding: 0, height: '70vh', overflow: 'hidden' }}>
                                <iframe
                                    src={viewingDoc.url}
                                    title={viewingDoc.fileName}
                                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                                />
                            </div>

                            <div className="doc-modal-footer">
                                <div className="footer-left">
                                    <button
                                        type="button"
                                        className="btn-accept"
                                        disabled={viewingDoc.item.status !== 'received' || acceptingKey === viewingDoc.item.key}
                                        title={
                                            viewingDoc.item.status === 'reviewed' ? 'Already reviewed.'
                                                : viewingDoc.item.status !== 'received'
                                                    ? 'Both MD and SDoC must be uploaded before this item can be approved.'
                                                    : 'Approve — mark this item reviewed'
                                        }
                                        onClick={async () => {
                                            const item = viewingDoc.item;
                                            await handleAccept(item);
                                            setViewingDoc(null);
                                        }}
                                        style={{
                                            opacity: viewingDoc.item.status !== 'received' || acceptingKey === viewingDoc.item.key ? 0.6 : 1,
                                            cursor: viewingDoc.item.status !== 'received' ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {acceptingKey === viewingDoc.item.key ? (
                                            <><Loader2 size={18} className="spin" /> Approving…</>
                                        ) : (
                                            <><CheckCircle2 size={18} /> Approve</>
                                        )}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => downloadAs(viewingDoc.rawUrl, viewingDoc.fileName)}
                                    className="btn-download"
                                >
                                    <Download size={18} />
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Clarification mail modal */}
                {mailItem && (
                    <div className="doc-modal-overlay">
                        <div className="clarification-modal-container">
                            <div className="doc-modal-header">
                                <div className="header-doc-info">
                                    <div className="mail-icon-box">
                                        <Mail size={20} color="#00A3FF" />
                                    </div>
                                    <div className="doc-meta">
                                        <h3>Request Clarification</h3>
                                        <p>Re-send a clarification email for {mailItem.poNumber}</p>
                                    </div>
                                </div>
                                <button className="close-modal-btn" onClick={() => setMailItem(null)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="clarification-body">
                                <div className="mail-field">
                                    <span className="field-label">TO</span>
                                    <input
                                        type="text"
                                        value={mailTo}
                                        onChange={(e) => setMailTo(e.target.value)}
                                        className="mail-input-premium"
                                        placeholder="supplier@example.com"
                                    />
                                </div>
                                <div className="mail-field">
                                    <span className="field-label">SUBJECT</span>
                                    <input
                                        type="text"
                                        value={mailSubject}
                                        onChange={(e) => setMailSubject(e.target.value)}
                                        className="mail-input-premium subject"
                                    />
                                </div>
                                <div className="mail-editor-area">
                                    <textarea
                                        value={mailBody}
                                        onChange={(e) => setMailBody(e.target.value)}
                                        className="mail-textarea-premium"
                                        placeholder="Type your clarification request here..."
                                    />
                                </div>
                            </div>

                            <div className="doc-modal-footer">
                                <div className="footer-left">
                                    <button
                                        className="btn-send-request"
                                        onClick={sendClarificationMail}
                                        disabled={sendingMail}
                                        style={{ opacity: sendingMail ? 0.7 : 1, cursor: sendingMail ? 'wait' : 'pointer' }}
                                    >
                                        {sendingMail ? (
                                            <><Loader2 size={18} className="spin" /> Sending…</>
                                        ) : (
                                            <><Send size={18} /> Send Request</>
                                        )}
                                    </button>
                                    <button className="btn-discard" onClick={() => setMailItem(null)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <style>{`.spin { animation: doc-audit-spin 0.8s linear infinite } @keyframes doc-audit-spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );
}
