import { Resolver, Query, UseMiddleware, Arg, Ctx, Mutation } from 'type-graphql';
// Constants
import { errorConstant } from '../constants/index';
// Middlewares
import { LogAccess } from '../middlewares/Logger.middleware';
import { AuthenticationMiddleware } from '../middlewares/Authentication.middleware';
// Errors
import CustomError from '../utils/errors/CustomError.error';
// Utils
import ConvertUtil from '../utils/Convert.util';
import SecureUtil from '../utils/Secure.util';
// Schemas
import { UserInfo, UserDataResponse } from '../schemas/users/User.object';
import { UserInput, SignInInput } from '../schemas/users/User.input';
// Controllers
import UserController from '../controllers/User.controller';
// Models
import { IUserData, IUserQuery, UserData } from '../models/users/IUser.model';
import { User } from '../models/users/User.model';
import ContextInfo from '../models/Context.model';
import Payload from '../models/Payload.model';
import { ISession } from '../models/ISession.model';

Resolver();
class UserResolver {
  userController = new UserController();

  @UseMiddleware(LogAccess)
  @Mutation((returns) => UserInfo)
  async createUser(@Arg('userInput') userInput: UserInput, @Ctx() { req, res }: ContextInfo): Promise<UserInfo> {
    const session = req.session as ISession;
    const userData: IUserData = ConvertUtil.copyInterface(UserData, userInput);
    userData.password_no_hash = userData.password;
    userData.password = await SecureUtil.hashPassWordAsync(userData.password);
    const userResult = await this.userController.addUser(userData);
    return ConvertUtil.toGraphQlClass(UserInfo, userResult);
  }

  @UseMiddleware(LogAccess)
  @Mutation((returns) => UserInfo)
  async signIn(@Arg('signInInput') signInInput: SignInInput, @Ctx() { req }: ContextInfo): Promise<UserInfo> {
    const iUserQuery: IUserQuery = {
      username: signInInput.username,
    };
    const userResult = await this.userController.findUser(iUserQuery);
    if (userResult === null || userResult.length === 0) {
      throw new CustomError(errorConstant.USER_NOT_EXIST_ERROR);
    }
    const isPasswordValid = await SecureUtil.comparePassWordAsync(signInInput.password, userResult[0].password);
    if (!isPasswordValid) {
      throw new CustomError(errorConstant.PASSWORD_INVALID_ERROR);
    }
    const payload = new Payload();
    payload.username = userResult[0].username;
    const token = SecureUtil.generateToken(payload);
    const session = req.session as ISession;
    // @ts-ignore
    session._id = userResult[0]._id;
    session.username = userResult[0].username;
    session.token = token;
    const userInfo = new UserInfo();
    userInfo.token = token;
    return userInfo;
  }

  @UseMiddleware(LogAccess, AuthenticationMiddleware)
  @Query((returns) => UserDataResponse)
  async getProfile(@Ctx() { req }: ContextInfo): Promise<UserData | null> {
    const username: string = await SecureUtil.getUsernameFromToken(req);
    const users: User[] | null = await this.userController.findUser({ username });
    const user: IUserData | null = users ? users[0] : null;
    return user;
  }
}
export { UserResolver };
