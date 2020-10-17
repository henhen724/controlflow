import makeTestClient, { query, mutate } from './makeTestClient';
import { DataQueryGQL, DataSubscriptionGQL, SendMqttPacketGQL } from "../../../components/apollo/Data";

beforeAll(makeTestClient);

it('data query completes', async () => {
    const res = await query({ query: DataQueryGQL, variables: { topic: "TEST_TOPIC" } });
    expect(res).toHaveProperty("data");
});

it('mqtt publish packet completes', async () => {
    expect(await mutate({ mutation: SendMqttPacketGQL, variables: { topic: "TEST_TOPIC", packet: { msg: 'Hello' } } })).toHaveProperty("data");
});