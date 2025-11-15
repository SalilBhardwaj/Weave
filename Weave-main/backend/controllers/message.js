import camelcaseKeys from 'camelcase-keys';
import db from '../db/connectDB.js';
import { io } from '../server.js';

export const getMessagesForUser = async (user1, user2) => {
    if (!user1 || !user2)
        return { success: false, message: "Users undefined" };
    try {
        const result = await db`
            SELECT * FROM message
            WHERE (sender_id = ${user1} AND receiver_id = ${user2}) OR (receiver_id = ${user1} AND sender_id = ${user2})
            ORDER BY created_at DESC
        `;
        return { success: true, data: result };
    }
    catch (e) {
        return { success: false, error: e.message };
    }
}
export const getUndeliveredMessages = async (senderId, receiverId) => {
    if (!senderId) return { success: false, message: "Users undefined" };
    try {
        const result = await db`
      SELECT *,COUNT(*) AS count FROM message
      WHERE sender_id = ${senderId} AND receiver_id = ${receiverId} AND status = 'undelivered'
      GROUP BY message.id
      ORDER BY created_at DESC
    `;
        return { success: true, data: result };
    } catch (e) {
        console.log(e);
        return { success: false, error: e.message };
    }
};

export const sendMessage = async (senderId, receiverId, text, image, userSocketMap) => {
    console.log(senderId, receiverId, text, image, userSocketMap);
    if (!senderId || !receiverId) return { success: false, message: "Users undefined" };

    try {
        const fakeId = `temp-${Date.now()}`;
        const fakeMessage = {
            id: fakeId,
            senderId: senderId,
            receiverId: receiverId,
            text: text,
            image: image,
            createdAt: Date.now()
        };
        io.to(userSocketMap[receiverId]).emit("newMessage", camelcaseKeys(fakeMessage));

        const [inserted] = await db`
            INSERT INTO message (sender_id, receiver_id, text, image)
            VALUES (${senderId}, ${receiverId}, ${text}, ${image})
            RETURNING *
            `;
        let returned = inserted;

        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            const [updated] = await db`
            UPDATE message
            SET status = 'delivered'
            WHERE id = ${inserted.id}
            RETURNING *
            `;
            io.to(receiverSocketId).emit("updateMessage", { fakeId, message: camelcaseKeys(returned) });
            returned = updated;
        }
        return { success: true, data: returned };
    } catch (e) {
        console.log(e);
        return { success: false, error: e.message };
    }
};
