import { gql } from "@apollo/client"

export const LOGIN =
    gql`mutation Mutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
        user {
            email
            name
            id
        }
        message
        token
        success
    }
}`;

export const SIGNUP = gql`
    mutation Mutation($email: String!, $password: String!, $name: String!) {
        signup(name: $name, email: $email, password: $password) {
            success
            message
        }
    }`;

export const SEND_MESSAGE =
    gql`mutation Mutation($receiverId: ID!, $image: String, $text: String){
    sendMessages(receiverId: $receiverId, text: $text, image: $image){
        id
        senderId
        receiverId
        text
        image
        createdAt
    }
}`

export const GET_UPLOAD_URL =
    gql` mutation getUrl($path: String!, $contentType: String!){
        getUploadUrl(path: $path, contentType: $contentType){
            url
            key
            success
        }
    }`

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($bio: String, $name: String) {
    updateProfile(bio: $bio, name: $name) {
      bio
      profileImage
      userId
    }
  }
`;

export const UPDATE_PROFILE_IMAGE = gql`
  mutation UpdateProfileImage($image: String!) {
    updateProfileImage(image: $image) {
      bio
      profileImage
      userId
    }
  }
`;
