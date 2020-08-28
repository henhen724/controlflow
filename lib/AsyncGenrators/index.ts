import { EventEmitter } from 'events';

async function* stream(emitter: EventEmitter, event: string, filter: (change: any) => boolean) {
    const pushQueue = [] as ((change: any) => void)[];
    const pullQueue = [] as ((change: any) => void)[];
    emitter.on(event, (change: any) => {
        if (filter(change)) {
            const nextResolve = pullQueue.shift();
            if (nextResolve) {
                nextResolve(change);
            } else {
                pushQueue.push(change);
            }
        }
    });

    const pullValue = () => new Promise(resolve => {
        const nextEvent = pushQueue.shift();
        if (nextEvent) {
            resolve(nextEvent);
        } else {
            pullQueue.push(resolve);
        }
    })

    while (true) {
        yield pullValue();
    }
}

export default stream;