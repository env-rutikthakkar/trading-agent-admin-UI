// Shared styles and formatters (dark theme, same look as the company admin console).
export const fmt = (iso) => (iso ? new Date(iso).toLocaleString() : '—');
export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : '—');
export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const card = { background: '#131722', border: '1px solid #2a2e39', borderRadius: '12px', padding: '20px' };
export const input = {
    background: '#0f1219', border: '1px solid #2a2e39', borderRadius: '8px', padding: '9px 12px',
    color: '#f1f5f9', fontSize: '13px', outline: 'none', minWidth: 0,
};
export const btn = (color = '#2962ff') => ({
    background: color, border: 'none', borderRadius: '8px', padding: '9px 14px', color: '#fff',
    fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
});
export const ghost = {
    background: 'transparent', border: '1px solid #2a2e39', borderRadius: '8px', padding: '7px 10px',
    color: '#94a3b8', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '5px',
};
export const th = { textAlign: 'left', padding: '10px 12px', fontSize: '11px', color: '#64748b', letterSpacing: '0.06em', fontWeight: 800, borderBottom: '1px solid #2a2e39' };
export const td = { padding: '12px', fontSize: '13px', color: '#e2e8f0', borderBottom: '1px solid #1e222d', verticalAlign: 'middle' };
export const label = { fontSize: '12px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.4px' };

export const statusColor = (c) => (c.status !== 'active' ? '#f87171' : c.expired ? '#fb923c' : '#34d399');
export const statusText = (c) => (c.status !== 'active' ? 'Suspended' : c.expired ? 'Expired' : 'Active');

/** Link a newly invited person opens (the user app handles /#/accept-invite/<token>). */
export const inviteLink = (appBase, token) =>
    `${(appBase || window.location.origin).replace(/\/$/, '')}/#/accept-invite/${encodeURIComponent(token)}`;
