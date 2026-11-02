// Session + API access for the platform portal.
const KEY = 'platform.session';
const BASE = import.meta.env.VITE_API_BASE_URL || '';

export const getSession = () => {
    try {
        const s = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (!s?.token) return null;
        if (s.expires_at && Date.parse(s.expires_at) <= Date.now()) { clearSession(); return null; }
        return s;
    } catch { return null; }
};
export const saveSession = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* non-fatal */ } };
export const clearSession = () => { try { localStorage.removeItem(KEY); } catch { /* non-fatal */ } };

export const setNotice = (m) => { try { sessionStorage.setItem('platform.notice', m); } catch { /* ignore */ } };
export const takeNotice = () => {
    try { const m = sessionStorage.getItem('platform.notice'); sessionStorage.removeItem('platform.notice'); return m; } catch { return null; }
};

/** Platform API call. Surfaces the server's own error text verbatim. */
export async function call(method, path, body, { auth = true } = {}) {
    const s = getSession();
    const res = await fetch(`${BASE}/api/platform${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...(auth && s ? { Authorization: `Bearer ${s.token}` } : {}) },
        body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch { /* empty body */ }
    if (res.status === 401 && auth) {
        clearSession();
        if (data?.detail) setNotice(data.detail);
        window.dispatchEvent(new CustomEvent('platform:unauthorized'));
    }
    if (!res.ok) throw new Error(data?.detail || `Request failed (HTTP ${res.status})`);
    return data;
}

export const login = async (username, password) => {
    const data = await call('POST', '/login', { username, password }, { auth: false });
    if (data.token) saveSession(data);
    return data;
};
export const verifyTwoFactor = async (challenge, code) => {
    const data = await call('POST', '/login/2fa', { challenge, code }, { auth: false });
    saveSession(data);
    return data;
};
export const pingActivity = () => call('POST', '/activity', {}).catch(() => {});
export const logout = () => {
    call('POST', '/logout', {}).catch(() => {});
    clearSession();
    window.location.href = '/';
};
export const changePassword = async (current_password, new_password) => {
    const data = await call('POST', '/change-password', { current_password, new_password });
    saveSession(data);
    return data;
};
