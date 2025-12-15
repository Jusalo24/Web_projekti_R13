import { request, app, API } from "./testUtils.js"

describe("Genres API", () => {
  test("GET /genres/movie → 200", async () => {
    const res = await request(app).get(`${API}/genres/movie`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
  })

  test("GET /genres/tv → 200", async () => {
    const res = await request(app).get(`${API}/genres/tv`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
  })

  test("GET /discover/tv → 200", async () => {
    const res = await request(app).get(`${API}/discover/tv?with_genres=10765&sort_by=popularity.desc&page=1`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
  })
})
