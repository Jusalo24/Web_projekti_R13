import { request, app, API, registerAndLogin, makeEmail, registerUser, loginUser } from "./testUtils.js"

describe("Users API", () => {
  describe("POST /users/register", () => {
    test("rekisteröinti onnistuu oikealla datalla", async () => {
      const email = makeEmail()
      const res = await registerUser({
        email,
        username: `testuser_${Date.now()}`,
        password: "Password123!"
      })

      expect([200, 201]).toContain(res.statusCode)
      expect(res.body).toBeDefined()
      // Prefer id if your API returns it
      if (res.body && typeof res.body === "object") {
        expect(Object.keys(res.body).length).toBeGreaterThan(0)
      }
    })

    test("rekisteröinti epäonnistuu puuttuvilla kentillä → 400", async () => {
      const res = await request(app)
        .post(`${API}/users/register`)
        .send({ email: makeEmail() }) // missing username/password
      expect([400, 422]).toContain(res.statusCode)
    })
  })

  describe("POST /users/login", () => {
    test("login onnistuu ja palauttaa tokenin", async () => {
      const { email, password } = await registerAndLogin()
      const res = await loginUser({ email, password })
      expect(res.statusCode).toBe(200)

      const token =
        res.body?.token ||
        res.body?.accessToken ||
        res.body?.jwt ||
        res.body?.data?.token

      expect(token).toBeTruthy()
    })

    test("login epäonnistuu väärällä salasanalla → 401", async () => {
      const email = makeEmail()
      const username = `testuser_${Date.now()}`
      const password = "Password123!"
      const reg = await registerUser({ email, username, password })
      expect([200, 201]).toContain(reg.statusCode)

      const res = await loginUser({ email, password: "WRONG_PASSWORD" })
      expect([401, 403]).toContain(res.statusCode)
    })
  })

  describe("GET /users/me (protected)", () => {
    test("ilman tokenia → 401", async () => {
      const res = await request(app).get(`${API}/users/me`)
      expect(res.statusCode).toBe(401)
    })

    test("tokenilla → 200 ja palauttaa käyttäjän", async () => {
      const { token } = await registerAndLogin()
      const res = await request(app)
        .get(`${API}/users/me`)
        .set("Authorization", `Bearer ${token}`)

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty("id")
      expect(res.body).toHaveProperty("email")
      expect(res.body).toHaveProperty("username")
    })
  })
})
