"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const typeDef = apollo_server_express_1.gql `

scalar Date

type User {
    id: ID!
    email: String!
}

input SignUpInput {
    email: String!
    password: String!
}

type SignUpPayload {
    user: User!
}

input SignInInput {
    email: String!
    password: String!
}

type SignInPayload {
    user: User
}

type DeleteUserPayload {
    user: User
}

type Subscriptions {
    mqttTopics(topics:[String]!): [String]!
}

type Query {
    user(id:ID!): User
    userByName(name:String!): [User]!
    users: [User]
    viewer: User
}

type Mutation {
    signUp(input: SignUpInput!): SignUpPayload!
    signIn(input: SignInInput!): SignInPayload!
    signOut: Boolean!
    deleteMyself: DeleteUserPayload!
    deleteUser(id: ID!): DeleteUserPayload!
}
`;
exports.default = typeDef;
