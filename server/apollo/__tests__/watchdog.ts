import makeTestClient, { query, mutate } from './makeTestClient';
import { WatchdogsQueryGQL, SetWatchdogGQL, DeleteWatchdogGQL } from "../../../components/apollo/Watchdogs";

beforeAll(makeTestClient);

it('watchdog query returns data', async () => {
    const res = await query({ query: WatchdogsQueryGQL });
    expect(res).toHaveProperty("data");
});

it('set and delete watchdog works', async () => {
    const testWatchdog = {
        name: "__TEST_ALARM__",
        topics: ["notatopic"],
        messageString: "You should not see this",
    };
    expect(await mutate({ mutation: SetWatchdogGQL, variables: { input: testWatchdog } })).toHaveProperty("data");

    const res = await query({ query: WatchdogsQueryGQL });
    expect(res).toHaveProperty("data");
    if (res.data) {
        const thisWatchdog = res.data.find((alarm: any) => alarm.name === testWatchdog.name);
        expect(thisWatchdog).toMatchObject(testWatchdog);
    }
    expect(await mutate({ mutation: DeleteWatchdogGQL, variables: { name: testWatchdog.name } })).toHaveProperty("data");
});