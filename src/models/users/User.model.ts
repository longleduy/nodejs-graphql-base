import { prop, getModelForClass } from '@typegoose/typegoose';

class User {
  @prop({ lowercase: true, trim: true, required: true, unique: true })
  username: string;

  @prop({ required: true })
  password: string;
}
const UserModel = getModelForClass(User, { schemaOptions: { timestamps: true } });
export { User, UserModel };
