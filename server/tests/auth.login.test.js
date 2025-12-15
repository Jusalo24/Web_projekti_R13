import { jest } from "@jest/globals"
import request from "supertest"

process.env.JWT_SECRET = "test-secret"

const dbMock = { query: jest.fn() }

jest.unstable_mockModule("../helpers/db.js", () => ({
  default: dbMock,
  query: dbMock.query
}))

const bcryptMock = {
  compare: jest.fn(),
  compareSync: jest.fn(),
  hash: jest.fn(),
  hashSync: jest.fn()
}

jest.unstable_mockModule("bcryptjs", () => ({
  default: bcryptMock,
  ...bcryptMock
}))

const app = (await import("../index.js")).default

describe("POST /api/users/login", () => {
  beforeEach(() => {
    dbMock.query.mockReset()
    bcryptMock.compare.mockReset()
    bcryptMock.compareSync.mockReset()
  })

  test("logs in with correct credentials", async () => {
    dbMock.query.mockResolvedValueOnce({
      rows: [
        {
          id: "user-id",
          email: "test@test.com",
          username: "testuser",
          password: "hashed-password"
        }
      ]
    })

    bcryptMock.compare.mockResolvedValue(true)
    bcryptMock.compareSync.mockReturnValue(true)

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "test@test.com", password: "Testi123" })
      .expect(200)

    expect(res.body).toHaveProperty("token")
    expect(res.body).toHaveProperty("user")
    expect(res.body.user.email).toBe("test@test.com")
  })

  test("fails with wrong password", async () => {
    dbMock.query.mockResolvedValueOnce({
      rows: [{ id: "user-id", email: "test@test.com", password: "hashed-password" }]
    })

    bcryptMock.compare.mockResolvedValue(false)
    bcryptMock.compareSync.mockReturnValue(false)

    await request(app)
      .post("/api/users/login")
      .send({ email: "test@test.com", password: "WRONGPASS" })
      .expect(401)
  })

  test("fails if user not found", async () => {
    dbMock.query.mockResolvedValueOnce({ rows: [] })

    await request(app)
      .post("/api/users/login")
      .send({ email: "nope@test.com", password: "Testi123" })
      .expect(401)
  })
})
