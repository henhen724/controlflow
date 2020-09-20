import makeTestClient, { query, mutate } from './makeTestClient';
import { BufferQueryGQL, RecordTopicGQL, DeleteTopicGQL } from "../../../components/apollo/Buffers";

beforeAll(makeTestClient);

it('buffer query returns data', async () => {
    const res = await query({ query: BufferQueryGQL });
    expect(res).toHaveProperty("data");
});

it('record and delete buffer works', async () => {
    const testBuffer = {
        topic: "__TEST_BUFFER__",
        maxSize: 2000
    };
    expect(await mutate({ mutation: RecordTopicGQL, variables: { input: testBuffer } })).toHaveProperty("data");

    const res = await query({ query: BufferQueryGQL });
    expect(res).toHaveProperty("data");
    if (res.data) {
        const thisBuf = res.data.find((buffer: any) => buffer.topic === testBuffer.topic);
        expect(thisBuf).toMatchObject(testBuffer);
    }
    expect(await mutate({ mutation: DeleteTopicGQL, variables: { topic: testBuffer.topic } })).toHaveProperty("data");
});