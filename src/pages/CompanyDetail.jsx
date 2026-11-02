import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Plus, Save, Ban, PlayCircle, Mail, Armchair, IndianRupee, Undo2 } from 'lucide-react';
import { call } from '../api';
import { Notice, Field, FeaturePicker, InviteBox } from '../components';
import { PaymentsTable } from './Payments';
import Audit from './Audit';
import { card, input, btn, ghost, th, td, inr, fmt, fmtDate, statusColor, statusText, inviteLink } from '../ui';

const TABS = [['billing', 'Seats & payments'], ['owners', 'Owners'], ['settings', 'Settings'], ['audit', 'Audit']];

// <input type="date"> value -> end of that day (UTC), as the API expects.
const endOfDay = (d) => `${d}T23:59:59+00:00`;

function BillingTab({ id, d, act }) {
    const [pay, setPay] = useState({ amount: '', method: 'upi', seats_added: 10, months: 0, reference: '', note: '' });
    const [adj, setAdj] = useState({ delta: '', note: '' });
    const [refund, setRefund] = useState({ amount: '', reference: '', note: '' });
    const [methods, setMethods] = useState([]);
    useEffect(() => { call('GET', '/meta').then((m) => setMethods(m.methods)); }, []);
    const c = d.company;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <form style={card} onSubmit={async (e) => {
                e.preventDefault();
                if (await act(() => call('POST', `/companies/${id}/payments`, { ...pay, amount: Number(pay.amount), seats_added: Number(pay.seats_added) || 0, months: Number(pay.months) || 0 }),
                    `Payment recorded: ${inr(pay.amount)}`)) setPay({ ...pay, amount: '', reference: '', note: '' });
            }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>Record a payment</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>Money received outside the app. The seats and months below are added to the company straight away.</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                    <Field name="AMOUNT (₹)"><input style={input} type="number" min={0} step="0.01" required value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /></Field>
                    <Field name="METHOD"><select style={input} value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>{methods.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}</select></Field>
                    <Field name="EXTRA SEATS" hint="Seats this payment buys."><input style={input} type="number" min={0} value={pay.seats_added} onChange={(e) => setPay({ ...pay, seats_added: e.target.value })} /></Field>
                    <Field name="EXTEND (MONTHS)" hint="0 = leave the end date."><input style={input} type="number" min={0} max={60} value={pay.months} onChange={(e) => setPay({ ...pay, months: e.target.value })} /></Field>
                    <Field name="REFERENCE"><input style={input} placeholder="UTR / cheque no." value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} /></Field>
                    <Field name="NOTE"><input style={input} value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} /></Field>
                </div>
                <button type="submit" style={{ ...btn('#047857'), marginTop: '14px' }}><IndianRupee size={14} /> Record payment</button>
            </form>

            <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <form style={card} onSubmit={async (e) => {
                    e.preventDefault();
                    if (await act(() => call('POST', `/companies/${id}/seats`, { delta: Number(adj.delta), note: adj.note }), `Seats changed by ${adj.delta}`)) setAdj({ delta: '', note: '' });
                }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>Adjust seats without a payment</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Goodwill seats, or taking back a mistake. Use a negative number to remove. Cannot go below the {c.seats.used} in use.</div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input style={{ ...input, width: '100px' }} type="number" required placeholder="+5 / -2" value={adj.delta} onChange={(e) => setAdj({ ...adj, delta: e.target.value })} />
                        <input style={{ ...input, flex: 1, minWidth: '140px' }} placeholder="Why" required value={adj.note} onChange={(e) => setAdj({ ...adj, note: e.target.value })} />
                        <button type="submit" style={btn()}><Armchair size={14} /> Apply</button>
                    </div>
                </form>
                <form style={card} onSubmit={async (e) => {
                    e.preventDefault();
                    if (!window.confirm(`Record a refund of ${inr(refund.amount)}? Seats and subscription are not changed.`)) return;
                    if (await act(() => call('POST', `/companies/${id}/refund`, { ...refund, amount: Number(refund.amount) }), 'Refund recorded')) setRefund({ amount: '', reference: '', note: '' });
                }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>Record a refund</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Money returned. Records are never edited — a mistake is corrected with a refund entry. Adjust seats separately if needed.</div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input style={{ ...input, width: '110px' }} type="number" min={1} step="0.01" required placeholder="₹ amount" value={refund.amount} onChange={(e) => setRefund({ ...refund, amount: e.target.value })} />
                        <input style={{ ...input, flex: 1, minWidth: '140px' }} placeholder="Reference / reason" value={refund.reference} onChange={(e) => setRefund({ ...refund, reference: e.target.value })} />
                        <button type="submit" style={btn('#7f1d1d')}><Undo2 size={14} /> Refund</button>
                    </div>
                </form>
            </div>

            <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>Payments · {inr(d.revenue.total)} net</div>
                <PaymentsTable rows={d.payments} />
            </div>
            <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
                <div style={{ padding: '16px 20px 6px', fontSize: '14px', fontWeight: 800, color: '#f1f5f9' }}>Seat history</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                    <thead><tr>{['WHEN', 'CHANGE', 'TYPE', 'NOTE', 'BY'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>
                        {d.seat_history.map((h) => (
                            <tr key={h.id}>
                                <td style={{ ...td, fontSize: '12px', color: '#64748b' }}>{fmt(h.ts)}</td>
                                <td style={{ ...td, fontWeight: 800, color: h.delta > 0 ? '#34d399' : '#f87171' }}>{h.delta > 0 ? '+' : ''}{h.delta}</td>
                                <td style={td}>{h.kind}</td>
                                <td style={{ ...td, color: '#94a3b8' }}>{h.note || '—'}</td>
                                <td style={{ ...td, fontSize: '12px', color: '#64748b' }}>{h.recorded_by}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function OwnersTab({ id, d, act, appBase }) {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [invite, setInvite] = useState(null);
    const show = (res) => res?.invite_token && setInvite({ who: res.owner_username, link: inviteLink(res.app_base_url || appBase, res.invite_token), hours: res.expires_hours });
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                Owners run the company: they invite their own people, create roles and set stock limits. You never see a company's other users.
            </div>
            {invite && <InviteBox who={invite.who} link={invite.link} hours={invite.hours} onClose={() => setInvite(null)} />}
            <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                    <thead><tr>{['OWNER', 'EMAIL', 'STATUS', 'LAST LOGIN', ''].map((h, i) => <th key={i} style={th}>{h}</th>)}</tr></thead>
                    <tbody>
                        {d.owners.map((o) => (
                            <tr key={o.username}>
                                <td style={{ ...td, fontWeight: 800 }}>{o.username}</td>
                                <td style={td}>{o.email || '—'}</td>
                                <td style={{ ...td, fontWeight: 800, fontSize: '12px', color: o.pending_invite ? '#fbbf24' : o.active ? '#34d399' : '#f87171' }}>{o.pending_invite ? 'Invited' : o.active ? 'Active' : 'Disabled'}</td>
                                <td style={{ ...td, fontSize: '12px', color: '#64748b' }}>{fmt(o.last_login)}</td>
                                <td style={{ ...td, textAlign: 'right' }}>
                                    {o.pending_invite && <button style={ghost} onClick={async () => show(await act(() => call('POST', `/companies/${id}/owners/${encodeURIComponent(o.username)}/reinvite`), 'New invite link created', true))}><Mail size={12} /> New invite link</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <form style={card} onSubmit={async (e) => {
                e.preventDefault();
                const res = await act(() => call('POST', `/companies/${id}/owners`, { email, username }), `Owner invited: ${email}`, true);
                if (res) { show(res); setEmail(''); setUsername(''); }
            }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9', marginBottom: '12px' }}>Add another owner <span style={{ color: '#64748b', fontWeight: 600 }}>(uses a seat)</span></div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input style={{ ...input, width: '240px' }} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input style={{ ...input, width: '170px' }} placeholder="Username (optional)" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <button type="submit" style={btn()}><Plus size={14} /> Invite owner</button>
                </div>
            </form>
        </div>
    );
}

function SettingsTab({ id, d, act, meta }) {
    const c = d.company;
    const [f, setF] = useState(null);
    useEffect(() => {
        setF({ name: c.name, notes: c.notes || '', expiry: c.plan_expires ? c.plan_expires.slice(0, 10) : '',
            features: [...c.features], display_name: c.branding.display_name || '', logo_url: c.branding.logo_url || '',
            primary_color: c.branding.primary_color || '', domains: c.domains.join(', ') });
    }, [c.company_id, c.name, c.notes, c.plan_expires, c.features.join(','), JSON.stringify(c.branding), c.domains.join(',')]);
    if (!f) return null;
    const save = (e) => {
        e.preventDefault();
        const body = { name: f.name, notes: f.notes, features: f.features,
            branding: { display_name: f.display_name, logo_url: f.logo_url, primary_color: f.primary_color },
            domains: f.domains.split(',').map((x) => x.trim()).filter(Boolean) };
        if (f.expiry) body.plan_expires = endOfDay(f.expiry); else body.clear_expiry = true;
        return act(() => call('PUT', `/companies/${id}`, body), 'Settings saved');
    };
    return (
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={card}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9', marginBottom: '14px' }}>Company</div>
                <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <Field name="NAME"><input style={input} required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
                    <Field name="SUBSCRIPTION ENDS" hint="Leave empty for no end date. After this date the company's people cannot sign in."><input style={input} type="date" value={f.expiry} onChange={(e) => setF({ ...f, expiry: e.target.value })} /></Field>
                    <Field name="INTERNAL NOTES"><input style={input} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
                    <Field name="DOMAINS" hint="Comma-separated, e.g. stocks.xyz.com. Used to show the company's branding on its own address."><input style={input} value={f.domains} onChange={(e) => setF({ ...f, domains: e.target.value })} /></Field>
                </div>
            </div>
            <div style={card}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>Branding</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>Stored with the company; the user app reads it to show the company's own name, logo and colour.</div>
                <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                    <Field name="DISPLAY NAME"><input style={input} value={f.display_name} onChange={(e) => setF({ ...f, display_name: e.target.value })} /></Field>
                    <Field name="LOGO URL"><input style={input} value={f.logo_url} onChange={(e) => setF({ ...f, logo_url: e.target.value })} placeholder="https://…/logo.png" /></Field>
                    <Field name="PRIMARY COLOUR"><input style={input} value={f.primary_color} onChange={(e) => setF({ ...f, primary_color: e.target.value })} placeholder="#2962ff" /></Field>
                </div>
            </div>
            <div style={card}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>Features included</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>The owner can only give their people features from this list. Removing one takes it away from everyone in the company within seconds.</div>
                <FeaturePicker features={meta?.features || []} value={f.features} onChange={(features) => setF({ ...f, features })} />
            </div>
            <div><button type="submit" style={btn()}><Save size={14} /> Save settings</button></div>
        </form>
    );
}

export default function CompanyDetail({ id, meta, go }) {
    const [d, setD] = useState(null);
    const [err, setErr] = useState(null);
    const [tab, setTab] = useState('billing');
    const [notice, setNotice] = useState(null);

    const load = useCallback(() => call('GET', `/companies/${id}`).then((x) => { setD(x); setErr(null); }).catch((e) => setErr(e.message)), [id]);
    useEffect(() => { load(); }, [load]);

    // Runs a mutation, shows the server's message on failure, and takes the fresh company from the reply.
    const act = async (fn, okText, wantResult = false) => {
        try {
            const res = await fn();
            if (res?.company) setD((prev) => ({ ...prev, ...res }));
            else await load();
            setNotice({ type: 'ok', text: okText });
            return wantResult ? res : true;
        } catch (e) { setNotice({ type: 'err', text: e.message }); return wantResult ? null : false; }
    };

    if (err) return <div style={{ color: '#f87171', fontSize: '13px' }}>{err} <button style={ghost} onClick={() => go('/companies')}>Back</button></div>;
    if (!d) return <div style={{ color: '#64748b', fontSize: '13px' }}>Loading…</div>;
    const c = d.company;
    const pct = c.seats.total ? Math.min(100, Math.round((c.seats.used / c.seats.total) * 100)) : 0;
    const suspended = c.status !== 'active';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button style={{ ...ghost, alignSelf: 'flex-start' }} onClick={() => go('/companies')}><ArrowLeft size={13} /> All companies</button>
            <div style={{ ...card, display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 260px' }}>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9' }}>{c.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{c.company_id} · created {fmtDate(c.created_at)}{c.created_by ? ` by ${c.created_by}` : ''}</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: statusColor(c), marginTop: '8px' }}>{statusText(c)}
                        <span style={{ color: '#94a3b8', fontWeight: 600 }}> · {c.plan_expires ? `${c.expired ? 'ended' : 'ends'} ${fmtDate(c.plan_expires)}` : 'no end date'}</span>
                    </div>
                </div>
                <div style={{ flex: '1 1 240px' }}>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Seats <b style={{ color: '#f1f5f9', fontSize: '18px' }}>{c.seats.used}</b> of {c.seats.total} in use · {c.pending_invites} invited</div>
                    <div style={{ height: '8px', background: '#0f1219', borderRadius: '5px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? '#f87171' : pct > 85 ? '#fbbf24' : '#7c3aed' }} />
                    </div>
                </div>
                <button style={btn(suspended ? '#047857' : '#7f1d1d')} onClick={() => {
                    if (!suspended && !window.confirm(`Suspend ${c.name}? Everyone in the company is signed out immediately and cannot sign in until you reactivate it.`)) return;
                    act(() => call('PUT', `/companies/${id}`, { status: suspended ? 'active' : 'suspended' }), suspended ? `${c.name} reactivated` : `${c.name} suspended`);
                }}>{suspended ? <><PlayCircle size={14} /> Reactivate</> : <><Ban size={14} /> Suspend</>}</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {TABS.map(([k, label]) => (
                    <button key={k} onClick={() => setTab(k)} style={{
                        padding: '9px 16px', borderRadius: '9px', cursor: 'pointer', fontSize: '13px', fontWeight: 800,
                        background: tab === k ? 'rgba(167,139,250,0.15)' : '#1e222d', color: tab === k ? '#c4b5fd' : '#94a3b8',
                        border: tab === k ? '1px solid rgba(167,139,250,0.4)' : '1px solid #2a2e39',
                    }}>{label}</button>
                ))}
            </div>
            <Notice notice={notice} onClose={() => setNotice(null)} />
            {tab === 'billing' && <BillingTab id={id} d={d} act={act} />}
            {tab === 'owners' && <OwnersTab id={id} d={d} act={act} appBase={meta?.app_base_url} />}
            {tab === 'settings' && <SettingsTab id={id} d={d} act={act} meta={meta} />}
            {tab === 'audit' && <Audit companyId={id} />}
        </div>
    );
}
