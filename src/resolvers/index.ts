import { UserResolver } from './User.resolver';
import { DefaultResolver } from './Default.resolver';

export default [UserResolver, DefaultResolver] as const;
