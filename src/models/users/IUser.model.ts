/* eslint-disable max-classes-per-file */
class UserData {
  username = '';

  password = '';

  password_no_hash? = '';
}

class UserQuery {
  username = '';
}

interface IUserData extends UserData {}

interface IUserQuery extends UserQuery {}

interface IClientBrowser {
  type: string;
  name: string;
  version: string;
  engine: string;
  engineVersion: string;
}

interface IClientOs {
  name: string;
  version: string;
  platform: string;
}

interface IClientDevice {
  type: string;
  brand: string;
  model: string;
}

interface IUserClientData {
  ip: string;
  userAgent: string;
  browser: IClientBrowser | null;
  os: IClientOs | null;
  device: IClientDevice | null;
}

interface IUserClientDataStore {
  _id: string;
  username: string;
  token: string;
}

export {
  IUserData,
  IUserQuery,
  UserData,
  UserQuery,
  IUserClientData,
  IClientBrowser,
  IClientDevice,
  IClientOs,
  IUserClientDataStore,
};
