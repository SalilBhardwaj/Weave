import { gql } from "@apollo/client"

export const GET_USERS =
    gql`query GetUsers {
        getUsers {
            email
            name
            id    
        }
}`

export const GET_USER_WITH_UNSEEN_MESSAGES =
    gql`query getUsersAndUnseenMessages {
        getUsers {
            id
            name
            email
            unseenMessages {
                count
            }
            profile {
                lastSeen
                profileImage
                bio
            }
        }
} `

export const GET_USER_WITH_PROFILE =
    gql`query getUserAndUnseenMessages($id: ID!) {
        getUsers(id: $id) {
            id
            name
            email
            profile {
                lastSeen
                profileImage
                bio
            }
        }
} `

export const GET_MESSAGES_FOR_SELECTED_USER =
    gql`query getMessage($userId: ID!){
        getMessagesForUser(userId: $userId){
            senderId
            receiverId
            createdAt
            text
            image
            id
        }
    }`

export const GET_MY_PROFILE =
    gql`query PROFILE{
        getProfile{
            lastSeen
            profileImage
            bio
        }
    }`