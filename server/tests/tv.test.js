import { request, app, API } from "./testUtils.js"

describe("TV API (TMDB proxy)", () => {
  test("GET /tv/search?q=breaking+bad → 200", async () => {
    const res = await request(app).get(`${API}/tv/search?q=breaking+bad&page=1`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
  })

  test("GET /tv/discover → 200", async () => {
    const res = await request(app).get(`${API}/tv/discover?with_genres=10765&sort_by=popularity.desc&page=1`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
  })
})
