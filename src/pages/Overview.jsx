import React, { useEffect, useState } from 'react';
import { Building2, Armchair, IndianRupee, AlertTriangle, CalendarClock } from 'lucide-react';
import { call } from '../api';
import { Stat } from '../components';
import { card, th, td, inr, fmt, fmtDate } from '../ui';

export default function Overview({ go }) {
    const [d, setD] = useState(null);
    const [err, setErr] = useState(null);
    useEffect(() => { call('GET', '/overview').then(setD).catch((e) => setErr(e.message)); }, []);
    if (err) return <div style={{ color: '#f87171', fontSize: '13px' }}>{err}</div>;
    if (!d) return <div style={{ color: '#64748b', fontSize: '13px' }}>Loading…</div>;
    const open = (c) => <a key={c.company_id} href={`/companies/${c.company_id}`} onClick={(e) => { e.preventDefault(); go(`/companies/${c.company_id}`); }} style={{ color: '#c4b5fd', fontWeight: 800, textDecoration: 'none' }}>{c.name}</a>;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#f1f5f9' }}>Platform overview</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Companies that use the product, the seats they bought, and what they have paid.</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '14px' }}>
                <Stat icon={Building2} label="COMPANIES" value={d.companies.total} color="#a78bfa"
                    sub={`${d.companies.active} active · ${d.companies.suspended} suspended · ${d.companies.expired} expired`} />
                <Stat icon={Armchair} label="SEATS IN USE" value={`${d.seats.used} / ${d.seats.sold}`} color="#60a5fa" sub="across all companies" />
                <Stat icon={IndianRupee} label="REVENUE (30 DAYS)" value={inr(d.revenue.last_30_days)} color="#34d399" sub={`${inr(d.revenue.total)} all time · ${d.revenue.paid_count} payments`} />
                <Stat icon={CalendarClock} label="EXPIRING IN 30 DAYS" value={d.expiring_soon.length} color="#fb923c" sub="subscriptions to renew" />
                <Stat icon={AlertTriangle} label="NEAR SEAT LIMIT" value={d.near_seat_limit.length} color="#fbbf24" sub="90% or more in use" />
            </div>
            {(d.expiring_soon.length > 0 || d.near_seat_limit.length > 0) && (
                <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={card}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9', marginBottom: '10px' }}>Renewals due</div>
                        {d.expiring_soon.length === 0 ? <div style={{ fontSize: '13px', color: '#64748b' }}>None in the next 30 days.</div>
                            : d.expiring_soon.map((c) => <div key={c.company_id} style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>{open(c)}<span style={{ color: '#fb923c' }}>{fmtDate(c.plan_expires)}</span></div>)}
                    </div>
                    <div style={card}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9', marginBottom: '10px' }}>Likely to need more seats</div>
                        {d.near_seat_limit.length === 0 ? <div style={{ fontSize: '13px', color: '#64748b' }}>Nobody is close to their limit.</div>
                            : d.near_seat_limit.map((c) => <div key={c.company_id} style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>{open(c)}<span style={{ color: '#fbbf24' }}>{c.seats.used}/{c.seats.total}</span></div>)}
                    </div>
                </div>
            )}
            <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
                <div style={{ padding: '16px 20px 6px', fontSize: '14px', fontWeight: 800, color: '#f1f5f9' }}>Recent payments</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead><tr>{['WHEN', 'COMPANY', 'AMOUNT', 'BOUGHT', 'METHOD', 'REFERENCE'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>
                        {d.recent_payments.map((r) => (
                            <tr key={r.id}>
                                <td style={{ ...td, fontSize: '12px', color: '#64748b' }}>{fmt(r.ts)}</td>
                                <td style={{ ...td, fontWeight: 700 }}>{r.company_id}</td>
                                <td style={{ ...td, color: r.kind === 'refund' ? '#f87171' : '#34d399', fontWeight: 800 }}>{r.kind === 'refund' ? '−' : ''}{inr(r.amount)}</td>
                                <td style={{ ...td, fontSize: '12px' }}>{r.kind === 'refund' ? 'refund' : [r.seats_added ? `+${r.seats_added} seats` : '', r.months_added ? `+${r.months_added} mo` : ''].filter(Boolean).join(' · ')}</td>
                                <td style={td}>{r.method.replace('_', ' ')}</td>
                                <td style={{ ...td, color: '#94a3b8' }}>{r.reference || '—'}</td>
                            </tr>
                        ))}
                        {d.recent_payments.length === 0 && <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: '#64748b' }}>No payments recorded yet.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
