import { ApolloServer } from 'apollo-server';
import { createTestClient } from 'apollo-server-testing';
import dotenv from "dotenv";
import mongoose from "mongoose";

let server: any, query: any, mutate: any;
export { server, query, mutate };

const makeTestClient = () => {
    dotenv.config({ path: './.env.local' });
    mongoose.connect(`${process.env.MONGODB_PROTO}${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_DOMAIN}`, { useNewUrlParser: true, useUnifiedTopology: true });
    const schema = require("../server/apollo/schema");
    server = new ApolloServer({
        schema,
        context: (ctx) => {
            return {
                session: { id: '1', email: 'test@beep.com' },
                req: ctx.req,
                res: ctx.res,
            }
        },
    })
    const rslt = createTestClient(server);
    query = rslt.query;
    mutate = rslt.mutate;
}

beforeAll(makeTestClient);

it('test client starts up', () => {
    expect(server).toBeDefined();
    expect(query).toBeDefined();
    expect(mutate).toBeDefined();
})

export default makeTestClient;