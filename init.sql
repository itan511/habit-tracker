CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friend
        FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_habit_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS habit_history (
    id SERIAL PRIMARY KEY,
    habit_id INT NOT NULL,
    date DATE NOT NULL,
    done BOOLEAN NOT NULL,

    CONSTRAINT fk_history_habit
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,

    CONSTRAINT unique_habit_day UNIQUE (habit_id, date)
);

