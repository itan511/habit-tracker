CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    user_id INT,
    name TEXT,
    description TEXT
)

CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    user_id INT,
    name TEXT,
    description TEXT
)

CREATE TABLE IF NOT EXISTS habit_history (
    habit_id INT,
    date DATE,
    done BOOLEAN
)

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    habit_id INT,
    user_id INT,
    text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)