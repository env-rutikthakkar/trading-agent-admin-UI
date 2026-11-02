import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Building2, CreditCard, ScrollText, LogOut, KeyRound, X, Save } from 'lucide-react';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Payments from './pages/Payments';
import Audit from './pages/Audit';
import { Modal, Field, Notice } from './components';
import { getSession, saveSession, logout, pingActivity, setNotice, changePassword, call } from './api';
import { input, btn } from './ui';

const NAV = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/companies', label: 'Companies', icon: Building2 },
    { path: '/payments', label: 'Payments', icon: CreditCard },
    { path: '/audit', label: 'Audit log', icon: ScrollText },
];

// Tiny router: the portal has four pages and one detail view.
const useRoute = () => {
    const [path, setPath] = useState(window.location.pathname);
    useEffect(() => {
        const on = () => setPath(window.location.pathname);
        window.addEventListener('popstate', on);
        return () => window.removeEventListener('popstate', on);
    }, []);
    const go = useCallback((to) => { window.history.pushState({}, '', to); setPath(to); window.scrollTo(0, 0); }, []);
    return [path, go];
};

function PasswordModal({ onClose, onChanged }) {
    const [cur, setCur] = useState(''); const [next, setNext] = useState(''); const [msg, setMsg] = useState(null);
    const submit = async (e) => {
        e.preventDefault();
        try { onChanged(await changePassword(cur, next)); setMsg({ type: 'ok', text: 'Password changed. Other sessions were signed out.' }); setCur(''); setNext(''); }
        catch (err) { setMsg({ type: 'err', text: err.message }); }
    };
    return (
        <Modal title="Change password" onClose={onClose} width={400}>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Field name="CURRENT PASSWORD"><input style={input} type="password" value={cur} onChange={(e) => setCur(e.target.value)} required autoComplete="current-password" /></Field>
                <Field name="NEW PASSWORD" hint="At least 10 characters."><input style={input} type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={10} autoComplete="new-password" /></Field>
                <Notice notice={msg} onClose={() => setMsg(null)} />
                <button type="submit" style={btn()}><Save size={14} /> Update password</button>
            </form>
        </Modal>
    );
}

function Shell({ session, onSession }) {
    const [path, go] = useRoute();
    const [pw, setPw] = useState(false);
    const [meta, setMeta] = useState(null);

    useEffect(() => { call('GET', '/meta').then(setMeta).catch(() => {}); }, []);

    // Idle timeout: only real interaction counts; the server enforces the same limit.
    const idleMin = session.idle_timeout_minutes || 0;
    useEffect(() => {
        if (!idleMin) return undefined;
        let last = Date.now(); let lastPing = 0;
        const bump = () => { last = Date.now(); if (last - lastPing > 60000) { lastPing = last; pingActivity(); } };
        const evts = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
        evts.forEach((e) => window.addEventListener(e, bump, { passive: true }));
        bump();
        const t = setInterval(() => {
            if (Date.now() - last > idleMin * 60000) { setNotice(`Signed out after ${idleMin} minutes of inactivity.`); logout(); }
        }, 15000);
        return () => { evts.forEach((e) => window.removeEventListener(e, bump)); clearInterval(t); };
    }, [idleMin]);

    const detail = path.match(/^\/companies\/([^/]+)/);
    const activePath = detail ? '/companies' : (NAV.find((n) => n.path === path)?.path ?? '/');

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap' }}>
            {pw && <PasswordModal onClose={() => setPw(false)} onChanged={(s) => { saveSession(s); onSession(s); }} />}
            <aside className="side" style={{ width: '230px', flexShrink: 0, background: '#131722', borderRight: '1px solid #2a2e39', padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <img src="/envisage-logo.png" alt="Envisage Infotech" style={{ height: '38px', width: 'auto', alignSelf: 'flex-start', marginBottom: '4px' }} />
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#a78bfa', letterSpacing: '0.08em', margin: '4px 6px 10px' }}>PLATFORM ADMIN</div>
                {NAV.map((n) => {
                    const on = n.path === activePath;
                    return (
                        <button key={n.path} onClick={() => go(n.path)} style={{
                            display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', borderRadius: '9px', cursor: 'pointer', textAlign: 'left',
                            fontSize: '13px', fontWeight: 800, background: on ? 'rgba(167,139,250,0.15)' : 'transparent',
                            color: on ? '#c4b5fd' : '#94a3b8', border: on ? '1px solid rgba(167,139,250,0.4)' : '1px solid transparent',
                        }}><n.icon size={16} /> {n.label}</button>
                    );
                })}
                <div style={{ flex: 1 }} />
                <div style={{ padding: '6px 14px', fontSize: '12px', color: '#64748b' }}>Signed in as <b style={{ color: '#e2e8f0' }}>{session.username}</b></div>
                <button onClick={() => setPw(true)} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '9px 14px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}><KeyRound size={14} /> Change password</button>
                <button onClick={logout} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '9px 14px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}><LogOut size={14} /> Sign out</button>
            </aside>
            <main className="main" style={{ flex: 1, minWidth: 0, padding: '28px', maxWidth: '1280px' }}>
                {detail ? <CompanyDetail id={decodeURIComponent(detail[1])} meta={meta} go={go} />
                    : path === '/companies' ? <Companies meta={meta} go={go} />
                        : path === '/payments' ? <Payments go={go} />
                            : path === '/audit' ? <Audit />
                                : <Overview go={go} />}
            </main>
        </div>
    );
}

export default function App() {
    const [session, setSession] = useState(getSession);
    useEffect(() => {
        const out = () => setSession(null);
        window.addEventListener('platform:unauthorized', out);
        return () => window.removeEventListener('platform:unauthorized', out);
    }, []);
    if (!session) return <Login onSuccess={setSession} />;
    return <Shell session={session} onSession={setSession} />;
}
