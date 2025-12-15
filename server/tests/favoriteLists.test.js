import { request, app, API, registerAndLogin } from "./testUtils.js"

describe("Favorite Lists API", () => {
  test("GET /favorite-lists ilman tokenia → 401", async () => {
    const res = await request(app).get(`${API}/favorite-lists`)
    expect(res.statusCode).toBe(401)
  })

  test("POST /favorite-lists tokenilla → 201/200", async () => {
    const { token } = await registerAndLogin()
    const res = await request(app)
      .post(`${API}/favorite-lists`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: `My list ${Date.now()}` })

    expect([200, 201]).toContain(res.statusCode)
    expect(res.body).toBeDefined()
  })
})
