/* eslint-disable @typescript-eslint/no-inferrable-types */
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
class UserInfo {
  @Field()
  username: string = '-string';

  @Field({ nullable: true })
  token: string;
}
export { UserInfo };
