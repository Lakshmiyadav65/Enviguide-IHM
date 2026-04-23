// Public supplier upload portal. No login required — the URL token is the
// only credential. Suppliers enter their email once, then upload a PDF per
// suspected item. Uploads flip the corresponding item to 'Received MDS' in
// the internal app.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, FileText, Upload, AlertTriangle, Loader2 } from 'lucide-react';
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
    items: SupplierItem[];
}

export default function SupplierUpload() {
    const { token } = useParams<{ token: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SupplierPayload | null>(null);
    const [email, setEmail] = useState('');
    const [emailLocked, setEmailLocked] = useState(false);
    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
    const [rowError, setRowError] = useState<{ idx: number; msg: string } | null>(null);

    const loadData = () => {
        if (!token) return;
        setLoading(true);
        fetch(`${API_CONFIG.BASE_URL}/public/clarifications/${token}`)
            .then(async (r) => {
                if (!r.ok) throw new Error((await r.json()).error?.message || 'Link not found');
                return r.json();
            })
            .then((j) => {
                setData(j.data);
                setError(null);
            })
            .catch((e) => setError(e instanceof Error ? e.message : 'Something went wrong'))
            .finally(() => setLoading(false));
    };

    useEffect(loadData, [token]);

    const uploadFile = async (idx: number, file: File) => {
        if (!email || !email.includes('@')) {
            setRowError({ idx, msg: 'Please enter your email above first.' });
            return;
        }
        if (!token) return;
        setUploadingIdx(idx);
        setRowError(null);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('email', email);
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
    const allDone = totalReceived === data.items.length && data.items.length > 0;

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
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your email *</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => !emailLocked && setEmail(e.target.value)}
                        disabled={emailLocked}
                        placeholder="you@yourcompany.com"
                        style={{ width: '100%', padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, background: emailLocked ? '#F1F5F9' : 'white' }}
                    />
                    {emailLocked && (
                        <div style={{ marginTop: 6, fontSize: 12, color: '#64748B' }}>Email locked after first upload.</div>
                    )}
                </div>

                {allDone && (
                    <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <CheckCircle2 size={24} color="#10B981" />
                        <div>
                            <div style={{ fontWeight: 700, color: '#065F46' }}>All documents received</div>
                            <div style={{ fontSize: 13, color: '#047857' }}>Thank you — you can close this page.</div>
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
                                        <div style={{ marginTop: 6, fontSize: 12, color: '#059669' }}>
                                            Uploaded: {item.mdsFileName}
                                        </div>
                                    )}
                                    {rowError && rowError.idx === item.index && (
                                        <div style={{ marginTop: 6, fontSize: 12, color: '#DC2626' }}>{rowError.msg}</div>
                                    )}
                                </div>
                                <div>
                                    {received ? (
                                        <button disabled style={{ padding: '8px 14px', border: '1px solid #A7F3D0', background: '#ECFDF5', color: '#065F46', borderRadius: 8, fontWeight: 600, fontSize: 13 }}>
                                            Received
                                        </button>
                                    ) : (
                                        <label
                                            style={{
                                                padding: '8px 14px',
                                                border: '1px solid #00B0FA',
                                                background: isUploading ? '#BAE6FD' : '#F0F9FF',
                                                color: '#0369A1',
                                                borderRadius: 8,
                                                fontWeight: 600,
                                                fontSize: 13,
                                                cursor: isUploading ? 'wait' : 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 6,
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
                                                disabled={isUploading}
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
