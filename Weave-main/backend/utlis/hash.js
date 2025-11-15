import { hash, compare } from 'bcrypt';

export const hashPassword = async (password, salt) => {
    const hashedPassword = await hash(password, salt);
    return hashedPassword;
}

export const validatePassword = async (password, hashedPassword) => {
    return await compare(password, hashedPassword);
}