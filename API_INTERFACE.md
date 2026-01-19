# API Interface Guide for Habit Tracker Frontend

This document describes the API interface used by the frontend application. Backend developers should implement these endpoints to ensure compatibility with the frontend.

## Authentication

### POST /api/login
Login with username/email and password

Request:
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "token": "jwt_token",
  "user": {
    "id": number,
    "username": "string",
    "email": "string",
    "name": "string",
    "avatar": "string (optional)",
    "bio": "string (optional)",
    "tags": "string[] (optional)"
  }
}
```

### POST /api/register
Register a new user

Request:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "name": "string"
}
```

Response:
```json
{
  "id": number,
  "username": "string",
  "email": "string",
  "name": "string"
}
```

## User

### GET /api/me
Get current user profile

Response:
```json
{
  "id": number,
  "username": "string",
  "email": "string",
  "name": "string",
  "avatar": "string (optional)",
  "bio": "string (optional)",
  "tags": "string[] (optional)"
}
```

## Habits

### GET /api/habits
Get all habits for current user

Response:
```json
[
  {
    "id": number,
    "name": "string",
    "description": "string (optional)",
    "stats": {
      "streak": number,
      "completion_rate": number
    },
    "history": [
      {
        "date": "YYYY-MM-DD",
        "done": boolean
      }
    ],
    "competitionId": number (optional)
  }
]
```

### GET /api/habits/{id}
Get specific habit by ID

Response:
```json
{
  "id": number,
  "name": "string",
  "description": "string (optional)",
  "stats": {
    "streak": number,
    "completion_rate": number
  },
  "history": [
    {
      "date": "YYYY-MM-DD",
      "done": boolean
    }
  ],
  "competitionId": number (optional)
}
```

### PUT /api/habits/{id}/progress
Update progress for a habit on a specific date

Request:
```json
{
  "date": "YYYY-MM-DD",
  "done": boolean
}
```

Response:
```json
{
  "id": number,
  "name": "string",
  "description": "string (optional)",
  "stats": {
    "streak": number,
    "completion_rate": number
  },
  "history": [
    {
      "date": "YYYY-MM-DD",
      "done": boolean
    }
  ],
  "competitionId": number (optional)
}
```

### DELETE /api/habits/{id}
Delete a habit

Response:
```json
true
```

### POST /api/competitions/{id}/habits
Create a competition habit

Request:
```json
{
  "habitName": "string",
  "description": "string (optional)"
}
```

Response:
```json
{
  "id": number,
  "name": "string",
  "description": "string (optional)",
  "stats": {
    "streak": number,
    "completion_rate": number
  },
  "history": [],
  "competitionId": number
}
```

## Friends

### GET /api/friends
Get list of friends

Response:
```json
[
  {
    "id": number,
    "username": "string",
    "email": "string",
    "name": "string",
    "avatar": "string (optional)",
    "bio": "string (optional)",
    "tags": "string[] (optional)"
  }
]
```

### POST /api/friends
Add a friend by username

Request:
```json
{
  "username": "string"
}
```

Response:
```json
{
  "id": number,
  "username": "string",
  "email": "string",
  "name": "string",
  "avatar": "string (optional)",
  "bio": "string (optional)",
  "tags": "string[] (optional)"
}
```

### GET /api/users/{id}/habits
Get habits for a specific user (for friend's habits view)

Response:
```json
[
  {
    "id": number,
    "name": "string",
    "description": "string (optional)",
    "stats": {
      "streak": number,
      "completion_rate": number
    },
    "history": [
      {
        "date": "YYYY-MM-DD",
        "done": boolean
      }
    ],
    "competitionId": number (optional)
  }
]
```

## Comments

### GET /api/habits/{habitId}/comments
Get comments for a specific habit

Response:
```json
[
  {
    "id": number,
    "author": {
      "id": number,
      "username": "string",
      "email": "string",
      "name": "string",
      "avatar": "string (optional)",
      "bio": "string (optional)",
      "tags": "string[] (optional)"
    },
    "text": "string",
    "created_at": "ISO date string"
  }
]
```

### POST /api/habits/{habitId}/comments
Add a comment to a habit

Request:
```json
{
  "text": "string"
}
```

Response:
```json
{
  "id": number,
  "author": {
    "id": number,
    "username": "string",
    "email": "string",
    "name": "string",
    "avatar": "string (optional)",
    "bio": "string (optional)",
    "tags": "string[] (optional)"
  },
  "text": "string",
  "created_at": "ISO date string"
}
```

## Competitions

### GET /api/competitions
Get all competitions

Response:
```json
[
  {
    "id": number,
    "name": "string",
    "description": "string",
    "owner": {
      "id": number,
      "username": "string",
      "email": "string",
      "name": "string"
    },
    "members": [
      {
        "id": number,
        "username": "string",
        "email": "string",
        "name": "string"
      }
    ]
  }
]
```

### POST /api/competitions
Create a new competition

Request:
```json
{
  "name": "string",
  "description": "string (optional)",
  "memberIds": "number[]",
  "habitName": "string"
}
```

Response:
```json
{
  "id": number,
  "name": "string",
  "description": "string",
  "owner": {
    "id": number,
    "username": "string",
    "email": "string",
    "name": "string"
  },
  "members": [
    {
      "id": number,
      "username": "string",
      "email": "string",
      "name": "string"
    }
  ]
}
```

### GET /api/competitions/{id}
Get specific competition by ID

Response:
```json
{
  "id": number,
  "name": "string",
  "description": "string",
  "owner": {
    "id": number,
    "username": "string",
    "email": "string",
    "name": "string"
  },
  "members": [
    {
      "id": number,
      "username": "string",
      "email": "string",
      "name": "string"
    }
  ]
}
```