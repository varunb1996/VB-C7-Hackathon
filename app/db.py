import psycopg2
import psycopg2.extras
import os

DATABASE_URL = os.environ.get("DATABASE_URL")


def get_conn():
    conn = psycopg2.connect(DATABASE_URL)
    return conn


def init_db():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS features (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS golden_cases (
            id SERIAL PRIMARY KEY,
            feature_id INTEGER NOT NULL REFERENCES features(id),
            input TEXT NOT NULL,
            expected_output TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS rubrics (
            id SERIAL PRIMARY KEY,
            feature_id INTEGER UNIQUE NOT NULL REFERENCES features(id),
            dimensions_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS runs (
            id SERIAL PRIMARY KEY,
            feature_id INTEGER NOT NULL REFERENCES features(id),
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS grades (
            id SERIAL PRIMARY KEY,
            run_id INTEGER NOT NULL REFERENCES runs(id),
            golden_case_id INTEGER NOT NULL REFERENCES golden_cases(id),
            actual_output TEXT NOT NULL,
            verdict TEXT NOT NULL,
            reasoning TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    conn.commit()
    cur.close()
    conn.close()
