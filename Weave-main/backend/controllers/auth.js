import db from '../db/connectDB.js';
import { genSalt } from 'bcrypt';
import { createToken } from '../utlis/token.js';
import { hashPassword, validatePassword } from '../utlis/hash.js';

export const handleLogin = async (email, password) => {
    try {
        if (!email || !password)
            throw new Error('Credentials Required');
        const result =
            await db`
                SELECT * FROM users
                WHERE email = ${email};
            `
        if (result.length == 0) {
            throw new Error('User not found');
        }
        const user = result[0];
        if (!user) {
            throw new Error('User not found');
        }
        if (!validatePassword(password, user.password, user.salt)) {
            throw new Error('Invalid Password');
        }
        const token = createToken(user.name, user.id, user.email);
        return { user, token };
    }
    catch (e) {
        console.log(e);
        throw new Error('Some Error Occurred.');
    }
}

export const handleSignup = async (name, email, password) => {
    if (!email || !password || !name)
        throw new Error('Credentials Required');

    const result = await db`SELECT email FROM users where email = ${email}`;
    if (result.length > 0) {
        throw new Error('User Already Exists');
    }

    const salt = await genSalt(10);
    const hashedPassword = await hashPassword(password, salt);
    try {
        await db`
            INSERT INTO users (name, email, salt, password)
            VALUES (${name} , ${email}, ${salt}, ${hashedPassword});
        `
        const res = await db`SELECT id FROM users where email = ${email} LIMIT 1`;
        await db`INSERT INTO profile(user_id) VALUES (${res[0].id})`;
        return { success: true };
    } catch (e) {
        console.log(e);
        throw e;
    }
}