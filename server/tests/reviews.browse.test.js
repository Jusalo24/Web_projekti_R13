import { jest } from "@jest/globals"
import request from "supertest"

jest.resetModules()

const dbMock = { query: jest.fn() }

jest.unstable_mockModule("../helpers/db.js", () => ({
  default: dbMock,
  query: dbMock.query
}))

const app = (await import("../index.js")).default

describe("Browse reviews", () => {
  beforeEach(() => {
    dbMock.query.mockReset()
  })

  test("GET /api/reviews/movie/:movieId returns reviews", async () => {
    // 1) varsinaiset reviewt
    dbMock.query.mockResolvedValueOnce({
      rows: [
        {
          id: "rev-1",
          user_id: "user-1",
          movie_external_id: "550",
          media_type: "movie",
          rating: 5,
          review_text: "Hyvä",
          username: "tester"
        }
      ]
    })

    // 2) paginationin total/count (usein toinen query)
    dbMock.query.mockResolvedValueOnce({
      rows: [{ total: 1 }]
    })

    const res = await request(app)
      .get("/api/reviews/movie/550?media_type=movie&page=1&limit=20")
      .expect(200)

    expect(res.body).toHaveProperty("reviews")
  })
})