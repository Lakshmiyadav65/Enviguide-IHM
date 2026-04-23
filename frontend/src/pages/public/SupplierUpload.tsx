// Public supplier upload portal. No login required — the URL token is the
// only credential. Suppliers enter their email once, then upload a PDF per
// suspected item. Uploads flip the corresponding item to 'Received MDS' in
// the internal app.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, FileText, Upload, AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { API_CONFIG } from '../../config/api.config';

interface SupplierItem {
    index: number;
    poNumber: string;
    itemDescription: string;
    equipmentName: string;
    quantity: string;
    mdsStatus: 'pending' | 'received' | string;
    mdsFileName: string | null;
    mdsFilePath: string | null;
    mdsReceivedAt: string | null;
}

interface SupplierPayload {
    vesselName: string | null;
    imoNumber: string;
    subject: string;
    sentAt: string;
    supplierCompany: string | null;
    supplierContactName: string | null;
    supplierComments: string | null;
    preparedDate: string | null;
    submittedAt: string | null;
    items: SupplierItem[];
}

export default function SupplierUpload() {
    const { token } = useParams<{ token: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SupplierPayload | null>(null);
    const [email, setEmail] = useState('');
    const [emailLocked, setEmailLocked] = useState(false);
    const [supplierCompany, setSupplierCompany] = useState('');
    const [supplierContactName, setSupplierContactName] = useState('');
    const [supplierComments, setSupplierComments] = useState('');
    const [preparedDate, setPreparedDate] = useState('');
    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
    const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
    const [rowError, setRowError] = useState<{ idx: number; msg: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const loadData = () => {
        if (!token) return;
        setLoading(true);
        fetch(`${API_CONFIG.BASE_URL}/public/clarifications/${token}`)
            .then(async (r) => {
                if (!r.ok) throw new Error((await r.json()).error?.message || 'Link not found');
                return r.json();
            })
            .then((j) => {
                const payload = j.data as SupplierPayload;
                setData(payload);
                setError(null);
                // Rehydrate any previously saved fields so the supplier doesn't
                // retype on reload.
                if (payload.supplierCompany) setSupplierCompany(payload.supplierCompany);
                if (payload.supplierContactName) setSupplierContactName(payload.supplierContactName);
                if (payload.supplierComments) setSupplierComments(payload.supplierComments);
                if (payload.preparedDate) setPreparedDate(payload.preparedDate);
                if (payload.submittedAt) setFormSubmitted(true);
            })
            .catch((e) => setError(e instanceof Error ? e.message : 'Something went wrong'))
            .finally(() => setLoading(false));
    };

    useEffect(loadData, [token]);

    // Upload is allowed only after identity (email) + required fields are set.
    const canUpload = Boolean(
        email && email.includes('@')
        && supplierCompany.trim()
        && supplierContactName.trim(),
    );

    const uploadFile = async (idx: number, file: File) => {
        if (!canUpload) {
            setRowError({ idx, msg: 'Fill in your email, company, and contact name above first.' });
            return;
        }
        if (!token) return;
        setUploadingIdx(idx);
        setRowError(null);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('email', email);
            fd.append('supplierCompany', supplierCompany);
            fd.append('supplierContactName', supplierContactName);
            if (supplierComments) fd.append('supplierComments', supplierComments);
            if (preparedDate) fd.append('preparedDate', preparedDate);
            const res = await fetch(
                `${API_CONFIG.BASE_URL}/public/clarifications/${token}/items/${idx}/document`,
                { method: 'POST', body: fd },
            );
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error?.message || `Upload failed (${res.status})`);
            }
            setEmailLocked(true);
            loadData();
        } catch (e) {
            setRowError({ idx, msg: e instanceof Error ? e.message : 'Upload failed' });
        } finally {
            setUploadingIdx(null);
        }
    };

    const deleteFile = async (idx: number) => {
        if (!token || !email) return;
        setDeletingIdx(idx);
        setRowError(null);
        try {
            const res = await fetch(
                `${API_CONFIG.BASE_URL}/public/clarifications/${token}/items/${idx}/document`,
                {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                },
            );
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error?.message || `Delete failed (${res.status})`);
            }
            loadData();
        } catch (e) {
            setRowError({ idx, msg: e instanceof Error ? e.message : 'Delete failed' });
        } finally {
            setDeletingIdx(null);
        }
    };

    const submitClarification = async () => {
        if (!token) return;
        if (!email || !email.includes('@')) {
            setSubmitError('Enter your email first.');
            return;
        }
        if (!supplierCompany.trim() || !supplierContactName.trim()) {
            setSubmitError('Supplier company and contact person are required.');
            return;
        }
        setSubmitting(true);
        setSubmitError(null);
        try {
            const res = await fetch(
                `${API_CONFIG.BASE_URL}/public/clarifications/${token}/submit`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        supplierCompany,
                        supplierContactName,
                        supplierComments,
                        preparedDate,
                    }),
                },
            );
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error?.message || `Submit failed (${res.status})`);
            }
            setFormSubmitted(true);
            loadData();
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : 'Submit failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Center>
                <Loader2 size={24} className="spin" />
                <p style={{ marginTop: 12, color: '#64748B' }}>Loading your document request…</p>
            </Center>
        );
    }

    if (error || !data) {
        return (
            <Center>
                <div style={{ background: '#FEF2F2', padding: 24, borderRadius: 12, maxWidth: 480, textAlign: 'center' }}>
                    <AlertTriangle size={32} color="#EF4444" />
                    <h2 style={{ margin: '12px 0 4px', color: '#991B1B' }}>Link not available</h2>
                    <p style={{ color: '#7F1D1D', fontSize: 14 }}>{error || 'This link has expired or is no longer valid.'}</p>
                </div>
            </Center>
        );
    }

    const totalReceived = data.items.filter((i) => i.mdsStatus === 'received').length;

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '32px 16px' }}>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
                <header style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#00B0FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>IHM</div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Document Upload</h1>
                            <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>EnviGuide IHM Platform</p>
                        </div>
                    </div>
                    <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: 13, color: '#64748B' }}>Vessel</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{data.vesselName || 'Unknown vessel'}{data.imoNumber ? ` · IMO ${data.imoNumber}` : ''}</div>
                        <div style={{ marginTop: 8, fontSize: 13, color: '#334155' }}>
                            Please upload the MD / SDoC document for each item below. Accepted: PDF, DOC, image files (max 25 MB each).
                        </div>
                    </div>
                </header>

                <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E2E8F0', marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                        <Field label="Your email *" hint={emailLocked ? 'Locked after first upload.' : 'Must match the address this link was sent to.'}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => !emailLocked && setEmail(e.target.value)}
                                disabled={emailLocked || formSubmitted}
                                placeholder="you@yourcompany.com"
                                style={inputStyle(emailLocked || formSubmitted)}
                            />
                        </Field>
                        <Field label="Supplier company *">
                            <input
                                type="text"
                                value={supplierCompany}
                                onChange={(e) => setSupplierCompany(e.target.value)}
                                disabled={formSubmitted}
                                placeholder="e.g. Henry Marine A/S"
                                style={inputStyle(formSubmitted)}
                            />
                        </Field>
                        <Field label="Contact person *">
                            <input
                                type="text"
                                value={supplierContactName}
                                onChange={(e) => setSupplierContactName(e.target.value)}
                                disabled={formSubmitted}
                                placeholder="Full name"
                                style={inputStyle(formSubmitted)}
                            />
                        </Field>
                        <Field label="Document prepared date (optional)">
                            <input
                                type="date"
                                value={preparedDate}
                                onChange={(e) => setPreparedDate(e.target.value)}
                                disabled={formSubmitted}
                                style={inputStyle(formSubmitted)}
                            />
                        </Field>
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <Field label="Comments (optional)">
                            <textarea
                                value={supplierComments}
                                onChange={(e) => setSupplierComments(e.target.value)}
                                disabled={formSubmitted}
                                placeholder="Any notes for the auditor..."
                                rows={3}
                                style={{ ...inputStyle(formSubmitted), resize: 'vertical', fontFamily: 'inherit' }}
                            />
                        </Field>
                    </div>
                    {!canUpload && !formSubmitted && (
                        <div style={{ marginTop: 12, padding: 10, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, fontSize: 12, color: '#92400E' }}>
                            Fill in your email, supplier company, and contact person above to enable uploads.
                        </div>
                    )}
                </div>

                {formSubmitted && (
                    <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <CheckCircle2 size={24} color="#10B981" />
                        <div>
                            <div style={{ fontWeight: 700, color: '#065F46' }}>Submission received</div>
                            <div style={{ fontSize: 13, color: '#047857' }}>Thanks — our audit team has your documents. You can close this page.</div>
                        </div>
                    </div>
                )}

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                        Items ({totalReceived} / {data.items.length} uploaded)
                    </div>
                    {data.items.map((item) => {
                        const received = item.mdsStatus === 'received';
                        const isUploading = uploadingIdx === item.index;
                        const isDeleting = deletingIdx === item.index;
                        return (
                            <div key={item.index} style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: received ? '#ECFDF5' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {received ? <CheckCircle2 size={18} color="#10B981" /> : <FileText size={16} color="#94A3B8" />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14 }}>{item.itemDescription || '(no description)'}</div>
                                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                                        PO {item.poNumber || '—'} · {item.equipmentName || 'Unspecified'} · Qty {item.quantity || '—'}
                                    </div>
                                    {received && item.mdsFileName && (
                                        <div style={{ marginTop: 6, fontSize: 12, color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span>Uploaded: {item.mdsFileName}</span>
                                        </div>
                                    )}
                                    {rowError && rowError.idx === item.index && (
                                        <div style={{ marginTop: 6, fontSize: 12, color: '#DC2626' }}>{rowError.msg}</div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {received ? (
                                        <>
                                            <button disabled style={{ padding: '8px 14px', border: '1px solid #A7F3D0', background: '#ECFDF5', color: '#065F46', borderRadius: 8, fontWeight: 600, fontSize: 13 }}>
                                                Received
                                            </button>
                                            {!formSubmitted && (
                                                <button
                                                    onClick={() => deleteFile(item.index)}
                                                    disabled={isDeleting}
                                                    title="Remove this file"
                                                    style={{ padding: 8, border: '1px solid #FECACA', background: '#FEF2F2', color: '#B91C1C', borderRadius: 8, cursor: isDeleting ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center' }}
                                                >
                                                    {isDeleting ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <label
                                            title={!canUpload ? 'Fill in your email, supplier company, and contact person first' : ''}
                                            style={{
                                                padding: '8px 14px',
                                                border: `1px solid ${canUpload ? '#00B0FA' : '#CBD5E1'}`,
                                                background: isUploading ? '#BAE6FD' : (canUpload ? '#F0F9FF' : '#F1F5F9'),
                                                color: canUpload ? '#0369A1' : '#94A3B8',
                                                borderRadius: 8,
                                                fontWeight: 600,
                                                fontSize: 13,
                                                cursor: !canUpload ? 'not-allowed' : (isUploading ? 'wait' : 'pointer'),
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                opacity: canUpload ? 1 : 0.7,
                                            }}
                                        >
                                            {isUploading ? (
                                                <><Loader2 size={14} className="spin" /> Uploading…</>
                                            ) : (
                                                <><Upload size={14} /> Upload</>
                                            )}
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                style={{ display: 'none' }}
                                                disabled={!canUpload || isUploading || formSubmitted}
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) uploadFile(item.index, f);
                                                    e.target.value = '';
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {!formSubmitted && (
                    <div style={{ marginTop: 16, background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
                            Done uploading? Click Submit to send everything to the auditor. You can always come back to re-upload if needed, as long as the link is valid.
                        </div>
                        {submitError && (
                            <div style={{ marginBottom: 10, padding: 10, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, color: '#991B1B' }}>
                                {submitError}
                            </div>
                        )}
                        <button
                            onClick={submitClarification}
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                background: submitting ? '#64748B' : '#0F172A',
                                color: 'white',
                                border: 'none',
                                borderRadius: 10,
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: submitting ? 'wait' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                            }}
                        >
                            {submitting ? <><Loader2 size={16} className="spin" /> Submitting…</> : 'Submit'}
                        </button>
                    </div>
                )}

                <footer style={{ marginTop: 24, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
                    Powered by EnviGuide IHM · This upload link is unique to your company and will expire 72 hours after it was sent.
                </footer>
            </div>

            <style>{`.spin { animation: spin 0.8s linear infinite } @keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );
}

function Center({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 16 }}>
            {children}
        </div>
    );
}

function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
            {children}
            {hint && <div style={{ marginTop: 4, fontSize: 11, color: '#94A3B8' }}>{hint}</div>}
        </div>
    );
}

function inputStyle(disabled: boolean): React.CSSProperties {
    return {
        width: '100%',
        padding: '12px 14px',
        border: '1px solid #E2E8F0',
        borderRadius: 8,
        fontSize: 14,
        background: disabled ? '#F1F5F9' : 'white',
        color: disabled ? '#64748B' : '#0F172A',
    };
}
