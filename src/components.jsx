import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { card, ghost, input, btn, label } from './ui';

export function Notice({ notice, onClose }) {
    if (!notice) return null;
    const ok = notice.type === 'ok';
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px',
            background: ok ? 'rgba(8,153,129,0.1)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${ok ? 'rgba(8,153,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
            color: ok ? '#34d399' : '#f87171', fontSize: '13px', fontWeight: 600,
        }}>
            {ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span style={{ flex: 1 }}>{notice.text}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
        </div>
    );
}

export function Stat({ icon: Icon, label: l, value, sub, color = '#60a5fa' }) {
    return (
        <div style={{ ...card, display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '11px', borderRadius: '10px', display: 'flex', color }}><Icon size={20} /></div>
            <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em' }}>{l}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>{value}</div>
                {sub && <div style={{ fontSize: '11px', color: '#64748b' }}>{sub}</div>}
            </div>
        </div>
    );
}

export function Modal({ title, onClose, children, width = 560 }) {
    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '5vh 16px', overflowY: 'auto' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ ...card, width: '100%', maxWidth: `${width}px` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#f1f5f9' }}>{title}</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

export function Field({ name, children, hint }) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={label}>{name}</span>
            {children}
            {hint && <span style={{ fontSize: '11px', color: '#64748b' }}>{hint}</span>}
        </label>
    );
}

/** A one-time invite link the operator must pass on themselves (no email is sent). */
export function InviteBox({ who, link, hours, onClose }) {
    const [copied, setCopied] = useState(false);
    return (
        <div style={{ padding: '12px', borderRadius: '9px', background: 'rgba(8,153,129,0.08)', border: '1px solid rgba(8,153,129,0.35)', fontSize: '13px', color: '#a7f3d0' }}>
            Send this one-time link to <b>{who}</b> (valid {hours}h). Email is not sent automatically.
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                <code style={{ flex: 1, wordBreak: 'break-all', color: '#fbbf24', userSelect: 'all' }}>{link}</code>
                <button type="button" style={ghost} onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); }}><Copy size={12} /> {copied ? 'Copied' : 'Copy'}</button>
                {onClose && <button type="button" style={ghost} onClick={onClose}><X size={12} /></button>}
            </div>
        </div>
    );
}

/** Feature tick-list; the operator decides what each company has bought. */
export function FeaturePicker({ features, value, onChange }) {
    const groups = [...new Set(features.map((f) => f.group))];
    const toggle = (k) => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {groups.map((g) => (
                <div key={g}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', marginBottom: '6px' }}>{g.toUpperCase()}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '6px' }}>
                        {features.filter((f) => f.group === g).map((f) => {
                            const on = value.includes(f.key);
                            return (
                                <label key={f.key} title={f.description} style={{
                                    display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
                                    background: on ? 'rgba(41,98,255,0.12)' : '#0f1219', border: `1px solid ${on ? 'rgba(41,98,255,0.45)' : '#2a2e39'}`,
                                    fontSize: '12px', fontWeight: 700, color: '#f1f5f9',
                                }}>
                                    <input type="checkbox" checked={on} onChange={() => toggle(f.key)} /> {f.label}
                                </label>
                            );
                        })}
                    </div>
                </div>
            ))}
            <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" style={ghost} onClick={() => onChange(features.filter((f) => f.key !== 'admin.system').map((f) => f.key))}>Select all</button>
                <button type="button" style={ghost} onClick={() => onChange([])}>Clear</button>
            </div>
        </div>
    );
}

export { input, btn, ghost };
