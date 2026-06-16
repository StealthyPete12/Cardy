import * as SecureStore from 'expo-secure-store';

const BASE = 'http://127.0.0.1:5234/api';

export async function api(path, options = {}) {
  const token = await SecureStore.getItemAsync('token');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}