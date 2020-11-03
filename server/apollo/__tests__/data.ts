import makeTestClient, { query, mutate } from './makeTestClient';
import { DataQueryGQL, ArchiveDataQueryGQL, DataSubscriptionGQL, SendMqttPacketGQL } from "../../../components/apollo/Data";

beforeAll(makeTestClient);

it('data query completes', async () => {
    const res = await query({ query: DataQueryGQL, variables: { topic: "TEST_TOPIC" } });
    expect(res.data).toBeDefined();
});

it('archive data query completes', async () => {
    const res = await query({ query: ArchiveDataQueryGQL, variables: { topic: "TEST_TOPIC" } });
    expect(res.data).toBeDefined();
});

it('mqtt publish packet completes', async () => {
    const res = await mutate({ mutation: SendMqttPacketGQL, variables: { topic: "TEST_TOPIC", payload: { msg: 'Hello' } } })
    expect(res.data).toBeDefined();
})