import makeTestClient, { query, mutate } from './makeTestClient';
import { BufferQueryGQL, RecordTopicGQL, DeleteTopicGQL } from "../../../components/apollo/Buffers";

beforeAll(makeTestClient);

it('buffer query returns data', async () => {
    const res = await query({ query: BufferQueryGQL });
    expect(res.data).toBeDefined();
});

it('record and delete buffer works', async () => {
    const testBuffer = {
        topic: "__TEST_BUFFER__",
        maxSize: 2000,
        maxFreq: 1,
    };
    const rslt = await mutate({ mutation: RecordTopicGQL, variables: testBuffer });
    expect(rslt.data).toBeDefined();

    const res = await query({ query: BufferQueryGQL });
    expect(res.data).toBeDefined();
    if (res.data) {
        const thisBuf = res.data.find((buffer: any) => buffer.topic === testBuffer.topic);
        expect(thisBuf).toMatchObject(testBuffer);
    }
    const delRes = await mutate({ mutation: DeleteTopicGQL, variables: { topic: testBuffer.topic } });
    expect(delRes.data).toBeDefined();
});