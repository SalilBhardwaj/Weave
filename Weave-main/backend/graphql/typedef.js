export const typeDefs =
    `
        scalar Date

        enum MessageStatus {
            UNDELIVERED
            DELIVERED
            SEEN
        }

        type User {
            id: ID!
            name: String!
            email: String!
            salt: String!
            password: String!
            profile: Profile!
            message: [Message!]
            unseenMessages: [Message!]
        }

        type Profile {
            userId: ID!
            profileImage: String
            bio: String
            lastSeen: Date
            createdAt: Date!
            user: User!
        }

        type Message {
            id: ID!
            senderId: ID!
            receiverId: ID!
            text: String
            image: String
            status: MessageStatus!
            createdAt: Date!
            count: Int
        }

        type AuthResponse {
            success: Boolean!
            token: String
            user: User
            message: String
        }
        type UrlResponse {
            success: Boolean!
            url: String
            key: String
        }

        type Query {
            getUserDetails (id: ID!) : User!
            getUsers: [User!]
            getMessagesForUser (userId: ID!): [Message!]
            getProfile : Profile!
        }

        type Mutation {
            signup (name: String!, email: String!, password: String!): AuthResponse!
            login (email: String!, password: String!): AuthResponse!
            updateProfile (bio: String, name: String): Profile!
            updateProfileImage (image: String!): Profile!
            updateLastSeen: Boolean
            getUploadUrl (contentType: String!, path: String!): UrlResponse!
            sendMessages(receiverId: ID!, text: String, image: String): Message!
        }
`