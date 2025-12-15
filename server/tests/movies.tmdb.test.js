import { jest } from "@jest/globals"
import request from "supertest"

jest.unstable_mockModule("axios", () => ({
  default: {
    get: jest.fn()
  }
}))

const axios = (await import("axios")).default
const app = (await import("../index.js")).default

describe("TMDB movie endpoints", () => {
  it("GET /api/movies/popular returns data from TMDB", async () => {
    axios.get.mockResolvedValueOnce({
      data: { results: [{ id: 1, title: "Test Movie" }] }
    })

    const res = await request(app)
      .get("/api/movies/popular")
      .expect(200)

    expect(res.body).toEqual({ results: [{ id: 1, title: "Test Movie" }] })
    expect(axios.get).toHaveBeenCalled()
  })
})
