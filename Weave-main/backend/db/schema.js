import db from './connectDB.js';

const createUserTable = async () => {
    await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                name varchar(50) NOT NULL,
                email varchar(254) UNIQUE NOT NULL,
                salt varchar(32) NOT NULL,
                password text NOT NULL
            );
        `);
};

const createProfileTable = async () => {
    await db.query(`
            CREATE TABLE IF NOT EXISTS profile (
                user_id uuid NOT NULL UNIQUE REFERENCES "users"(id) ON DELETE CASCADE,
                profile_image text,
                bio text,
                last_seen timestamptz,
                created_at timestamptz DEFAULT now()
            );
        `);
};

const createMessagesTable = async () => {
    await db.query(`
            CREATE TABLE IF NOT EXISTS message (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                sender_id uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
                receiver_id uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
                text text,
                image text,
                status message_status NOT NULL DEFAULT 'undelivered',
                created_at timestamptz NOT NULL DEFAULT now()
            );
        `);
};

export const initDB = async () => {
    await createUserTable();
    await createProfileTable();
    await createMessagesTable();
    console.log('All Tables Created');
};