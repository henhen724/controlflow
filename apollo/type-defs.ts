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

type SignInPayload {
    user: User
}

type DeleteUserPayload {
    user: User
}

input SignInInput {
    email: String!
    password: String!
}

input MQTTPublishInput {
    topic: String!
    payload: JSON
}

input RecordTopicInput {
    topic: String!
    experationTime: Int
    maxSize: Int
}

input AlarmInput {
    name: String!
    topics: [String]!
    triggerFunction: String!
    actionFunction: String!
}

type Alarm {
    name: String
    topics: [String]
    triggerFunction: String
    actionFunction: String
}


type DataPacket {
    data: JSON
}

type BufferPacket {
    topic: String!
    created: Date!
    experationTime: Date!
    expires: Boolean!
    data: JSON!
}

type SuccessBoolean {
    success:Boolean!
}

type Subscription {
    mqttTopics(topics:[String]!):DataPacket!
}

type BufferInfo {
    topic: String!
    expires: Boolean!
    experationTime: Int
    sizeLimited: Boolean!
    maxSize: Int
}

type Query {
    user(id:ID!): User
    userByName(name:String!): [User]!
    users: [User]
    viewer: User
    runningBuffers: [BufferInfo]
    alarms: [Alarm]
    topicBuffer(topic:String): [BufferPacket]
}

type Mutation {
    signUp(input:SignUpInput!): SignUpPayload!
    signIn(input:SignInInput!): SignInPayload!
    signOut: Boolean!
    deleteMyself: DeleteUserPayload!
    deleteUser(id:ID!): DeleteUserPayload!
    mqttPublish(input:MQTTPublishInput!): SuccessBoolean!
    recordTopic(input:RecordTopicInput!): SuccessBoolean!
    deleteTopicBuffer(topic: String!): SuccessBoolean!
    setAlarm(input:AlarmInput!): SuccessBoolean!
    deleteAlarm(name:String!): SuccessBoolean!
}
`
export default typeDef;