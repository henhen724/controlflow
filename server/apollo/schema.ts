import "reflect-metadata";
import { buildSchema } from 'type-graphql';
import path from "path";

export default () => buildSchema({
  resolvers: [path.join(__dirname, "./resolvers/**.ts")]
});
