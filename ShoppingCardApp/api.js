import * as SecureStore from 'expo-secure-store';

// Base URL for the API — replace with your machine's IP (e.g. "http://192.168.1.5:5000/api")
const BASE = 'Your local machine IP';

// Helper function for all API calls — automatically attaches the JWT token if logged in
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
  // 204 means success with no body (e.g. after deleting a card)
  return res.status === 204 ? null : res.json();
}