import request from "supertest"
import app from "../index.test.js"

/**
 * Small helper layer for integration tests.
 * These tests assume:
 * - Express app is exported from server/app.js
 * - user routes are mounted under `${API_PREFIX}`
 *
 * If your mount differs, set env: API_PREFIX=/whatever when running tests.
 */

export const API = process.env.API_PREFIX || "/api"

export function makeEmail() {
  const stamp = Date.now()
  return `test_${stamp}@example.com`
}

export function uniqueEmail(prefix = "test") {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`
}

export async function registerUser({ email, username, password }) {
  const res = await request(app)
    .post(`${API}/users/register`)
    .send({ email, username, password })
  return res
}

export async function loginUser({ email, password }) {
  const res = await request(app)
    .post(`${API}/users/login`)
    .send({ email, password })
  return res
}

/**
 * Registers + logs in a new user, returns token and user info.
 * NOTE: Your controller must return token in response for login.
 * If your API returns token under a different key, adjust here.
 */
export async function registerAndLogin() {
  const email = uniqueEmail("user")
  const username = `user_${Date.now()}`
  const password = "Password123!"

  const reg = await registerUser({ email, username, password })
  // 201 is typical; allow 200 in case controller returns 200
  expect([200, 201]).toContain(reg.statusCode)

  const login = await loginUser({ email, password })
  expect(login.statusCode).toBe(200)

  const token =
    login.body?.token ||
    login.body?.accessToken ||
    login.body?.jwt ||
    login.body?.data?.token

  if (!token) {
    throw new Error(
      "Login response did not include a token. Update registerAndLogin() to match your API response shape."
    )
  }

  return { email, username, password, token, loginBody: login.body, registerBody: reg.body }
}

export { request, app }
