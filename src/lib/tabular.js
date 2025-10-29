// const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/+$/, "");
const API_BASE = (import.meta.env.VITE_API_BASE ?? "/api").replace(/\/+$/, "");

export async function fetchTabularByUrl(fileUrl, { token, withCredentials = false, signal } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/api/tabular?url=${encodeURIComponent(fileUrl)}`, {
    method: "GET",
    headers,
    credentials: withCredentials ? "include" : "same-origin",
    signal
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return {
    columns: data?.columns || data?.headers || [],
    rows: data?.rows || data?.data || []
  };
}