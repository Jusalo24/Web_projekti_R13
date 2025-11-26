import { useAuth } from "../context/AuthContext";

export function useApi() {
  const { token } = useAuth();
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const request = async (url, options = {}) => {
    const res = await fetch(`${baseURL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
  };

  return { request };
}
