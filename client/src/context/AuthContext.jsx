import React from "react";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Access token is stored in-memory to mitigate XSS. Refresh token is HttpOnly cookie.
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

  const login = (userData, accessToken) => {
    setUser(userData)
    setToken(accessToken)
  }

  const logout = async () => {
    try {
      await fetch(`${baseURL}/api/users/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (err) {
      console.error('Logout error', err)
    }

    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
  }

  // Refresh access token using HttpOnly refresh cookie
  const refreshAccessToken = async () => {
    try {
      const res = await fetch(`${baseURL}/api/users/refresh`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!res.ok) {
        setToken(null)
        return null
      }

      const data = await res.json()
      if (data?.accessToken) setToken(data.accessToken)
      if (data?.user) setUser(data.user)

      return data?.accessToken || null
    } catch (err) {
      console.error('Failed to refresh access token', err)
      setToken(null)
      return null
    }
  }

  useEffect(() => {
    // Try to refresh on mount
    refreshAccessToken()

    // Periodic refresh every 15 minutes
    const id = setInterval(() => {
      refreshAccessToken()
    }, 15 * 60 * 1000)

    return () => clearInterval(id)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);
