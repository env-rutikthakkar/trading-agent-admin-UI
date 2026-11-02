import React, { useState } from 'react';
import { LogIn, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { login, verifyTwoFactor, takeNotice } from '../api';
import { input, btn, label } from '../ui';

export default function Login({ onSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState(null);       // null | { challenge, method, enroll, secret }
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const [notice] = useState(takeNotice);

    const submit = async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true); setError(null);
        try {
            if (!step) {
                const res = await login(username.trim(), password);
                if (res.two_factor) { setStep({ challenge: res.challenge, method: res.method, enroll: res.two_factor === 'enroll', secret: res.secret }); setPassword(''); }
                else onSuccess(res);
            } else {
                onSuccess(await verifyTwoFactor(step.challenge, code.trim()));
            }
        } catch (err) {
            setError(err.message);
            if (!step) setPassword(''); else setCode('');
            if (step && /expired|Invalid verification|locked/i.test(err.message)) setStep(null);
        } finally { setBusy(false); }
    };

    const banner = (error || notice) && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '14px', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', lineHeight: 1.5,
            background: error ? 'rgba(242,54,69,0.08)' : 'rgba(41,98,255,0.08)', border: `1px solid ${error ? 'rgba(242,54,69,0.35)' : 'rgba(41,98,255,0.35)'}`, color: error ? '#f87171' : '#93c5fd' }}>
            {error ? <AlertCircle size={14} style={{ marginTop: '2px' }} /> : <Info size={14} style={{ marginTop: '2px' }} />}<span>{error || notice}</span>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <form onSubmit={submit} style={{ width: '100%', maxWidth: '380px', background: '#131722', border: '1px solid #2a2e39', borderRadius: '14px', padding: '30px 28px' }}>
                <img src="/envisage-logo.png" alt="Envisage Infotech" style={{ height: '48px', display: 'block', marginBottom: '10px' }} />
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#a78bfa', letterSpacing: '0.1em', marginBottom: '4px' }}>PLATFORM ADMIN</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '22px' }}>{step ? 'Two-factor verification' : 'Operator sign-in. This portal manages companies, seats and billing.'}</div>
                {banner}
                {!step ? (<>
                    <div style={label}>USERNAME</div>
                    <input style={{ ...input, width: '100%', margin: '6px 0 16px' }} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus />
                    <div style={label}>PASSWORD</div>
                    <input style={{ ...input, width: '100%', margin: '6px 0 20px' }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                    <button type="submit" disabled={busy || !username.trim() || !password} style={{ ...btn(), width: '100%', justifyContent: 'center', padding: '12px', opacity: busy ? 0.7 : 1 }}>
                        <LogIn size={15} /> {busy ? 'SIGNING IN…' : 'SIGN IN'}
                    </button>
                </>) : (<>
                    {step.enroll && (
                        <div style={{ marginBottom: '16px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                            Add a time-based account in your authenticator app with this key, then enter the 6-digit code:
                            <code style={{ display: 'block', margin: '8px 0', padding: '10px', background: '#0f1219', border: '1px solid #2a2e39', borderRadius: '8px', wordBreak: 'break-all', color: '#fbbf24', userSelect: 'all' }}>{step.secret}</code>
                        </div>
                    )}
                    <div style={label}><ShieldCheck size={12} style={{ verticalAlign: '-2px' }} /> VERIFICATION CODE</div>
                    <input style={{ ...input, width: '100%', margin: '6px 0 20px', letterSpacing: '4px', fontSize: '18px', textAlign: 'center' }} value={code} onChange={(e) => setCode(e.target.value)} autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={12} />
                    <button type="submit" disabled={busy || !code.trim()} style={{ ...btn(), width: '100%', justifyContent: 'center', padding: '12px' }}>{busy ? 'VERIFYING…' : 'VERIFY'}</button>
                    <button type="button" onClick={() => { setStep(null); setCode(''); setError(null); }} style={{ marginTop: '12px', width: '100%', background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>← Back to sign in</button>
                </>)}
            </form>
        </div>
    );
}
