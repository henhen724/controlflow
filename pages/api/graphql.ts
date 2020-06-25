import { ApolloServer } from 'apollo-server-micro';
import schema from '../../apollo/schema';
import dbConnect from '../../lib/dbConnect';


const apolloServer = new ApolloServer({
  schema: schema,
  context: async ctx => {
    return ctx;
  },
})

export const config = {
  api: {
    bodyParser: false,
  },
}

const apolloHandler = apolloServer.createHandler({ path: '/api/graphql' });

const wrapedHandler = async (req, res) => {
  await dbConnect();

  return await apolloHandler(req, res);
}

export default wrapedHandler;
