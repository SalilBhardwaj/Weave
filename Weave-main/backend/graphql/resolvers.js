import { handleLogin, handleSignup } from "../controllers/auth.js";
import { handleGetUserDetails, handleUpdateUserName, handleGetUserFriends, handleGetUsers } from "../controllers/user.js";
import { handleUpdateBio, handleGetUserProfile, handleUpdateProfileImage } from '../controllers/profile.js';
import { deleteObject, getUploadUrls3 } from '../utlis/s3.js';
import camelcaseKeys from 'camelcase-keys';
import { GraphQLError } from 'graphql';
import { getMessagesForUser, getUndeliveredMessages, sendMessage } from "../controllers/message.js";
import { io, userSocketMap } from "../server.js";

export const resolvers = {
    Query: {
        getUserDetails: async (_, { id }) => {
            if (!context.isAuthenticated) {
                throw new GraphQLError('You are not authorized to perform this action.', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }
            return camelcaseKeys(await handleGetUserDetails({ email: null, id: id }));
        },
        getUsers: async (_, args, context) => {
            if (!context.isAuthenticated) {
                throw new GraphQLError('You are not authorized to perform this action.', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }
            return camelcaseKeys(await handleGetUsers(context.user.id));
        },
        getMessagesForUser: async (_, { userId }, context) => {
            if (!context.isAuthenticated) {
                throw new GraphQLError('You are not authorized to perform this action.', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }
            const result = await getMessagesForUser(userId, context.user.id);
            return camelcaseKeys(result.data);
        },
        getProfile: async (_, { }, context) => {
            if (!context.isAuthenticated) {
                throw new GraphQLError('You are not authorized to perform this action.', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }
            const result = await handleGetUserProfile(context.user.id);
            return camelcaseKeys(result);
        },
    },
    User: {
        profile: async (parent) => {
            return camelcaseKeys(await handleGetUserProfile(parent.id));
        },
        unseenMessages: async (parent, { }, context) => {
            const result = camelcaseKeys((await getUndeliveredMessages(parent.id, context.user.id)));
            return camelcaseKeys(result.data);
        }
    },
    Profile: {
        user: async (parent) => {
            return camelcaseKeys(await handleGetUserDetails({ id: parent.userId }));
        }
    },
    Mutation: {
        login: async (_, { email, password }) => {
            try {
                const result = await handleLogin(email, password);
                return { success: true, token: result.token, user: result.user, message: "Login Successful" };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },
        signup: async (_, { name, email, password }) => {
            try {
                const result = await handleSignup(name, email, password);
                io.emit("refreshUsers");
                return { success: true, message: "Account Created Successfully." };
            } catch (e) {
                console.log(e);
                return { success: false, error: e.message };
            }
        },
        updateProfile: async (_, { bio, name }, context) => {
            if (!context.isAuthenticated) {
                throw new GraphQLError('You are not authorized to perform this action.', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }
            if (name) {
                await handleUpdateUserName(name, context.user.id);
            }
            if (bio) {
                await handleUpdateBio(bio, context.user.id);
            }
            const profile = camelcaseKeys(await handleGetUserProfile(context.user.id));
            return profile;
        },
        getUploadUrl: async (_, { path, contentType }, context) => {
            if (!context.isAuthenticated) {
                throw new GraphQLError("You are not authorized to perform this acction."),
                {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    }
                }
            }
            const uploadUrl = await getUploadUrls3(path, contentType);
            // console.log(uploadUrl);
            return { success: true, url: uploadUrl.url, key: uploadUrl.key };
        },
        sendMessages: async (_, { receiverId, text, image }, context) => {
            if (!context.isAuthenticated) {
                throw new GraphQLError('You are not authorized to perform this action.', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }
            try {
                const res = await sendMessage(context.user.id, receiverId, text, image, userSocketMap);
                // console.log(camelcaseKeys(res.data));
                return camelcaseKeys(res.data);
            } catch (e) {
                throw new GraphQLError(e.message, {
                    extensions: {
                        code: 'ERROR',
                    },
                });
            }
        },
        updateProfileImage: async (_, { image }, context) => {
            if (!context.isAuthenticated) {
                throw new GraphQLError('You are not authorized to perform this action.', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }
            try {
                const { prev, updatedProfile } = await handleUpdateProfileImage(image, context.user.id);
                // console.log('prevUrl', prev);
                const arr = prev?.split('/');
                let key;
                if (arr.length > 0) {
                    key = arr[arr.length - 2] + '/' + arr[arr.length - 1];
                }
                await deleteObject(key);
                return camelcaseKeys(updatedProfile);
            } catch (e) {
                console.log(e);
                throw new GraphQLError('Failed to update profile image', {
                    extensions: {
                        code: 'INTERNAL_SERVER_ERROR',
                        originalError: e.message,
                    },
                });
            }
        }
    }
}