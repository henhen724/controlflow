import { ApolloServer } from 'apollo-server';
import { createTestClient } from 'apollo-server-testing';
import dotenv from "dotenv";
import mongoose from "mongoose";
import chai from "chai";

const expect = chai.expect;
const should = chai.should();

let server: any, query: any, mutate: any;
export { server, query, mutate };

const makeTestClient = () => {
    dotenv.config({ path: './.env.local' });
    mongoose.connect(`${process.env.MONGODB_PROTO}${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_DOMAIN}`);
    const schema = require("../../server/apollo/schema");
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
    should.exist(server);
    should.exist(query);
    should.exist(mutate);
})

export default makeTestClient;