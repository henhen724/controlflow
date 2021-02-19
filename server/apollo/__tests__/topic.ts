import makeTestClient, { query, mutate } from './makeTestClient';
import { TopicsQueryGQL } from "../../../components/apollo/Topics";

beforeAll(makeTestClient);

it('buffer query returns data', async () => {
    const res = await query({ query: TopicsQueryGQL });
    expect(res.data).toBeDefined();
});

// it('record and delete buffer works', async () => {
//     const testBuffer = {
//         topic: "__TEST_BUFFER__",
//     };
//     const rslt = await mutate({ mutation: ArchiveTopicGQL, variables: testBuffer });
//     expect(rslt.data).toBeDefined();

//     const res = await query({ query: ArchiveQueryGQL });
//     expect(res.data).toBeDefined();
//     if (res.data) {
//         const thisBuf = res.data.find((buffer: any) => buffer.topic === testBuffer.topic);
//         expect(thisBuf).toMatchObject(testBuffer);
//     }
//     const delRes = await mutate({ mutation: DeleteTopicArchiveGQL, variables: { topic: testBuffer.topic } });
//     expect(delRes.data).toBeDefined();
// });