import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LoadingBarProvider } from "@/components/LoadingBar";

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '');
const USE_AUTH_HEADER = String(import.meta.env.VITE_USE_AUTH_HEADER || '').toLowerCase() === 'true';
const AUTH_DEBUG = String(import.meta.env.VITE_AUTH_DEBUG || '').toLowerCase() === 'true';

// Logout centralizado + redirección a /login
function logoutAndRedirect(reason = '') {
  // evita múltiples disparos concurrentes
  if (window.__authLoggingOut) return;
  window.__authLoggingOut = true;
  try {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
  } catch {}
  // Opcional: marca para debug
  if (reason) console.warn('Auth: forcing logout due to', reason);
  // Redirige a login y reemplaza el historial
  try {
    if (window.location.pathname !== '/login') {
      window.location.replace('/login');
    } else {
      // si ya estamos en /login, solo limpia el flag
      window.__authLoggingOut = false;
    }
  } catch {
    window.location.href = '/login';
  }
}

function getAccessToken() {
  // token que guardamos en login (App.jsx handleLogin -> 'access')
  return localStorage.getItem('access') || sessionStorage.getItem('access') || '';
}

function getCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : '';
}

function sameOrigin(u) {
  try {
    const a = new URL(u, window.location.origin);
    return a.origin === window.location.origin;
  } catch {
    return false;
  }
}
function isApiRequest(u) {
  if (!u) return false;
  try {
    const abs = new URL(u, window.location.origin).href;
    if (!API_BASE) return abs.includes('/api/');
    const api = new URL(API_BASE).origin;
    return abs.startsWith(API_BASE) || new URL(abs).origin === api || abs.includes('/api/');
  } catch {
    return String(u).includes('/api/');
  }
}

function isAuthEndpoint(u) {
  try {
    const abs = new URL(u, window.location.origin).href;
    const p = new URL(abs).pathname.toLowerCase();
    return p.endsWith('/api/login/') || p.endsWith('/api/login') || p.endsWith('/login');
  } catch {
    const s = String(u || '').toLowerCase();
    return s.includes('/api/login') || s.endsWith('/login');
  }
}

function buildAuthHeader(raw) {
  if (!raw) return '';
  const cleaned = String(raw).trim();
  // Si ya viene con esquema, respétalo
  if (/^(Bearer|Token)\s+/i.test(cleaned)) return cleaned;
  // Heurística + env para esquema
  const envScheme = (import.meta.env.VITE_AUTH_SCHEME || '').trim();
  const scheme = envScheme || (cleaned.includes('.') ? 'Bearer' : 'Token');
  return `${scheme} ${cleaned}`;
}

const originalFetch = window.fetch.bind(window);
window.fetch = (url, options = {}) =>
  originalFetch(url, { credentials: "include", ...options });
// window.fetch = (input, init = {}) => {
//   const url = typeof input === 'string' ? input : input?.url || '';
//   const isAbsolute = /^https?:\/\//i.test(url);
//   const headers = new Headers(init.headers || {});
//   if (!headers.has('Accept')) headers.set('Accept', 'application/json, text/plain, */*');

//   // Authorization: SOLO si está habilitado por env y hay token
//   if (!headers.has('Authorization') && isApiRequest(url) && USE_AUTH_HEADER) {
//     const t = getAccessToken();
//     if (t) headers.set('Authorization', buildAuthHeader(t));
//   }

//   // CSRF y credentials
//   const method = (init.method || 'GET').toUpperCase();
//   const needsCsrf = sameOrigin(url) && !['GET','HEAD','OPTIONS','TRACE'].includes(method);
//   if (needsCsrf && !headers.has('X-CSRFToken')) {
//     const csrftoken = getCookie('csrftoken');
//     if (csrftoken) headers.set('X-CSRFToken', csrftoken);
//   }
//   const credentials =
//     init.credentials ??
//     (isApiRequest(url) ? 'include' : (isAbsolute ? 'omit' : 'include'));

//   return originalFetch(input, { ...init, headers, credentials })
//     .then(async (res) => {
//       if (isApiRequest(url) && !isAuthEndpoint(url)) {
//         const status = res.status;
//         const hadAuthHeader = headers.has('Authorization');
//         const hasSessionCookie = document.cookie.includes('sessionid=');
//         if (AUTH_DEBUG) {
//           console.debug('[auth]', method, url, '->', status, { hadAuthHeader, hasSessionCookie });
//         }
//         const shouldLogoutStatuses = new Set([401, 403, 419, 440, 498, 499]);
//         if (shouldLogoutStatuses.has(status) && (hadAuthHeader || hasSessionCookie)) {
//           logoutAndRedirect(`HTTP ${status} on ${url}`);
//           return res;
//         }
//       }
//       return res;
//     })
//     .catch((err) => {
//       if (isApiRequest(url) && !isAuthEndpoint(url)) {
//         const hadAuthHeader = headers.has('Authorization');
//         const hasSessionCookie = document.cookie.includes('sessionid=');
//         if (AUTH_DEBUG) console.debug('[auth] network error', method, url, { hadAuthHeader, hasSessionCookie });
//         if (hadAuthHeader || hasSessionCookie) {
//           logoutAndRedirect(`Network error on ${url}`);
//         }
//       }
//       throw err;
//     });
// };

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoadingBarProvider>
      <App />
    </LoadingBarProvider>
  </StrictMode>,
)
