import db from '../db/connectDB.js';
export const handleUpdateBio = async (bio, id) => {
    try {
        if (!id)
            throw new Error('User not Authenticated');
        const [result] =
            await db`
                UPDATE profile
                SET bio = ${bio}
                WHERE user_id = ${id}
                RETURNING *;
            `
        return { success: true, data: result };
    }
    catch (e) {
        console.log(e);
        throw new Error('Some Error Occurred.');
    }
}

export const handleGetUserProfile = async (id) => {
    try {
        if (!id)
            throw new Error('Credentials Required');
        const result =
            await db`
                SELECT * FROM profile
                WHERE user_id = ${id};
            `
        if (result.length == 0) {
            throw new Error('User not found');
        }
        const profile = result[0];
        return profile;
    }
    catch (e) {
        console.log(e);
        throw new Error('Some Error Occurred.');
    }
};

export const handleUpdateLastSeen = async (id) => {
    try {
        if (!id)
            throw new Error('Credentials Required');
        const result =
            await db`
                UPDATE profile
                SET last_seen = NOW()
                WHERE user_id = ${id};
            `
        return { success: true };
    }
    catch (e) {
        console.log(e);
        throw new Error('Some Error Occurred.');
    }
}

export const handleUpdateProfileImage = async (image, userId) => {
    const [prevUrl] = await db`SELECT profile_image FROM profile where user_id = ${userId}`
    const [updatedProfile] = await db`UPDATE profile SET profile_image = ${image} where user_id = ${userId} RETURNING *`;
    // console.log(prevUrl, typeof prevUrl, prevUrl.profile_image, prevUrl[0]);
    const prev = prevUrl.profile_image;
    return { prev, updatedProfile };
}
