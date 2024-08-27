# Lukewise

My personal Readwise clone (in active development 🚧)

## Development

`npm run dev`

### Drizzle / Turso

**Generate migrations**

`npx drizzle-kit generate`

**Run migrations**

`npx drizzle-kit migrate`

Alternatively, just push changes directly to the database:

`npx drizzle-kit push`

> Push command is good for situations where you need to quickly test new schema designs or changes in a local development environment, allowing for fast iterations without the overhead of managing migration files.
