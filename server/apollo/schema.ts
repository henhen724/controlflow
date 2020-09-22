import "reflect-metadata";
import { buildSchema, emitSchemaDefinitionFile } from 'type-graphql';
import path from "path";

export default () => {
  if (process.env.NODE_ENV === "production") {
    return buildSchema({
      resolvers: [path.resolve(__dirname, "./resolvers/**(.ts|.js)")],
      emitSchemaFile: {
        path: path.resolve(__dirname, "../../../public/schema.gql"),
        commentDescriptions: true,
        sortedSchema: true,
      }
    });
  } else {
    return buildSchema({
      resolvers: [path.resolve(__dirname, "./resolvers/**(.ts|.js)")]
    });
  }
}
