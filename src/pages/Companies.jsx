import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { call } from '../api';
import { Modal, Field, FeaturePicker, InviteBox, Notice } from '../components';
import { card, input, btn, ghost, th, td, fmtDate, statusColor, statusText, inviteLink } from '../ui';

function CreateCompany({ meta, onClose, onCreated }) {
    const defaults = (meta?.features || []).filter((f) => f.key !== 'admin.system').map((f) => f.key);
    const [f, setF] = useState({ name: '', seats: 20, owner_email: '', owner_username: '', months: 12, notes: '' });
    const [features, setFeatures] = useState(defaults);
    const [err, setErr] = useState(null);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true); setErr(null);
        try {
            const res = await call('POST', '/companies', {
                name: f.name, seats: Number(f.seats), owner_email: f.owner_email, owner_username: f.owner_username,
                months: Number(f.months), notes: f.notes, features,
            });
            setDone(res);
            onCreated();
        } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
    };

    if (done) {
        return (
            <Modal title={`${done.company.name} created`} onClose={onClose}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: '#cbd5e1' }}>
                    <div>{done.company.seats.total} seats, {done.company.plan_expires ? `subscription until ${fmtDate(done.company.plan_expires)}` : 'no end date'}.</div>
                    <InviteBox who={`${done.owner_username} (the owner)`} hours={done.expires_hours} link={inviteLink(done.app_base_url, done.invite_token)} />
                    <div style={{ color: '#94a3b8' }}>The owner opens the link, chooses a password, and then manages their own people. You can see this link only now — create a new one from the company page if it is lost.</div>
                    <button style={btn()} onClick={onClose}>Done</button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal title="New company" onClose={onClose} width={680}>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <Field name="COMPANY NAME"><input style={input} required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="XYZ Securities" autoFocus /></Field>
                    <Field name="SEATS" hint="Active users the company can have, including its owner."><input style={input} type="number" min={1} required value={f.seats} onChange={(e) => setF({ ...f, seats: e.target.value })} /></Field>
                    <Field name="OWNER EMAIL" hint="Gets the invite to set a password."><input style={input} type="email" required value={f.owner_email} onChange={(e) => setF({ ...f, owner_email: e.target.value })} /></Field>
                    <Field name="OWNER USERNAME (OPTIONAL)"><input style={input} value={f.owner_username} onChange={(e) => setF({ ...f, owner_username: e.target.value })} /></Field>
                    <Field name="SUBSCRIPTION (MONTHS)" hint="0 = no end date."><input style={input} type="number" min={0} max={60} value={f.months} onChange={(e) => setF({ ...f, months: e.target.value })} /></Field>
                    <Field name="NOTES (INTERNAL)"><input style={input} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
                </div>
                <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.4px', marginBottom: '8px' }}>FEATURES THIS COMPANY HAS BOUGHT</div>
                    <FeaturePicker features={meta?.features || []} value={features} onChange={setFeatures} />
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>The owner can only give their people features from this list. "System &amp; broker" reaches platform-wide settings — leave it off for customers.</div>
                </div>
                {err && <div style={{ color: '#f87171', fontSize: '13px' }}>{err}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" disabled={busy} style={btn()}><Plus size={14} /> {busy ? 'Creating…' : 'Create company & invite owner'}</button>
                    <button type="button" style={ghost} onClick={onClose}>Cancel</button>
                </div>
            </form>
        </Modal>
    );
}

export default function Companies({ meta, go }) {
    const [rows, setRows] = useState(null);
    const [q, setQ] = useState('');
    const [status, setStatus] = useState('');
    const [creating, setCreating] = useState(false);
    const [err, setErr] = useState(null);
    const load = useCallback(() => call('GET', '/companies').then((d) => setRows(d.companies)).catch((e) => setErr(e.message)), []);
    useEffect(() => { load(); }, [load]);

    const shown = (rows || []).filter((c) => {
        if (q.trim() && !`${c.name} ${c.company_id}`.toLowerCase().includes(q.trim().toLowerCase())) return false;
        if (status === 'active' && !(c.status === 'active' && !c.expired)) return false;
        if (status === 'suspended' && c.status !== 'suspended') return false;
        if (status === 'expired' && !c.expired) return false;
        return true;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {creating && <CreateCompany meta={meta} onClose={() => setCreating(false)} onCreated={load} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#f1f5f9' }}>Companies</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Each company manages its own people. You decide how many seats and which features it has.</div>
                </div>
                <button style={btn('#7c3aed')} onClick={() => setCreating(true)} disabled={!meta}><Plus size={14} /> New company</button>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: '#64748b' }} />
                    <input style={{ ...input, paddingLeft: '30px', width: '240px' }} placeholder="Search companies" value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
                <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All statuses</option>
                    {['active', 'suspended', 'expired'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {rows && <span style={{ fontSize: '12px', color: '#64748b' }}>{shown.length} of {rows.length}</span>}
            </div>
            {err && <div style={{ color: '#f87171', fontSize: '13px' }}>{err}</div>}
            <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                    <thead><tr>{['COMPANY', 'STATUS', 'SEATS', 'USERS', 'SUBSCRIPTION', 'FEATURES'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>
                        {shown.map((c) => {
                            const pct = c.seats.total ? c.seats.used / c.seats.total : 0;
                            return (
                                <tr key={c.company_id} onClick={() => go(`/companies/${c.company_id}`)} style={{ cursor: 'pointer' }}>
                                    <td style={{ ...td, fontWeight: 800 }}>{c.name}<div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{c.company_id}</div></td>
                                    <td style={{ ...td, color: statusColor(c), fontWeight: 800, fontSize: '12px' }}>{statusText(c)}</td>
                                    <td style={td}><b style={{ color: pct >= 1 ? '#f87171' : pct >= 0.9 ? '#fbbf24' : '#e2e8f0' }}>{c.seats.used}</b> <span style={{ color: '#64748b' }}>/ {c.seats.total}</span></td>
                                    <td style={td}>{c.user_count}{c.pending_invites ? <span style={{ color: '#64748b', fontSize: '11px' }}> · {c.pending_invites} invited</span> : null}</td>
                                    <td style={{ ...td, color: c.expired ? '#fb923c' : '#94a3b8', fontSize: '12px' }}>{c.plan_expires ? `${c.expired ? 'expired' : 'until'} ${fmtDate(c.plan_expires)}` : 'no end date'}</td>
                                    <td style={{ ...td, color: '#94a3b8', fontSize: '12px' }}>{c.features.length}</td>
                                </tr>
                            );
                        })}
                        {rows && shown.length === 0 && <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: '#64748b' }}>No companies match.</td></tr>}
                        {!rows && !err && <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: '#64748b' }}>Loading…</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
