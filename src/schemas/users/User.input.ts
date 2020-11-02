import { InputType, Field, Int } from 'type-graphql';
import { Validate, IsEmail } from 'class-validator';
// Validators
import Password from '../../utils/validators/Password.validator';

@InputType()
class UserInput {
  @Field()
  @IsEmail()
  username: string;

  @Field()
  @Validate(Password)
  password: string;
}

@InputType()
class SignInInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

export { UserInput, SignInInput };
