import { request, app, API } from "./testUtils.js"

describe("Search API (TMDB proxy)", () => {
  test("GET /search/multi?q=avatar → 200", async () => {
    const res = await request(app).get(`${API}/search/multi?q=avatar&page=1`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
  })

  test("GET /search/person?q=tom+cruise → 200", async () => {
    const res = await request(app).get(`${API}/search/person?q=tom+cruise&page=1`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
  })

  test("GET /trending/all/day → 200", async () => {
    const res = await request(app).get(`${API}/trending/all/day?page=1`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
  })
})
