import { InterfaceType, Field } from 'type-graphql';

@InterfaceType()
class IResponseStatus {
  @Field()
  code: number = 200;

  @Field()
  message: string = 'SUCCESS';
}
export { IResponseStatus };
