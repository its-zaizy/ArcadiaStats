const API_URL = 'http://localhost:4000/api';

export async function apiFetch(path, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: 'Bearer ' + token } : {})
  };

  const res = await fetch(API_URL + path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function apiGet(path, token) {
  return apiFetch(path, { method: 'GET' }, token);
}
