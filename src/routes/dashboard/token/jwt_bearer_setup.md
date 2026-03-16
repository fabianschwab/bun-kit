# JWT and Bearer Token Setup in Your Applications

This document explains a scenario, how to use JWTs and Bearer tokens across two
applications:

- **App A:** Authentication app (issues tokens) using BetterAuth in this case
- **App B:** API app (validates tokens) using ElysiaJS from the `repo url goes here` repository

---

## 1. Key Concepts

### JWT (JSON Web Token)

- Self-contained token format containing claims such as user ID,
  roles, expiration.
- Signed with either:
  - **Symmetric algorithms:** `HS256`, `HS384`, `HS512`
  - **Asymmetric algorithms:** `RS256`, `ES256`

Example payload:

```json
{
	"sub": "12345",
	"name": "Alice",
	"exp": 1710000000
}
```

### Bearer Token

- A **token usage scheme** in HTTP.
- Sent via the `Authorization` header:

```html
Authorization: Bearer <token></token>
```

- "Bearer" means anyone with the token can access the resource.
- In modern APIs, a **Bearer token is often a JWT**, but it could also
  be an opaque token.

---

## 2. BetterAuth Utilities (App A)

BetterAuth provides:

- **`jwt` utility:** Creates and verifies JWTs.
- **`bearer` utility:** Validates incoming bearer tokens (expects
  token already issued).

**For this scenario:**

- **App A** → Use **`jwt`** to issue JWT tokens.
- **App B** → Use **`bearer`** to extract the token, and **`jwt`** to
  validate it.

---

## 3. ElysiaJS Plugins (App B)

ElysiaJS offers:

- **`jwt` plugin:** Sign or verify JWTs.
- **`bearer` plugin:** Middleware to extract tokens from the
  `Authorization` header.

Example setup:

```ts
import { Elysia } from "elysia";
import { jwt, bearer } from "@elysiajs/jwt";

const app = new Elysia();

// Step 1: Extract token from Authorization header
app.use(
  bearer({
    extractToken: (req) => req.headers.authorization?.split(" ")[1],
  }),
);

// Step 2: Verify JWT
app.use(
  jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"], // must match App A
  }),
);

app.get("/secure", (c) => {
  // c.token contains decoded JWT if valid
  return { user: c.token.sub };
});

app.listen(3000);
```

---

## 4. Flow Diagram

      ┌─────────────┐
      │   App A     │
      │(Auth Server)│
      │-------------│
      │ jwt.sign()  │
      └─────┬───────┘
            │ JWT Token
            ▼
         ┌────────┐
         │ Client │
         │(Browser│
         │  /App) │
         └───┬────┘
             │ Authorization: Bearer <JWT>
             ▼
      ┌─────────────┐
      │   App B     │
      │  (API)      │
      │-------------│
      │ bearer()    │  <- Extracts token from header
      │ jwt.verify()│  <- Validates token with secret
      └─────┬───────┘
            │
            ▼
      Protected Resource

---

## 5. Summary

---

App Utility / Plugin Purpose

---

**App A** `jwt` Issue JWTs for
logged-in users

**App B** `bearer` + `jwt` Extract token from
header and validate
it

---

**Notes:**

- Ensure **signing secret and algorithm match** between App A and App
  B.
- Clients always send tokens as `Authorization: Bearer <JWT>`.
- The `bearer` middleware extracts the token; the `jwt` plugin
  verifies it.
- This setup works for symmetric algorithms (HS256) and can be
  extended to asymmetric keys (RS256) if needed.
