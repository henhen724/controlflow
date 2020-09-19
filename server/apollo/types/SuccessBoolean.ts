import "reflect-metadata";
import { ObjectType, Field, ID, Int } from "type-graphql";

@ObjectType()
class SuccessBoolean {
    @Field()
    success: boolean;
    @Field({ nullable: true })
    message?: string;
}

export default SuccessBoolean;