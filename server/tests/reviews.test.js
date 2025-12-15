import { request, app, API, registerAndLogin } from "./testUtils.js"

describe("Reviews API", () => {
  test("GET /reviews/movie/:movieId (public) → 200", async () => {
    const res = await request(app).get(`${API}/reviews/movie/123?page=1&limit=10`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
  })

  test("GET /reviews/movie/:movieId/average (public) → 200", async () => {
    const res = await request(app).get(`${API}/reviews/movie/123/average`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
  })

  test("POST /reviews ilman tokenia → 401", async () => {
    const res = await request(app).post(`${API}/reviews`).send({
      movie_external_id: 123,
      rating: 5,
      review_text: "Test review"
    })
    expect(res.statusCode).toBe(401)
  })

  test("POST /reviews tokenilla → 201/200", async () => {
    const { token } = await registerAndLogin()
    const res = await request(app)
      .post(`${API}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        movie_external_id: 123,
        rating: 4,
        review_text: "Hyvä!"
      })

    expect([200, 201]).toContain(res.statusCode)
    expect(res.body).toBeDefined()
  })

  test("POST /reviews tokenilla mutta puuttuva data → 400/422", async () => {
    const { token } = await registerAndLogin()
    const res = await request(app)
      .post(`${API}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        movie_external_id: 123
      })

    expect([400, 422]).toContain(res.statusCode)
  })
})
