import gqlCustomTypes from './gQLtypes';
import Subscription from './subscription';
import Query from './query';
import Mutation from './mutation';


export const resolvers = {
  ...gqlCustomTypes,
  Subscription,
  Query,
  Mutation,
}
