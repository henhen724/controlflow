import { gql } from 'apollo-server-express';
import mongoose from 'mongoose';

export interface user {
    id: mongoose.Types.ObjectId,
    hash: string,
    salt: string,
    email: string,
}

const typeDef = gql`

scalar Date

scalar JSON

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

input MQTTPublishInput {
    topic: String!
    payload: JSON
}

input RecordTopicInput {
    topic: String!
    experationTime: Int!
}

type DataPacket {
    data: JSON
}

type SuccessBoolean {
    success:Boolean!
}

type Subscription {
    mqttTopics(topics:[String]!):DataPacket!
}

type BufferInfo {
    topic: String!
    experationTime: Int!
}

type Query {
    user(id:ID!): User
    userByName(name:String!): [User]!
    users: [User]
    viewer: User
    runningBuffers: [BufferInfo]
}

type Mutation {
    signUp(input: SignUpInput!): SignUpPayload!
    signIn(input: SignInInput!): SignInPayload!
    signOut: Boolean!
    deleteMyself: DeleteUserPayload!
    deleteUser(id: ID!): DeleteUserPayload!
    mqttPublish(input:MQTTPublishInput!): SuccessBoolean!
    recordTopic(input:RecordTopicInput!): SuccessBoolean!
}
`
export default typeDef;