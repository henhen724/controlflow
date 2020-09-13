import { makeExecutableSchema } from 'graphql-tools'
import typeDefs from './type-defs'
import { resolvers } from './resolvers/index'

export default makeExecutableSchema({
  typeDefs,
  resolvers,
})
