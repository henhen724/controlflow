import { gql } from '@apollo/client';

const DataQuery = gql`
query DataQuery($topic:String!) {
    topicBuffer(topic:$topic) {
        data
    }
}
`

interface QRslt {
  topicBuffer: { data: Object }[]
}

const DataSubscription = gql`
subscription getData($topicList: [String]!) {
  mqttTopics(topics: $topicList) {
      data
  }
}
`

interface SubRslt {
  mqttTopics: { data: Object }
}

const SendMqttPacket = gql`
mutation sendData($topic:String!, $payload:JSON){
  mqttPublish(input:{topic:$topic, payload:$payload}) {
    success
  }
}
`

const GetDevices = gql`
query GetDevices {
  devices {
    uri
    deviceSchema
    name
    osName
    platform
  }
}
`

const SendDeviceRefresh = gql`
mutation SendDeviceRefresh{
  mqttPublish(input:{topic:"__widaq_req_info__", payload:{}}) {
    success
  }
}
`


const NavViewerQuery = gql`
  query NavViewerQuery {
    viewer {
        id
        email
    }
  }
`

const NotificationsQuery = gql`
query NotificationQuery{
    notifications{
        _id
        name
        message
        viewed
    }
}
`

const ViewNotification = gql`
mutation ViewNotification($id:String!){
    viewNotification(id:$id){
        success
    }
}
`
const NotificationSubscription = gql`
subscription NotificationSubscription{
    notificationChange {
      __typename
      ... on NotoInsert {
        fullDocument {
            _id
            name
            message
            viewed
        }
      }
      ... on NotoDelete {
        documentKey {
            _id
        }
      }
    }
}
`
