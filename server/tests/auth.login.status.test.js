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
    const header = req.headers.authorization || ""
    if (!header.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" })
    req.user = { id: "user-id", email: "test@test.com", username: "testuser" }
    next()
  }
}))

const app = (await import("../index.js")).default

describe("GET /api/users/me", () => {
  test("401 without token", async () => {
    await request(app).get("/api/users/me").expect(401)
  })

  test("200 with token", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", "Bearer faketoken")
      .expect(200)

    expect(res.body).toEqual({
      id: "user-id",
      email: "test@test.com",
      username: "testuser"
    })
  })
})