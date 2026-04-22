# Profile Intelligence Service

A REST API that accepts a name, enriches it using three external APIs (Genderize, Agify, Nationalize), stores the result in PostgreSQL, and exposes endpoints to retrieve, filter, and delete profiles.

---

## Tech Stack

- **Node.js** — runtime
- **Express.js** — web framework
- **PostgreSQL** — database
- **pg** — PostgreSQL client for Node
- **dotenv** — environment variable management

---

## Project Structure

```
profile-intelligence/
├── src/
│   ├── apis/
│   │   ├── agify.js          # Fetches age from Agify API
│   │   ├── genderize.js      # Fetches gender from Genderize API
│   │   └── nationalize.js    # Fetches nationality from Nationalize API
│   ├── controllers/
│   │   └── profileController.js  # Request handlers for all endpoints
│   ├── middlewares/
│   │   └── errorHandler.js   # Global error handler
│   ├── routes/
│   │   └── profiles.js       # Route definitions
│   ├── utils/
│   │   ├── enrichment.js     # Calls all 3 APIs concurrently
│   │   ├── profileRepository.js  # All database queries
│   │   └── uuidv7.js         # UUID v7 generator
│   ├── app.js                # Express app setup
│   ├── db.js                 # DB connection + table creation
│   └── index.js              # Entry point
├── .env                      # Environment variables (do not commit)
├── .gitignore
└── package.json
```

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd profile-intelligence
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your `.env` file

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=profile_intelligence
```

### 4. Create the PostgreSQL database

```bash
psql -U postgres
```

```sql
CREATE DATABASE profile_intelligence;
\q
```

> The table `profiles` is created **automatically** when the server starts. You do not need to run any SQL manually.

### 5. Start the server

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

You should see:

```
✅ PostgreSQL connected
✅ Table ready
🚀 Server running on http://localhost:3000
```

---

## API Endpoints

### Base URL
```
http://localhost:3000
```

---

### POST `/api/profiles`

Creates a new profile by enriching the given name using Genderize, Agify, and Nationalize APIs, then stores the result.

**Request body:**
```json
{
  "name": "emma"
}
```

**Success response `201`:**
```json
{
  "status": "success",
  "data": {
    "id": "019da674-8b1c-7d97-b42b-8f96867d432e",
    "name": "emma",
    "gender": "female",
    "gender_probability": 0.98,
    "sample_size": 123456,
    "age": 37,
    "age_group": "adult",
    "country_id": "US",
    "country_probability": 0.12,
    "created_at": "2026-04-22T10:00:00Z"
  }
}
```

**If the same name is submitted again `200`:**
```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": { "...existing profile..." }
}
```

---

### GET `/api/profiles`

Returns all profiles. Supports optional filters via query params.

**No filters:**
```
GET /api/profiles
```

**With filters (all case-insensitive):**
```
GET /api/profiles?gender=female
GET /api/profiles?country_id=US
GET /api/profiles?age_group=adult
GET /api/profiles?gender=female&country_id=US&age_group=adult
```

**Success response `200`:**
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "019da674-8b1c-7d97-b42b-8f96867d432e",
      "name": "emma",
      "gender": "female",
      "age": 37,
      "age_group": "adult",
      "country_id": "US"
    }
  ]
}
```

---

### GET `/api/profiles/:id`

Returns a single profile by its UUID.

```
GET /api/profiles/019da674-8b1c-7d97-b42b-8f96867d432e
```

**Success response `200`:**
```json
{
  "status": "success",
  "data": {
    "id": "019da674-8b1c-7d97-b42b-8f96867d432e",
    "name": "emma",
    "gender": "female",
    "gender_probability": 0.98,
    "sample_size": 123456,
    "age": 37,
    "age_group": "adult",
    "country_id": "US",
    "country_probability": 0.12,
    "created_at": "2026-04-22T10:00:00Z"
  }
}
```

---

### DELETE `/api/profiles/:id`

Deletes a profile by its UUID.

```
DELETE /api/profiles/019da674-8b1c-7d97-b42b-8f96867d432e
```

**Success response:** `204 No Content` (empty body)

---

## Age Group Classification

| Age Range | Group      |
|-----------|------------|
| 0 – 12    | child      |
| 13 – 19   | teenager   |
| 20 – 59   | adult      |
| 60+       | senior     |

---

## Error Responses

All errors follow this structure:

```json
{
  "status": "error",
  "message": "description of the error"
}
```

| Status Code | Meaning                                      |
|-------------|----------------------------------------------|
| 400         | Missing or empty `name`                      |
| 404         | Profile not found                            |
| 422         | `name` is not a string                       |
| 502         | One of the external APIs returned bad data   |
| 500         | Unexpected server error                      |

**502 error shape:**
```json
{
  "status": "502",
  "message": "Genderize returned an invalid response"
}
```
> `Genderize` will be replaced by `Agify` or `Nationalize` depending on which API failed.

---

## External APIs Used

| API          | URL                                      | Data returned               |
|--------------|------------------------------------------|-----------------------------|
| Genderize    | https://api.genderize.io?name={name}     | gender, probability, count  |
| Agify        | https://api.agify.io?name={name}         | age                         |
| Nationalize  | https://api.nationalize.io?name={name}   | country list + probability  |

All APIs are free and require no API key.

---

## Testing with Postman

### Setup
1. Open Postman
2. Go to **Environments** → **New**
3. Add a variable: `base_url` = `http://localhost:3000`
4. Use `{{base_url}}/api/profiles` in all your requests

### Test Order

| # | Method | URL | Body |
|---|--------|-----|------|
| 1 | POST | `{{base_url}}/api/profiles` | `{"name": "emma"}` |
| 2 | POST | `{{base_url}}/api/profiles` | `{"name": "emma"}` — tests idempotency |
| 3 | POST | `{{base_url}}/api/profiles` | `{}` — expects 400 |
| 4 | POST | `{{base_url}}/api/profiles` | `{"name": ""}` — expects 400 |
| 5 | POST | `{{base_url}}/api/profiles` | `{"name": 123}` — expects 422 |
| 6 | GET  | `{{base_url}}/api/profiles` | — |
| 7 | GET  | `{{base_url}}/api/profiles?gender=female` | — |
| 8 | GET  | `{{base_url}}/api/profiles/:id` | — |
| 9 | GET  | `{{base_url}}/api/profiles/00000000-0000-7000-8000-000000000000` | expects 404 |
| 10 | DELETE | `{{base_url}}/api/profiles/:id` | — expects 204 |
| 11 | DELETE | `{{base_url}}/api/profiles/:id` | same id — expects 404 |

---

## Environment Variables

| Variable      | Description                  | Default               |
|---------------|------------------------------|-----------------------|
| `PORT`        | Port the server runs on      | `3000`                |
| `DB_HOST`     | PostgreSQL host              | `localhost`           |
| `DB_PORT`     | PostgreSQL port              | `5432`                |
| `DB_USER`     | PostgreSQL username          | `postgres`            |
| `DB_PASSWORD` | PostgreSQL password          | —                     |
| `DB_NAME`     | PostgreSQL database name     | `profile_intelligence`|

---

## Notes

- All timestamps are in **UTC ISO 8601** format
- All IDs are **UUID v7** (time-ordered)
- Names are stored in **lowercase**
- Filters are **case-insensitive**
- CORS is enabled for all origins (`*`)
- The `profiles` table is created automatically on server start — no manual SQL needed
