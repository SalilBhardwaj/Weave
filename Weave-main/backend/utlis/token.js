import jwt from 'jsonwebtoken';

export const createToken = (name, id, email) => {
    const token = jwt.sign({ id, email, name }, process.env.SECRET_KEY, { expiresIn: '24h' });
    return token;
}

export const validateToken = (token) => {
    try {
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        return payload;
    } catch (e) {
        throw new Error('Invalid Token');
    }
}