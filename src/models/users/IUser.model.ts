/* eslint-disable max-classes-per-file */
class UserData {
  username = '';

  password = '';

  password_no_hash? = '';
}

class UserQuery {
  username = '';
}

interface IUserData extends UserData {
}

interface IUserQuery extends UserQuery {
}

export {
  IUserData,
  IUserQuery,
  UserData,
  UserQuery,
};
