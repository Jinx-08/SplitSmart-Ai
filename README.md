# Splitwise-AI

Professional reference for the API routes currently implemented in this repository.

## Overview

- All request bodies are JSON.
- Path params are shown as `:id` placeholders.
- Validation rules are enforced via `express-validator`.
- Protected routes require an `Authorization: Bearer <token>` header.

## Base paths

Routes are mounted by the server. Adjust examples to your actual mount points, such as:

- Auth: `/api/auth`
- Expenses: `/api/expenses`
- Groups: `/api/groups`

## Auth routes (Backend/routes/authRoutes.js)

### POST /register

Create a new user account.

Request body:
- `first_name` (string, required)
- `last_name` (string, required)
- `email` (string, required, valid email)
- `password` (string, required, min length 6)

Example:

```json
{
  "first_name": "Taylor",
  "last_name": "Lee",
  "email": "taylor@example.com",
  "password": "secret123"
}
```

Response body:
- `message` (string)
- `user` (object)
- `token` (string) - Supabase access token

### POST /login

Authenticate a user.

Request body:
- `email` (string, required, valid email)
- `password` (string, required)

Example:

```json
{
  "email": "taylor@example.com",
  "password": "secret123"
}
```

Response body:
- `message` (string)
- `user` (object)
- `token` (string) - Supabase access token

### GET /me

Fetch the current authenticated user.

Headers:
- `Authorization` (string, required) - `Bearer <token>`

Response body:
- `id` (string)
- `email` (string)
- `first_name` (string, nullable)
- `last_name` (string, nullable)
- `avatar_url` (string, nullable)
- `message` (string)

### POST /logout

Logout the current user.

Headers:
- `Authorization` (string, required) - `Bearer <token>`

### PUT /profile

Update the current user's profile.

Headers:
- `Authorization` (string, required) - `Bearer <token>`

Request body (all optional):
- `first_name` (string)
- `last_name` (string)
- `email` (string, valid email)
- `password` (string, min length 6)

## Expense routes (Backend/routes/expenseRoutes.js)

All expense routes require authentication.

### POST /add

Create a new expense.

Request body:
- `group_id` (string, required)
- `amount` (number, required, > 0)
- `split_type` (string, required, `equal` or `unequal`)
- `date` (string, required, ISO 8601 date)
- `category` (string, required)

Example:

```json
{
  "group_id": "group_123",
  "amount": 42.5,
  "split_type": "equal",
  "date": "2026-05-25",
  "category": "Food"
}
```

### GET /group/:id/expenses

List expenses for a group.

Path params:
- `id` (string, required) - Group ID

### DELETE /delete/:id

Delete an expense.

Path params:
- `id` (string, required) - Expense ID

### PUT /update/:id

Update an expense.

Path params:
- `id` (string, required) - Expense ID

Request body:
- `group_id` (string, required)
- `amount` (number, required, > 0)
- `split_type` (string, required, `equal` or `unequal`)
- `date` (string, required, ISO 8601 date)
- `category` (string, required)

Example:

```json
{
  "group_id": "group_123",
  "amount": 55.0,
  "split_type": "unequal",
  "date": "2026-05-25",
  "category": "Travel"
}
```

### POST /expense/:id/recipients

Split an expense across recipients.

Path params:
- `id` (string, required) - Expense ID

Request body:
- The payload is defined by `splitExpense` in the controller.

## Group routes (Backend/routes/groupRoutes.js)

### POST /groups

Create a new group.

Request body:
- `name` (string, required)
- `members` (array, required, min 2 items)

Example:

```json
{
  "name": "Roommates",
  "members": ["user_1", "user_2"]
}
```

### GET /group/:id

Fetch a group by ID.

Path params:
- `id` (string, required) - Group ID

### POST /groups/:id/invite

Invite a user to a group.

Path params:
- `id` (string, required) - Group ID

Request body:
- `user_id` (string, required)
- `role` (string, required, `member` or `admin`)

Example:

```json
{
  "user_id": "user_3",
  "role": "member"
}
```

### POST /groups/:id/remove

Remove a user from a group.

Path params:
- `id` (string, required) - Group ID

Request body:
- `user_id` (string, required)

Example:

```json
{
  "user_id": "user_2"
}
```
