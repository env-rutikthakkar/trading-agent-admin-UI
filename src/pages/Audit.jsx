import React, { useEffect, useState, useCallback } from 'react';
import { call } from '../api';
import { card, input, th, td, fmt } from '../ui';

/** Audit trail: the whole platform, or one company when `companyId` is given. */
export default function Audit({ companyId = '' }) {
    const [rows, setRows] = useState({ total: 0, entries: [] });
    const [f, setF] = useState({ actor: '', action: '', q: '' });
    const [err, setErr] = useState(null);
    const load = useCallback(async () => {
        try {
            const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)), limit: '200', ...(companyId ? { company_id: companyId } : {}) });
            setRows(await call('GET', `/audit?${qs}`)); setErr(null);
        } catch (e) { setErr(e.message); }
    }, [f, companyId]);
    useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {!companyId && <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#f1f5f9' }}>Audit log</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Everything that happened on the platform, across all companies. Kept 7 years; entries cannot be edited or deleted.</div>
            </div>}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input style={{ ...input, width: '150px' }} placeholder="Actor" value={f.actor} onChange={(e) => setF({ ...f, actor: e.target.value })} />
                <input style={{ ...input, width: '170px' }} placeholder="Action (e.g. platform.)" value={f.action} onChange={(e) => setF({ ...f, action: e.target.value })} />
                <input style={{ ...input, width: '190px' }} placeholder="Search target / detail" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
                <span style={{ fontSize: '12px', color: '#64748b' }}>{rows.total} entries</span>
            </div>
            {err && <div style={{ color: '#f87171', fontSize: '13px' }}>{err}</div>}
            <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
                    <thead><tr>{['TIME', 'ACTOR', 'COMPANY', 'ACTION', 'TARGET', 'DETAIL'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>
                        {rows.entries.map((e, i) => (
                            <tr key={i}>
                                <td style={{ ...td, fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>{fmt(e.ts)}</td>
                                <td style={{ ...td, fontWeight: 700 }}>{e.actor}</td>
                                <td style={{ ...td, fontSize: '12px', color: '#94a3b8' }}>{e.company_id || '—'}</td>
                                <td style={{ ...td, color: e.ok ? '#e2e8f0' : '#f87171' }}>{e.action}</td>
                                <td style={td}>{e.target}</td>
                                <td style={{ ...td, fontSize: '12px', color: '#94a3b8' }}>{e.detail}</td>
                            </tr>
                        ))}
                        {rows.entries.length === 0 && <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: '#64748b' }}>No entries.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
