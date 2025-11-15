import { useAuthStore } from "../store/auth";
import { useChatStore } from "../store/chat";
import { client } from "./gqlClient";

import { LOGIN, SIGNUP, SEND_MESSAGE, GET_UPLOAD_URL, UPDATE_PROFILE, UPDATE_PROFILE_IMAGE } from "./gqlMutation";
import { GET_USER_WITH_UNSEEN_MESSAGES, GET_MESSAGES_FOR_SELECTED_USER, GET_USER_WITH_PROFILE, GET_MY_PROFILE } from './gqlQuery';

export const gqlLogin = async (email, password) => {
    const res = await client.mutate({ mutation: LOGIN, variables: { email, password } });
    return res;
}

export const gqlSignup = async (name, email, password) => {
    const res = await client.mutate({
        mutation: SIGNUP,
        variables: { name, email, password }
    });
    return res;
}

export const getUsersAndMessages = async () => {
    const token = useAuthStore.getState().token;
    const res = await client.query({
        query: GET_USER_WITH_UNSEEN_MESSAGES, context: {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    });
    return res;
}

export const getMessagesForUser = async () => {
    const selectedUser = useChatStore.getState().selectedUser;
    if (!selectedUser?.id)
        return;
    const token = useAuthStore.getState().token;
    const res = await client.query({
        query: GET_MESSAGES_FOR_SELECTED_USER,
        variables: { userId: selectedUser.id },
        context: {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    });
    return res;
}

export const sendMessages = async (message, image) => {
    const selectedUser = useChatStore.getState().selectedUser;
    const token = useAuthStore.getState().token;
    const res = await client.mutate({
        mutation: SEND_MESSAGE,
        variables: {
            receiverId: selectedUser.id,
            text: message,
            image: image
        },
        context: {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    });
    return res;
}

export const gqlUploadImage = async (path, contentType) => {
    const token = useAuthStore.getState().token;
    const res = await client.mutate({
        mutation: GET_UPLOAD_URL,
        variables: { path, contentType },
        context: {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    });
    return res;
}

export const getMyProfile = async () => {
    const token = useAuthStore.getState().token;
    const res = await client.query({
        query: GET_MY_PROFILE,
        context: {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    });
    return res;
};

export const updateProfile = async (name, bio) => {
    const token = useAuthStore.getState().token;
    const res = await client.mutate({
        mutation: UPDATE_PROFILE,
        variables: { name, bio },
        context: {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    });
    return res;
};

export const updateProfileImage = async (imageUrl) => {
    const token = useAuthStore.getState().token;
    const res = await client.mutate({
        mutation: UPDATE_PROFILE_IMAGE,
        variables: { image: imageUrl },
        context: {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    });
    return res;
};