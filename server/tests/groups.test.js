import { request, app, API, registerAndLogin } from "./testUtils.js"

describe("Groups API", () => {
  test("GET /groups (public) → 200 ja palauttaa listan", async () => {
    const res = await request(app).get(`${API}/groups/`)
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  test("POST /groups ilman tokenia → 401", async () => {
    const res = await request(app).post(`${API}/groups/`).send({
      name: "Test group",
      description: "Desc"
    })
    expect(res.statusCode).toBe(401)
  })

  test("POST /groups tokenilla → 201/200", async () => {
    const { token } = await registerAndLogin()
    const res = await request(app)
      .post(`${API}/groups/`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `Test group ${Date.now()}`,
        description: "Desc"
      })

    expect([200, 201]).toContain(res.statusCode)
    expect(res.body).toBeDefined()
  })
})
