import { jest } from "@jest/globals"
import request from "supertest"

const dbMock = { query: jest.fn() }

jest.unstable_mockModule("../helpers/db.js", () => ({
    default: dbMock,
    query: dbMock.query
}))

const app = (await import("../index.js")).default

describe("POST /api/users/register", () => {
    beforeEach(() => {
        dbMock.query.mockReset()
    })

    test("registers new user successfully", async () => {
        dbMock.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({
                rows: [
                    {
                        id: "7f5b715e-5c21-464d-8fdf-b359a6dfe3da",
                        email: "test@test.com",
                        username: "testuser"
                    }
                ]
            })

        const res = await request(app)
            .post("/api/users/register")
            .send({
                email: "test@test.com",
                username: "testuser",
                password: "Testi123"
            })
            .expect(201)

        expect(res.body).toHaveProperty("id")
        expect(res.body.email).toBe("test@test.com")
        expect(res.body.username).toBe("testuser")
    })

    test("fails if user already exists", async () => {
        dbMock.query.mockResolvedValueOnce({
            rows: [{ id: "existing-id", email: "test@test.com", username: "testuser" }]
        })

        const res = await request(app)
            .post("/api/users/register")
            .send({
                email: "test@test.com",
                username: "testuser",
                password: "Testi123"
            })
            .expect(400)

        expect(res.body).toHaveProperty("error")
    })
})
