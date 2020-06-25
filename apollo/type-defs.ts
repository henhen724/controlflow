import { gql } from 'apollo-server-micro';

const typeDef = gql`

scalar Date

type User {
    id: ID!
    hash: String!
    salt: String!
    name: String!
}

input SignUpInput {
    name: String!
    password: String!
}

type SignUpPayload {
    user: User!
}

input SignInInput {
    name: String!
    password: String!
}

type SignInPayload {
    user: User
}

type DeleteUserPayload {
    user: User
}

type Query {
    user(id:ID!): User!
    userByName(name:String!): [User]!
    users: [User]!
    viewer: User
}

type Mutation {
    signUp(input: SignUpInput!): SignUpPayload!
    signIn(input: SignInInput!): SignInPayload!
    signOut: Boolean!
    deleteMyself: DeleteUserPayload!
    deleteUser(id: ID!): DeleteUserPayload!
}
`
export default typeDef;