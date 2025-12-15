import request from "supertest"
import app from "../index.js"

describe("GET /health", () => {
  it("returns 200 and status OK", async () => {
    const res = await request(app).get("/health").expect(200)
    expect(res.body).toHaveProperty("status", "OK")
  })
})
