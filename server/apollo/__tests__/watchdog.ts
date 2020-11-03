import makeTestClient, { query, mutate } from './makeTestClient';
import { WatchdogsQueryGQL, SetWatchdogGQL, DeleteWatchdogGQL } from "../../../components/apollo/Watchdogs";

beforeAll(makeTestClient);

it('watchdog query returns data', async () => {
    const res = await query({ query: WatchdogsQueryGQL });
    expect(res.data).toBeDefined();
});

it('set and delete watchdog works', async () => {
    const testWatchdog = {
        name: "__TEST_ALARM__",
        topics: ["notatopic"],
        messageString: "You should not see this",
    };
    const res = await mutate({ mutation: SetWatchdogGQL, variables: testWatchdog });
    expect(res.data).toBeDefined();

    const queryRes = await query({ query: WatchdogsQueryGQL });
    expect(queryRes.data).toBeDefined();
    if (queryRes.data) {
        const thisWatchdog = queryRes.data.watchdogs.find((alarm) => alarm.name === testWatchdog.name);
        expect(thisWatchdog).toMatchObject(testWatchdog);
    }
    const delRes = await mutate({ mutation: DeleteWatchdogGQL, variables: { name: testWatchdog.name } })
    expect(delRes.data).toBeDefined();
});