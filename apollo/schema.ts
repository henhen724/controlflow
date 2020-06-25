import { makeExecutableSchema } from 'graphql-tools'
import typeDefs from './type-defs'
import { resolvers } from './resolvers'

export default makeExecutableSchema({
  typeDefs,
  resolvers,
})
