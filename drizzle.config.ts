import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://alas_user:change-this-strong-password@localhost:5432/alas",
  }
})
