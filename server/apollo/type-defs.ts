import { gql } from 'apollo-server-express';

const typeDef = gql`

scalar Timestamp

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

input WatchdogInput {
    name: String!
    topics: [String]!
    messageString: String!
}

type Watchdog {
    name: String
    topics: [String]
    messageString: String
}


type DataPacket {
    data: JSON
}

type BufferPacket {
    topic: String!
    created: Timestamp!
    experationTime: Timestamp!
    expires: Boolean!
    data: JSON!
}

type SuccessBoolean {
    success:Boolean!
    message:String
}

type BufferInfo {
    topic: String!
    expires: Boolean!
    experationTime: Int
    sizeLimited: Boolean!
    maxSize: Int
    currSize: Int
}

enum ChangeType {
    insert
    delete
}

type Notification {
    _id: String!
    name: String
    topic: String
    message: String
    mqttMessage: String
    recieved: Timestamp!
    viewed: Boolean
}

type NotoInsert {
    fullDocument: Notification!
}

type documentKey {
    _id: String!
}

type NotoDelete {
    documentKey: documentKey!
}

union NotoChange  = NotoInsert | NotoDelete

type Subscription {
    mqttTopics(topics:[String]!):DataPacket!
    notificationChange: NotoChange
}

type Query {
    user(id:ID!): User
    userByName(name:String!): [User]!
    users: [User]
    viewer: User
    runningBuffers: [BufferInfo]
    watchdogs: [Watchdog]
    topicBuffer(topic:String): [BufferPacket]
    notifications: [Notification]
    notificationById(id:String): Notification
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
    setWatchdog(input:WatchdogInput!): SuccessBoolean!
    deleteWatchdog(name:String!): SuccessBoolean!
    viewNotification(id:String!): SuccessBoolean!
    deleteNotification(id:String!): SuccessBoolean!
}
`
export default typeDef;