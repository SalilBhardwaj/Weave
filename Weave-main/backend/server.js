import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { Server } from "socket.io";

import { createServer } from "http";

import { typeDefs } from './graphql/typedef.js';
import { resolvers } from './graphql/resolvers.js';

const PORT = process.env.PORT || 8000;
// const loggingPlugin = {
//     async requestDidStart(requestContext) {
//         const { request } = requestContext;
//         console.log('📤 GQL Server Request:', { operationName: request.operationName, query: request.query, variables: request.variables });
//         const start = Date.now();
//         return {
//             async willSendResponse(ctx) {
//                 const ms = Date.now() - start;
//                 console.log('📥 GQL Server Response:', { tookMs: ms, errors: ctx.response.body?.kind === 'single' ? ctx.response.body.singleResult.errors : undefined });
//             },
//         };
//     },
// };


import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { authContext } from './middlewares/auth.js';

import { initDB } from './db/schema.js';

const app = express();
const httpServer = createServer(app);
app.use(cors({
    origin: 'https://weavee.pages.dev',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

export const io = new Server(httpServer, {
    cors: {
        origin: 'https://weavee.pages.dev',
        credentials: true
    }
});

export const userSocketMap = {}; // {userId: socketId }

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if (userId)
        userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("disconnect", async () => {
        console.log("User Disconnected", userId);
        // if (userId && userId !== undefined) {
        //     await handleUpdateLastSeen(userId);
        // }
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

app.use(express.json());

const server = new ApolloServer({
    typeDefs,
    resolvers
});

const startServer = async () => {
    await server.start();

    app.use('/graphql', expressMiddleware(server, {
        context: authContext
    }));

    app.get('/', (req, res) => {
        res.send('server up and running');
    });

    app.get('/init', async (req, res) => {
        await initDB();
        res.send("done");
    });

    httpServer.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}/`);
        console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
        console.log(`Socket.IO ready on ws://localhost:${PORT}`);
    });
}
startServer();