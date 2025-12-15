import { jest } from "@jest/globals"
import request from "supertest"

jest.resetModules()

const dbMock = { query: jest.fn() }

jest.unstable_mockModule("../helpers/db.js", () => ({
  default: dbMock,
  query: dbMock.query
}))

jest.unstable_mockModule("../helpers/auth.js", () => ({
  auth: (req, res, next) => {
    // hyväksy aina testissä
    req.user = { id: "user-id", email: "test@test.com", username: "testuser" }
    next()
  },
  blacklistToken: jest.fn(),
  getBlacklistSize: jest.fn(() => 0)
}))

const app = (await import("../index.js")).default

describe("DELETE /api/users/:id", () => {
  test("deletes user account", async () => {
    // jos deleteUser tekee yhden db.queryn
    dbMock.query.mockResolvedValueOnce({ rows: [{ id: "user-id" }] })

    const res = await request(app)
      .delete("/api/users/user-id")
      .set("Authorization", "Bearer faketoken")

    expect([200, 204]).toContain(res.status)
  })
})