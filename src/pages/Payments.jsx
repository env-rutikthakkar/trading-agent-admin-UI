import React, { useEffect, useState } from 'react';
import { call } from '../api';
import { card, th, td, inr, fmt } from '../ui';

export function PaymentsTable({ rows, showCompany, go }) {
    return (
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
                <thead><tr>{['WHEN', ...(showCompany ? ['COMPANY'] : []), 'AMOUNT', 'BOUGHT', 'METHOD', 'REFERENCE', 'BY'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.id}>
                            <td style={{ ...td, fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>{fmt(r.ts)}</td>
                            {showCompany && <td style={{ ...td, fontWeight: 700, cursor: 'pointer', color: '#c4b5fd' }} onClick={() => go(`/companies/${r.company_id}`)}>{r.company_name || r.company_id}</td>}
                            <td style={{ ...td, color: r.kind === 'refund' ? '#f87171' : '#34d399', fontWeight: 800 }}>{r.kind === 'refund' ? '−' : ''}{inr(r.amount)}</td>
                            <td style={{ ...td, fontSize: '12px' }}>{r.kind === 'refund' ? 'refund' : [r.seats_added ? `+${r.seats_added} seats` : '', r.months_added ? `+${r.months_added} mo` : ''].filter(Boolean).join(' · ')}</td>
                            <td style={td}>{r.method.replace('_', ' ')}</td>
                            <td style={{ ...td, color: '#94a3b8' }}>{r.reference || '—'}{r.note ? <div style={{ fontSize: '11px', color: '#64748b' }}>{r.note}</div> : null}</td>
                            <td style={{ ...td, fontSize: '12px', color: '#64748b' }}>{r.recorded_by}</td>
                        </tr>
                    ))}
                    {rows.length === 0 && <tr><td colSpan={showCompany ? 7 : 6} style={{ ...td, textAlign: 'center', color: '#64748b' }}>No payments recorded yet.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

export default function Payments({ go }) {
    const [d, setD] = useState(null);
    const [err, setErr] = useState(null);
    useEffect(() => { call('GET', '/payments').then(setD).catch((e) => setErr(e.message)); }, []);
    if (err) return <div style={{ color: '#f87171', fontSize: '13px' }}>{err}</div>;
    if (!d) return <div style={{ color: '#64748b', fontSize: '13px' }}>Loading…</div>;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#f1f5f9' }}>Payments</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    {inr(d.revenue.total)} net of refunds · {inr(d.revenue.last_30_days)} in the last 30 days. Payments are recorded from a company's page, where they add the seats and time they bought.
                </div>
            </div>
            <PaymentsTable rows={d.payments} showCompany go={go} />
        </div>
    );
}
