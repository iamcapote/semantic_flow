import { useEffect, useState, useCallback } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/me', { credentials: 'include' });
      if (r.ok) {
        const data = await r.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(() => {
    window.location.href = '/api/sso/login';
  }, []);

  const logout = useCallback(async () => {
    try {
      const csrf = getCSRFCookie();
      await fetch('/api/logout', { method: 'POST', headers: { 'x-csrf-token': csrf }, credentials: 'include' });
    } catch {}
    await refresh();
  }, [refresh]);

  return { user, loading, login, logout, refresh };
}

export async function fetchPublicConfig() {
  const r = await fetch('/api/config', { credentials: 'include' });
  if (!r.ok) throw new Error('config_failed');
  return r.json();
}

export function getCSRFCookie() {
  const m = document.cookie.match(/(?:^|; )sf_csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}
