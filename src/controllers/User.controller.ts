// Models
import { User, UserModel } from '../models/users/User.model';
import { IUserData, IUserQuery } from '../models/users/IUser.model';

class UserController {
  public async addUser(iUserData: IUserData): Promise<User> {
    return await UserModel.create(iUserData);
  }

  public async findUser(iUserQuery: IUserQuery): Promise<User[] | null> {
    const userResult = await UserModel.find(iUserQuery as object);
    return userResult;
  }
}
export default UserController;
