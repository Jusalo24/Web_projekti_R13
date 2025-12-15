import { request, app, API } from "./testUtils.js"

describe("Movies API (TMDB proxy)", () => {
  test("GET /movies/genres → 200", async () => {
    const res = await request(app).get(`${API}/movies/genres`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
  })

  test("GET /movies/search?q=avatar → 200", async () => {
    const res = await request(app).get(`${API}/movies/search?q=avatar&page=1`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
  })

  test("GET /movies/discover → 200", async () => {
    const res = await request(app).get(`${API}/movies/discover?with_genres=28&sort_by=popularity.desc&page=1`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
  })
})
